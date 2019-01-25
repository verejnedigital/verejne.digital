// @flow
import {dispatchReceivedData} from './dataProvidersUtils'
import {DEFAULT_PROVIDER_KEEP_ALIVE} from '../constants'
import {loadImageAsync, mapArrayToId, mapObjToId} from '../utils'

import type {CadastralData} from '../state'

const getIdFromCadastralData = (cd: CadastralData) =>
  `${cd.cadastralunitcode}-${cd.foliono}-${cd.landusename || 'nedefinovane'}`

export const politiciansProvider = (group: string) => ({
  ref: `politicians-${group}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/list_politicians?group=${group}&`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'list', group]],
  keepAliveFor: DEFAULT_PROVIDER_KEEP_ALIVE,
})

export const cadastralInfoProvider = (id: string, needed: boolean = true) => ({
  ref: `politician-cadastral-info-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/kataster_info_politician?id=${id}&cachebreak1`,
    {
      accept: 'application/json',
    },
  ],
  onData: [
    dispatchReceivedData,
    ['profile', 'cadastral'],
    mapArrayToId,
    id,
    getIdFromCadastralData,
  ],
  keepAliveFor: DEFAULT_PROVIDER_KEEP_ALIVE,
  needed,
})

export const detailsProvider = (id: string) => ({
  ref: `politician-details-${id}`,
  getData: [
    fetch,
    `${process.env.REACT_APP_API_URL || ''}/api/k/info_politician?id=${id}&cachebreak1`,
    {
      accept: 'application/json',
    },
  ],
  onData: [dispatchReceivedData, ['profile', 'details'], mapObjToId, id],
  keepAliveFor: DEFAULT_PROVIDER_KEEP_ALIVE,
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
  onData: [dispatchReceivedData, ['profile', 'assetDeclarations'], mapArrayToId, id, 'year'],
  keepAliveFor: DEFAULT_PROVIDER_KEEP_ALIVE,
  needed,
})

const imageSrcOnData = (receiveImageSrc: (string) => void) => (ref: string, img: Image) =>
  receiveImageSrc(img.src)

// attempts to load image, provides src if it exists, otherwise nothing is received
// cachebreak is a hotfix, without it the same src can't be used with different receiveImageSrc
// TODO think of a better way to do it, without 'cachebreak'
export const imageSrcProvider = (
  src: string,
  receiveImageSrc: (string) => void,
  cachebreak: string
) => ({
  ref: `image:${src}${cachebreak}`,
  getData: [loadImageAsync, src],
  responseHandler: (img: Image) => img,
  onData: [imageSrcOnData, receiveImageSrc],
  needed: false,
})
