/* Creates post-processing tables `entity_flags` and `address_flags`.

The post-processing table `entity_flags` contains pre-computed
indicators for each entity, such as whether it has traded with the
government, is a political entity, or is related to one.

The post-processing table `address_flags` contains the same
pre-computed values, but on the level of addresses. These flags are
used in determining the way a particular address is rendered on the
map.

This SQL script is invoked by `post_process.py` and assumes that the
`search_path` has been set to the production schema being generated
(post-processed).
*/

-- Temporary table listing eid's corresponding to political entities:
CREATE TABLE political_entities AS (
  SELECT
    entities.id AS eid
  FROM
    entities
  LEFT JOIN companyinfo ON companyinfo.eid=entities.id
  LEFT JOIN profilmapping ON profilmapping.eid=entities.id
  WHERE
    -- companyinfo.ico=0 OR
    companyinfo.legal_form_id=254 OR
    profilmapping.eid IS NOT NULL
);

-- Temporary table listing eid's related to a political entity:
CREATE TABLE political_contacts AS (
  SELECT
    DISTINCT(eid_relation) AS eid
  FROM related
  INNER JOIN political_entities ON political_entities.eid=related.eid
);

/* Create the table `entity_flags`.
   (Note: it may already exist when running post processing only in
    test mode, on an existing production schema. */
CREATE TABLE IF NOT EXISTS entity_flags(
  eid                   INT      PRIMARY KEY REFERENCES entities(id),
  trade_with_government BOOLEAN,
  political_entity      BOOLEAN,
  contact_with_politics BOOLEAN
);
DELETE FROM entity_flags;

INSERT INTO entity_flags
  SELECT
    entities.id AS eid,
    (COUNT(notices.supplier_eid) +
      COUNT(contracts.supplier_eid) +
      COUNT(eufunds.eid) >= 1)
      AS trade_with_government,
    COUNT(political_entities.eid) >= 1 AS political_entity,
    COUNT(political_contacts.eid) >= 1 AS contact_with_politics
  FROM entities
  LEFT JOIN notices ON notices.supplier_eid=entities.id
  LEFT JOIN contracts ON contracts.supplier_eid=entities.id
  LEFT JOIN eufunds ON eufunds.eid=entities.id
  LEFT JOIN political_entities ON political_entities.eid=entities.id
  LEFT JOIN political_contacts ON political_contacts.eid=entities.id
  GROUP BY entities.id
;

/* Create the table `address_flags`.
   (Note: it may already exist when running post processing only in
    test mode, on an existing production schema. */
CREATE TABLE IF NOT EXISTS address_flags(
  address_id            INT      PRIMARY KEY REFERENCES address(id),
  trade_with_government BOOLEAN,
  political_entity      BOOLEAN,
  contact_with_politics BOOLEAN
);
DELETE FROM address_flags;

INSERT INTO address_flags
  SELECT
    address.id,
    bool_or(COALESCE(entity_flags.trade_with_government, FALSE))
      AS trade_with_government,
    bool_or(COALESCE(entity_flags.political_entity, FALSE))
      AS political_entity,
    bool_or(COALESCE(contact_with_politics, FALSE))
      AS contact_with_politics
  FROM
    address
  LEFT JOIN
    entities ON entities.address_id=address.id
  LEFT JOIN
    entity_flags ON entity_flags.eid=entities.id
  GROUP BY
    address.id
;

-- Drop the temporary tables.
DROP TABLE political_entities;
DROP TABLE political_contacts;
