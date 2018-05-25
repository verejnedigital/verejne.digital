// @flow
import type {Entity} from '../../state'

// entity which is a number is individual, district starts with letter
export const isIndividual = (eid: string): boolean => {
  return '0123456789'.indexOf(eid[0]) === -1
}

export const isPolitician = (entity: Entity): boolean => {
  // TODO: == is on purpose as this field can be: null, 0, true...
  return entity.ds && entity.ds[0] == 1
}

export const hasContractsWithState = (entity: Entity): boolean => {
  return entity.ds && isIndividual(entity.eid) && entity.ds[1] > 0
}
