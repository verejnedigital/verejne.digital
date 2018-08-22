// @flow
import type {CompanyEntity, NewEntityDetail} from '../../state'

export const isPolitician = (entity: CompanyEntity): boolean => {
  return entity.ds && !!entity.ds[0]
}

export const hasContractsWithState = (entity: CompanyEntity): boolean => {
  return entity.ds && entity.ds[1] > 0
}

export const hasTradeWithState = (entityDetails: ?NewEntityDetail): boolean => {
  return entityDetails && (
    entityDetails.contracts != null ||
    entityDetails.notices != null ||
    entityDetails.eufunds != null)
}
