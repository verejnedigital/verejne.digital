"""Create JSONs for income graphs for each politician."""

from collections import defaultdict
import urllib, json

LOG_PREFIX = '[post_process_income_graph] '

URL_ASSET = "https://verejne.digital/api/k/asset_declarations?id={}&aba"
URL_LIST_POLITICIANS = "https://verejne.digital/api/k/list_politicians?group=active"
PARSED_INCOME = 'parsed_income'
YEAR = 'year'
FIRSTNAME = 'firstname'
SURNAME = 'surname'
ID = 'id'
PARTY = 'party_nom'
OFFICE_NAME = 'office_name_male'
POSLANEC_NRSR = 'Poslanec NRSR'
PLOTS_FOLDER = 'plots/'
N_CANDIDATES = 5
YEARS_TO_IGNORE = [2011]
DEFAULT_BACKGROUND_IDS = (40, 169, 448, 760, 828, 252)
ASSET_FIELDS = (ID, PARSED_INCOME, YEAR)


# def get_incomes(db):
#   query = """
#   SELECT {}, {}, {}
#   FROM assetdeclarations
#   """.format(*ASSET_FIELDS)

#   incomes = defaultdict(list)
#   with db.get_server_side_cursor(query) as cur:
#     for row in cur:
#       incomes[row[0]].append(dict(zip(ASSET_FIELDS[1:], row[1:])))
#   return incomes

def get_incomes(jsons_politicians):
  return {politician[ID]: get_json(URL_ASSET.format(politician[ID])) for politician in jsons_politicians}

def get_json(url):
    content = urllib.urlopen(url).read()
    try:
        return json.loads(content)
    except:
        return None


def get_year_income(assets):
    if assets is None:
        return None
    else:
        return {
            YEAR: [asset[YEAR] for asset in assets if asset[YEAR] not in YEARS_TO_IGNORE],
            PARSED_INCOME: [asset[PARSED_INCOME] for asset in assets if asset[YEAR] not in YEARS_TO_IGNORE]}


def sort_ids_n_incomes(ids, incomes):
    n_incomes = {i: len(incomes[i]) for i in ids}
    sorted_n_incomes = sorted(n_incomes.items(), key=lambda x: -x[1])
    n_candidates = min(len(sorted_n_incomes), N_CANDIDATES)
    return [i for i, _ in sorted_n_incomes[:n_candidates]]


def get_merged_groups(politicians):
    positions = defaultdict(list)
    for person in politicians:
        key = person[OFFICE_NAME]
        if key.lower() == POSLANEC_NRSR.lower():
            key = person[PARTY]
        positions[key].append(person)

    groups = defaultdict(lambda: defaultdict(list))
    for key, val in positions.items():
        tokens = key.lower().split(" ")
        if len(tokens) == 1:
            tokens.append("")
        groups[tokens[0]][tokens[1]].extend([person[ID] for person in val])

    merged_groups = defaultdict(list)
    for k1, v1 in groups.items():
        for k2, v2 in v1.items():
            if len(v2) >= N_CANDIDATES:
                merged_groups[(k1 + " " + k2).strip()].extend(v2)
            else:
                merged_groups[k1].extend(v2)
    return merged_groups


def add_defaults_to_group(group, selected):
    i = 0
    while len(group) < N_CANDIDATES:
        candidate = DEFAULT_BACKGROUND_IDS[i]
        if candidate not in group and candidate != selected:
            group.append(candidate)
        i += 1


def get_background_ids(politician, merged_groups, incomes):
    group = [name for name in merged_groups if politician[ID] in merged_groups[name]][0]
    rest_of_group = [i for i in merged_groups[group] if i != politician[ID]]
    add_defaults_to_group(rest_of_group, politician[ID])
    return sort_ids_n_incomes(rest_of_group, incomes)


def get_name(politician):
    return politician[FIRSTNAME] + " " + politician[SURNAME]


def get_line_dict(x, y, name, width, size):
    return dict(
        x=x,
        y=y,
        name=name,
        mode="lines+markers",
        line=dict(width=width),
        marker=dict(size=size),
        type='scatter'
    )


def get_layout_dict():
    return dict(
        legend=dict(orientation="h"),
        yaxis=dict(
            exponentformat="none",
            ticksuffix=u"\u20AC",
            tickangle=-45
        )
    )


def get_figure_dict(selected, incomes, politicians):
    data = [get_line_dict(
        x=income[YEAR],
        y=income[PARSED_INCOME],
        name=get_name(politicians[key]),
        width=0.4,
        size=3
    ) for key, income in incomes.items() if key != selected]
    data.append(get_line_dict(
        x=incomes[selected][YEAR],
        y=incomes[selected][PARSED_INCOME],
        name=get_name(politicians[selected]),
        width=2,
        size=10
    ))
    return dict(
        data=data,
        layout=get_layout_dict()
    )


def generate_figure_json(selected, incomes, politicians, merged_groups):
    ids = get_background_ids(politicians[selected], merged_groups, incomes)
    relevant_incomes = {key: get_year_income(val) for key, val in incomes.items() if key in ids or key == selected}
    return json.dumps(get_figure_dict(selected, relevant_incomes, politicians))


def add_income_graphs(db):
  print(LOG_PREFIX + "Started fetching data.")
  jsons_politicians = get_json(URL_LIST_POLITICIANS)
  politicians = {politician[ID]: politician for politician in jsons_politicians}
  incomes_politicians = get_incomes(jsons_politicians)
  print(LOG_PREFIX + "Data fetching finished. Starting to generate jsons for plots.")
  merged_groups = get_merged_groups(jsons_politicians)
  json_plots = [
    (key, generate_figure_json(key, incomes_politicians, politicians, merged_groups))
    for key in incomes_politicians]
  print(LOG_PREFIX + "Generating finished. Starting to store results.")

  query = """
    DROP TABLE IF EXISTS income_graphs_jsons;

    CREATE TABLE income_graphs_jsons(
      id                    serial   PRIMARY KEY,
      person_id             int      NOT NULL,
      json_plot             text     NOT NULL
    );
  """

  db.execute(query)

  print(LOG_PREFIX + "Table created.")

  with db.cursor() as cur:
    q = """
      INSERT INTO income_graphs_jsons(person_id, json_plot)
      VALUES (%s, %s);
      """
    cur.executemany(q, json_plots)
