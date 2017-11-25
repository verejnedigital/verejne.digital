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
    fetch(`api/v/profil/search?q=${query}`, {
      accept: 'application/json',
    }).then(checkStatus)
      .then(parseJSON)
      .then(cb);
  }
  