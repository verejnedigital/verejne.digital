// entity which is a number is individual, district starts with letter
export const isIndividual = (eid) => {
  return '0123456789'.indexOf(eid[0]) === -1
}

export const isPolitician = (entity) => {
  return entity.ds && entity.ds[0] === 1
}

export const hasContractsWithState = (entity) => {
  return entity.ds && isIndividual(entity.eid) && entity.ds[1] > 0
}
