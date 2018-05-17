// @flow
import {dispatchReceivedData} from './dataProvidersUtils'

// TODO create generic function
export const politiciansProvider = () => ({
  ref: 'politicians',
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/list_politicians?cachebreak`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'list']],
  keepAliveFor: 10 * 60 * 1000,
})

export const cadastralInfoProvider = (id: string) => ({
  ref: `politician-cadastral-info-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/kataster_info_politician?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'cadastral']],
  keepAliveFor: 10 * 60 * 1000,
})

export const detailsProvider = (id: string) => ({
  ref: `politician-details-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/info_politician?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'list']],
  keepAliveFor: 10 * 60 * 1000,
})

export const assetDeclarationProvider = (id: string) => ({
  ref: `asset-declaration-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/asset_declarations?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'assetDeclarations']],
  keepAliveFor: 10 * 60 * 1000,
})
