// @flow
import {getWarningSymbol} from './LegendSymbols'

import type {Notice} from '../../state'

export const expC = 2.7182818

export function getSuspectLevelLimit(obstaravanie: Notice, limit: number) {
  const c = limit > 0 ? limit + 1 : limit - 1
  return expC ** (obstaravanie.price_avg + c * obstaravanie.price_stdev)
}

export function getSuspectLevel(obstaravanie: Notice) {
  if (obstaravanie.price && obstaravanie.price_num && obstaravanie.price_num >= 5) {
    return (
      [1, 2, 3, -1, -2, -3].find((index) => {
        return index > 0
          ? obstaravanie.price > getSuspectLevelLimit(obstaravanie, index)
          : obstaravanie.price < getSuspectLevelLimit(obstaravanie, index)
      }) || 0
    )
  } else {
    return 0
  }
}

export function getWarning(item: Notice) {
  const suspect = getSuspectLevel(item)
  return suspect !== 0 ? getWarningSymbol(suspect) : null
}
