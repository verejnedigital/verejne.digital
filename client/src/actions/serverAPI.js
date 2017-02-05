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


export function searchEntity(query, cb) {
  fetch(`searchEntity?text=${query}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

export function connection(eid1, eid2, cb) {
  fetch(`connection?eid1=${eid1}&eid2=${eid2}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

export function getInfo(eid, cb) {
  fetch(`getInfo?eid=${eid}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}
