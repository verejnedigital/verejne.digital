// @flow
import type {CompanyEntity} from '../../state'

export const isPolitician = (entity: CompanyEntity): boolean => {
  return entity.ds && !!entity.ds[0]
}

export const hasContractsWithState = (entity: CompanyEntity): boolean => {
  return entity.ds && entity.ds[1] > 0
}
