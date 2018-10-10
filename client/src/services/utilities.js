// @flow
import React from 'react'
import {reduce, isEmpty, orderBy, padStart, isFinite} from 'lodash'

import {pickBy} from '../utils'
import type {ObjectMap} from '../types/commonTypes'
import type {Company, NewEntityDetail, CompanyFinancial} from '../state'

const monthNames = [
  'január',
  'február',
  'marec',
  'apríl',
  'máj',
  'jún',
  'júl',
  'august',
  'september',
  'október',
  'november',
  'december',
]

/* eslint-disable quote-props */
// source: https://ekosystem.slovensko.digital/otvorene-data#crz.contracts.status_id
const contractStatuses: ObjectMap<string> = {
  '1': 'rozpracovaná',
  '2': 'zverejnená',
  '3': 'doplnená',
  '4': 'zrušená',
  '5': 'stiahnutá',
}

export function localeNumber(number: number) {
  return isFinite(number)
    ? number.toLocaleString('sk-SK', {minimumFractionDigits: 0, maximumFractionDigits: 2})
    : null
}

type ShowNumberCurrencyProps = {
  num: number,
  cur?: string,
}

export const ShowNumberCurrency = ({num, cur = '€'}: ShowNumberCurrencyProps) => {
  return isFinite(num) ? (
    <span className="text-nowrap">
      {localeNumber(num)} {cur}
    </span>
  ) : null
}

export function icoUrl(ico: string) {
  return `http://www.finstat.sk/${ico}`
}

function computeTrend(num: ?number, oldNum: ?number) {
  if (num && oldNum && Number.isFinite(num) && Number.isFinite(oldNum)) {
    return Math.round((num - oldNum) * 100 / Math.abs(oldNum))
  }
  return 0
}

function isValidValue(value) {
  return !(
    value == null ||
    value === 'null' ||
    value === 'NULL' ||
    value === 'None' ||
    (typeof value === 'string' && value.indexOf('nezisten') === 0)
  )
}

export function isPolitician(entity: Company) {
  return entity.sponzori_stran_data.length >= 1 || entity.stranicke_prispevky_data.length >= 1
}

export function getFinancialData(data: Company, ico: string) {
  const findata = {}
  if (data.company_stats.length > 0) {
    const companyStats = data.company_stats[0]
    findata.ico = ico
    if (isValidValue(companyStats.datum_vzniku)) findata.zaciatok = companyStats.datum_vzniku
    if (isValidValue(companyStats.datum_zaniku)) findata.koniec = companyStats.datum_zaniku
    if (isValidValue(companyStats.zisk2016)) findata.zisk16 = companyStats.zisk2016
    if (isValidValue(companyStats.trzby2016)) findata.trzby16 = companyStats.trzby2016
    if (isValidValue(companyStats.zisk2015)) findata.zisk15 = companyStats.zisk2015
    if (isValidValue(companyStats.trzby2015)) findata.trzby15 = companyStats.trzby2015
    if (isValidValue(companyStats.zisk2014)) findata.zisk14 = companyStats.zisk2014
    if (isValidValue(companyStats.trzby2014)) findata.trzby14 = companyStats.trzby2014
    if (isValidValue(companyStats.zisk2016)) {
      findata.zisk_trend = computeTrend(findata.zisk16, findata.zisk15)
    } else if (isValidValue(companyStats.zisk2015)) {
      findata.zisk_trend = computeTrend(findata.zisk15, findata.zisk14)
    }
    if (isValidValue(companyStats.trzby2016)) {
      findata.trzby_trend = computeTrend(findata.trzby16, findata.trzby15)
    } else if (isValidValue(companyStats.trzby2015)) {
      findata.trzby_trend = computeTrend(findata.trzby15, findata.trzby14)
    }
    if (isValidValue(companyStats.zamestnanci2016)) {
      findata.zamestnancov = companyStats.zamestnanci2016
    } else if (isValidValue(companyStats.zamestnanci2015)) {
      findata.zamestnancov = companyStats.zamestnanci2015
    }
  }
  return findata
}

export type EnhancedCompanyFinancial = {
  year: number,
  revenueTrend?: number,
  profitTrend?: number,
} & CompanyFinancial

export type FinancialData = {
  ico: string,
  established_on?: string,
  terminated_on?: string,
  finances: Array<EnhancedCompanyFinancial>,
}

export function getNewFinancialData(data: NewEntityDetail): FinancialData {
  const finances = reduce(
    data.companyfinancials || {},
    (items: Array<EnhancedCompanyFinancial>, origItem: CompanyFinancial, year: string, origObj) => {
      const item = pickBy(origItem, isValidValue)
      if (!isEmpty(item)) {
        item.year = parseInt(year, 10)
        if (origObj[item.year - 1]) {
          item.revenueTrend = computeTrend(item.revenue, origObj[item.year - 1].revenue)
          item.profitTrend = computeTrend(item.profit, origObj[item.year - 1].profit)
        }
        items.push(item)
      }
      return items
    },
    []
  )
  return {
    ...pickBy(data.companyinfo, isValidValue),
    ico: padIco(data.companyinfo.ico),
    finances: orderBy(finances, ['year'], ['desc']),
  }
}

export function showDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  return `${day}.${monthNames[monthIndex]} ${year}`
}

export function showContractStatus(statusId: number) {
  if (statusId == null) {
    return 'Neznáme'
  }
  return contractStatuses[statusId.toString()] || 'Neznáme'
}

function padIco(ico?: number | string) {
  // TODO remove null checks when `extractIco` is removed
  return ico != null ? padStart(ico.toString(), 8, '0') : ''
}

export function extractIco(data: Company) {
  const icoSource = ['new_orsr_data', 'orsresd_data', 'firmy_data'].find(
    (src) => data[src].length >= 1
  )
  return icoSource ? padIco(data[icoSource][0].ico) : null
}

export const resultPlurality = (count: number): string => {
  if (count === 1) {
    return `Nájdený ${count} výsledok`
  } else if (count > 1 && count < 5) {
    return `Nájdené ${count} výsledky`
  }
  return `Nájdených ${count} výsledkov`
}
