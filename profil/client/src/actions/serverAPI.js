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

export function listPoliticians(cb) {
  fetch(`/api/k/list_politicians`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

export function katasterInfo(id, cb) {
  fetch(`/api/k/kataster_info_politician?id=${id}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
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
  fetch(`/api/k/asset_declaration?id=${id}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}