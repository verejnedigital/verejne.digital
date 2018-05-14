function checkStatus(response) {
  if (response.status === 200) {
    return response
  }
  const error = new Error(`HTTP Error ${response.statusText}`)
  error.status = response.statusText
  error.response = response
  console.log(error) // eslint-disable-line no-console
  throw error
}

function parseJSON(res) {
  return res.json()
}

function compareCadastralForSameLandUse(a, b) {
  if (a.cadastralunitcode < b.cadastralunitcode) return -1
  if (a.cadastralunitcode > b.cadastralunitcode) return 1
  if (a.foliono < b.foliono) return -1
  if (a.foliono > b.foliono) return 1
  if (a.parcelno < b.parcelno) return -1
  if (a.parcelno > b.parcelno) return 1
  return 0
}

function compareCadastral(a, b) {
  if (a.landusename === b.landusename) return compareCadastralForSameLandUse(a, b)
  const plocha = 'Zastavaná plocha a nádvorie'
  if (a.landusename === plocha) return -1
  if (b.landusename === plocha) return 1
  if (a.landusename < b.landusename) return -1
  if (a.landusename > b.landusename) return 1
  return 0 //toto bolo pridane
}

function sortCadastralInfo(res) {
  return res.sort(compareCadastral)
}

function mergeParcely(res) {
  const newRes = []
  let lastIndex = -1
  for (let i = 0; i < res.length; i++) {
    if (
      lastIndex >= 0 &&
      res[i].cadastralunitcode === res[lastIndex].cadastralunitcode &&
      res[i].foliono === res[lastIndex].foliono
    ) {
      res[lastIndex].parcelno = `${res[lastIndex].parcelno}, ${res[i].parcelno}`
    } else {
      lastIndex = i
      newRes.push(res[i])
    }
  }
  return newRes
}

function comparePolitician(a, b) {
  if (a.num_houses_flats > b.num_houses_flats) return -1
  if (a.num_houses_flats < b.num_houses_flats) return 1
  if (a.num_fields_gardens > b.num_fields_gardens) return -1
  if (a.num_fields_gardens < b.num_fields_gardens) return 1
  if (a.num_others > b.num_others) return -1
  if (a.num_others < b.num_others) return 1
  if (a.surname < b.surname) return -1
  if (a.surname > b.surname) return 1
  return 0
}

function sortListPoliticians(res) {
  res = res.sort(comparePolitician)
  for (let i = 0; i < res.length; i++) {
    res[i].order = i + 1
  }
  return res
}

export function listPoliticians(cb) {
  fetch(`${process.env.REACT_APP_API_URL || ''}/api/k/list_politicians?cachebreak`, {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(sortListPoliticians)
    .then(cb)
}

export function cadastralInfo(id, cb) {
  fetch(`${process.env.REACT_APP_API_URL || ''}/api/k/kataster_info_politician?id=${id}`, {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(sortCadastralInfo)
    .then(mergeParcely)
    .then(cb)
}

export function loadPoliticiant(id, cb) {
  fetch(`${process.env.REACT_APP_API_URL || ''}/api/k/info_politician?id=${id}`, {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb)
}

export function loadAssetDeclaration(id, cb) {
  fetch(`${process.env.REACT_APP_API_URL || ''}/api/k/asset_declarations?id=${id}`, {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(cb)
}
