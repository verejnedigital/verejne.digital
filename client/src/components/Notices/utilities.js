// @flow
import {getWarningSymbol} from './LegendSymbols'

import type {Notice} from '../../state'

export function getWarning(item: Notice) {
  return item.estimated_value_amount &&
    item.price_est_low &&
    item.price_est_high &&
    (item.estimated_value_amount < item.price_est_low ||
      item.estimated_value_amount > item.price_est_high)
    ? getWarningSymbol(1, 'Vyhlásená cena nezodpovedá nášmu odhadu')
    : null
}
