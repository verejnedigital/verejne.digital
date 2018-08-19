// @flow
import type {CompanyEntity} from '../../state'

// entity which is a number is individual, district starts with letter
export const isIndividual = (eid: string): boolean => {
  return '0123456789'.indexOf(eid[0]) === -1
}

export const isPolitician = (entity: CompanyEntity): boolean => {
  return entity.ds && !!entity.ds[0]
}

export const hasContractsWithState = (entity: CompanyEntity): boolean => {
  return entity.ds && isIndividual(entity.eid) && entity.ds[1] > 0
}
