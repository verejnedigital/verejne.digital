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

export function getObstaravaniaList(cb) {
  fetch('/api/o/list_obstaravania', {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

export function getObstaravanieInfo(id, cb) {
  fetch(`/api/o/info_obstaravanie?id=${id}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

export function searchEntity(query, cb) {
    fetch(`api/v/searchEntity?text=${query}`, {
        accept: 'application/json',
    }).then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

export function getEntityConnection(eid1, eid2, cb) {
    fetch(`api/p/connection?eid1=${eid1}&eid2=${eid2}`, {
        accept: 'application/json',
    }).then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

export function subgraph(eid1, eid2, cb) {
    fetch(`api/p/subgraph?eid1=${eid1}&eid2=${eid2}`, {
        accept: 'application/json',
    }).then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

export function getEntityInfo(eid, cb) {
    fetch(`api/v/getInfo?eid=${eid}`, {
        accept: 'application/json',
    }).then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

export function getEntityRelated(eid, cb) {
    fetch(`api/v/getRelated?eid=${eid}`, {
        accept: 'application/json',
    }).then(checkStatus)
        .then(parseJSON)
        .then(cb);
}