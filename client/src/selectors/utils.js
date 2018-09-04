import type {NewEntityDetail} from '../state'

export const hasTradeWithState = (entityDetails: ?NewEntityDetail): boolean => {
  return entityDetails && (
    entityDetails.contracts != null ||
    entityDetails.notices != null ||
    entityDetails.eufunds != null)
}
