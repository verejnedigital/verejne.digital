// Entity which is a number is individual.
// District starts with letter
export const isIndividual = (eid) => {
  return !isNaN(parseFloat(eid)) && isFinite(eid)
}

export const isPolitician = (entity) => {
  return entity.ds != null && entity.ds.length >= 1 && entity.ds[0] === 1
}

export const hasContractsWithState = (entity) => {
  if (entity.ds != null && entity.ds.length >= 2 && isIndividual(entity.eid)) {
    if (entity.ds[1] > 0) return true
  }
  return false
}
