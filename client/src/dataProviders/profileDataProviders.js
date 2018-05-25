// @flow
import {dispatchReceivedData} from './dataProvidersUtils'
import {defaultProviderKeepAlive} from '../constants'
import {loadImageAsync, mappingFn} from '../utils'

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
  keepAliveFor: defaultProviderKeepAlive,
})

export const cadastralInfoProvider = (id: string, needed: boolean = true) => ({
  ref: `politician-cadastral-info-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/kataster_info_politician?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'cadastral'], mappingFn, 'parcelno', id],
  keepAliveFor: defaultProviderKeepAlive,
  needed,
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
  onData: [dispatchReceivedData, ['profile', 'details'], mappingFn, undefined, id],
  keepAliveFor: defaultProviderKeepAlive,
})

export const assetDeclarationProvider = (id: string, needed: boolean = true) => ({
  ref: `asset-declaration-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/asset_declarations?id=${id}`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'assetDeclarations'], mappingFn, 'year', id],
  keepAliveFor: defaultProviderKeepAlive,
  needed,
})

const imageSrcOnData = (receiveImageSrc: (string) => void) => (ref: string, img: Image) =>
  receiveImageSrc(img.src)

// attempts to load image, provides src if it exists, otherwise nothing is received
export const imageSrcProvider = (src: string, receiveImageSrc: (string) => void) => ({
  ref: `image:${src}`,
  getData: [loadImageAsync, src],
  responseHandler: (img: Image) => img,
  onData: [imageSrcOnData, receiveImageSrc],
  needed: false,
})
