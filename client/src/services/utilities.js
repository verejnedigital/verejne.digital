// @flow
import React from 'react'
import {reduce, pickBy, isEmpty, orderBy, padStart, isFinite} from 'lodash'

import type {Company, NewEntityDetail} from '../state'

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
const contractStatuses = {
  '1': 'rozpracovaná',
  '2': 'zverejnená',
  '3': 'doplnená',
  '4': 'zrušená',
  '5': 'stiahnutá',
}

const relationTypes = {
  '1': 'Predstaventvo',
  '2': 'Člen dozorného orgánu',
  '3': 'Jediný akcionár a.s.',
  '4': 'Konateľ',
  '5': 'Spoločník v.o.s. / s.r.o.',
  '6': 'Neurčené',
  '7': 'Prokurista',
  '8': 'Likvidátor',
  '9': 'Správca konkurznej podstaty',
  '10': 'Správca reštrukturalizačného konania',
  '11': 'Vedúci podniku (organizačnej zložky podniku)',
  '12': 'Komplementár',
  '13': 'Komanditista',
  '14': 'Komplementár',
  '15': 'Predseda',
  '16': 'Spoločník',
  '17': 'Podnikateľ',
  '18': 'Zástupca podnikateľa',
  '19': 'Vedúci podniku zahraničnej osoby / organizačnej zložky podniku zahraničnej osoby',
  '20': 'Zriaďovateľ ZO',
  '21': 'Riaditeľ',
  '22': 'Zakladateľ štátneho podniku',
  '23': 'Zástupca riaditeľa',
  '24': 'Generálny riaditeľ',
  '25': 'Člen správnej rady',
  '26': 'Podpredseda',
  '27': 'Správca vyrovnacieho konania',
  '28': 'Člen družstva poverený členskou schôdzou',
  '29': 'Správna rada',
  '30': 'Zodpovedný zástupca',
  '31': 'Vedúci organizačnej zložky',
  '32': 'Iná zainteresovaná osoba',
  '33': 'Zakladateľ',
  '34': 'Zakladateľ',
  '35': 'Iný štatutárny orgán',
  '36': 'Správca',
  '37': 'Zriaďovateľ',
  '38': 'Člen prípravného výboru',
  '39': 'Navrhovateľ',
  '40': 'Vedúci odštepného závodu / inej organizačnej zložky podniku',
  '41': 'Prokurista zahraničnej osoby',
  '42': 'Prokurista zahraničnej osoby',
  '43': 'Prokurista zahraničnej osoby',
  '44': 'Výkonný výbor',
  '45': 'Primátor',
  '46': 'Člen EZHZ',
  '47': 'Starosta',
  '48': 'Primátor',
}

export function localeNumber(number: number) {
  return isFinite(number)
    ? number.toLocaleString('sk-SK', {minimumFractionDigits: 2, maximumFractionDigits: 2})
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

export function getNewFinancialData(data: NewEntityDetail) {
  const finances = reduce(
    data.companyfinancials || {},
    (items, origItem, year, origObj) => {
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
  return contractStatuses[statusId] || ''
}

export function showRelationType(relationTypeId: number) {
  if (relationTypeId == null) {
    return 'Neznáme'
  }
  return `${relationTypes[Math.abs(relationTypeId)] || 'Neznáme'} ${relationTypeId > 0 ? '>' : '<'}`
}

function padIco(ico?: number | string) {
  return ico != null ? padStart(ico.toString(), 8, '0') : null
}

export function extractIco(data: Company) {
  const icoSource = ['new_orsr_data', 'orsresd_data', 'firmy_data'].find(
    (src) => data[src].length >= 1
  )
  return icoSource ? padIco(data[icoSource][0].ico) : null
}
