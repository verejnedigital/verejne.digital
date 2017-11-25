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