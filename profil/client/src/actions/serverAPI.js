function checkStatus(response) {
  if (response.status === 200) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(res) {
  return res.json();
}

function compareKatasterForSameLandUse(a, b) {
  if (a.cadastralunitcode < b.cadastralunitcode) return -1;
  if (a.cadastralunitcode > b.cadastralunitcode) return 1;
  if (a.foliono < b.foliono) return -1;
  if (a.foliono > b.foliono) return 1;
  if (a.parcelno < b.parcelno) return -1;
  if (a.parcelno > b.parcelno) return 1;
  return 0;
}

function compareKataster(a, b) {
  if (a.landusename === b.landusename) return compareKatasterForSameLandUse(a, b);
  var plocha = 'Zastavaná plocha a nádvorie';
  if (a.landusename === plocha) return -1;
  if (b.landusename === plocha) return 1;
  if (a.landusename < b.landusename) return -1;
  if (a.landusename > b.landusename) return 1;
}

function sortKatasterInfo(res) {
  return res.sort(compareKataster);
}

function mergeParcely(res) {
  var new_res = [];
  var last_index = -1;
  for (var i = 0; i < res.length; i++) {
    if (last_index >= 0 && res[i].cadastralunitcode === res[last_index].cadastralunitcode &&
      res[i].foliono === res[last_index].foliono) {
      res[last_index].parcelno = res[last_index].parcelno + ', ' + res[i].parcelno;
    } else {
      last_index = i;
      new_res.push(res[i]);
    }
  }
  return new_res;
}

function comparePolitician(a, b) {
  if (a.num_houses_flats > b.num_houses_flats) return -1;
  if (a.num_houses_flats < b.num_houses_flats) return 1;
  if (a.num_fields_gardens > b.num_fields_gardens) return -1;
  if (a.num_fields_gardens < b.num_fields_gardens) return 1;
  if (a.num_others > b.num_others) return -1;
  if (a.num_others < b.num_others) return 1;
  if (a.surname < b.surname) return -1;
  if (a.surname > b.surname) return 1;
  return 0;
}

function sortListPoliticians(res) {
  res = res.sort(comparePolitician);
  for (var i = 0; i < res.length; i++) {
    res[i].order = i + 1;
  }
  return res;
}

export function listPoliticians(cb) {
  fetch(`/api/k/list_politicians?mps_only=true`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(sortListPoliticians)
    .then(cb);
}

export function katasterInfo(id, cb) {
  fetch(`/api/k/kataster_info_politician?id=${id}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(sortKatasterInfo)
    .then(mergeParcely)
    .then(cb);
}

export function loadPoliticiant(id, cb) {
  fetch(`/api/k/info_politician?id=${id}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

export function loadAssetDeclaration(id, cb) {
  fetch(`/api/k/asset_declarations?id=${id}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
