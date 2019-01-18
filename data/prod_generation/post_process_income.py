"""Adds total income to all public figures."""

# String to prefix log messages with:
LOG_PREFIX = '[post_process_income] '


INCOME = 'income'
COMPENSATIONS = 'compensations'
OTHER_INCOME = 'other_income'
ALL_INCOMES = (INCOME, COMPENSATIONS, OTHER_INCOME)


def parse_money_part(money_part):
  tokens = money_part.split(" ")
  if len(tokens) == 1:  # currency is missing -> not a money value
    return None
  currency = tokens[-1]
  # fix spaces between numerals and possible newline characters
  value = int("".join(tokens[:-1]).replace(u"\xa0", ""))
  return value, currency


def parse_income_col(val, col):
  if not isinstance(val, str):
    return None
  parts = val.split(",")
  if col == OTHER_INCOME:  # the other parts do not contain incomes in this case
    parts = parts[:1]
  results = []
  for part in parts:
    money_part = part.split("(")[0].strip()  # discard the part in parenthesis
    result = parse_money_part(money_part)
    if result is not None:
      results.append(result)
  return results


def parse_income_row(row):
  total_income = 0
  currencies = []
  for i, col in enumerate(ALL_INCOMES):
    parsed_incomes = parse_income_col(row[i], col)
    if parsed_incomes is None:
      continue
    for result in parsed_incomes:
      total_income += result[0]
      currencies.append(result[1])
  assert len(set(currencies)) <= 1, "Too many currencies appearing in the row."
  return total_income, currencies[0] if currencies else None  # do not error on missing currency
    

def add_incomes(db):
  """Parse and add incomes to assets."""

  query = """
  SELECT id, {}, {}, {}
  FROM assetdeclarations
  """.format(*ALL_INCOMES)
    
  incomes = []
  with db.get_server_side_cursor(query) as cur:
    for row in cur:
      eid = row[0]
      income, currency = parse_income_row(row[1:])
      incomes.append((eid, income, currency))
    
  print('%sAccumulated %d incomes' % (LOG_PREFIX, len(incomes)))

  query = """
  CREATE TABLE incomes(
  id                    serial   PRIMARY KEY,
  asset_declaration_id  int      REFERENCES assetdeclarations(Id) NOT NULL,
  income                int      NOT NULL,
  currency              text     
  );"""

  db.execute(query)

  with db.cursor() as cur:
    q = """
      INSERT INTO incomes(asset_declaration_id, income, currency)
      VALUES (%s, %s, %s);
      """
    cur.executemany(q, incomes)
