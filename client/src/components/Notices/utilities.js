// @flow
import React from 'react'
import {getWarningSymbol} from './LegendSymbols'

import type {Company, Notice} from '../../state'

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

export const expC = 2.7182818

export function showNumberCurrency(num: number, cur: string = '€') {
  return num ? (
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
    value === 'nezisten'
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

export function showDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  return `${day}.${monthNames[monthIndex]} ${year}`
}

export function extractIco(data: Company) {
  const icoSource = ['new_orsr_data', 'orsresd_data', 'firmy_data'].find(
    (src) => data[src].length >= 1
  )
  let ico = icoSource ? data[icoSource][0].ico : null
  if (ico != null) {
    while (ico.length < 8) {
      ico = `0${ico}`
    }
  }
  return ico
}

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

export function localeNumber(number: number) {
  return number
    ? number.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    : null
}

export function getTitle(item: Notice) {
  let title = ''
  const boundMultiplier = 2.576
  if (item.price && item.price_num && item.price_num >= 5) {
    const lower = expC ** (item.price_avg - boundMultiplier * item.price_stdev)
    const upper = expC ** (item.price_avg + boundMultiplier * item.price_stdev)
    title = `${item.price} (${lower}, ${expC ** item.price_avg}, ${upper}), ${item.price_avg}, ${
      item.price_stdev
    })`
  }
  return title
}
