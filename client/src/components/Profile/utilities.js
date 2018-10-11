// @flow
import type {Politician, PoliticianDetail, PoliticianOffice} from '../../state'

export const getTerm = (politician: Politician | PoliticianDetail | PoliticianOffice): string =>
  politician.term_start || politician.term_finish
    ? `${politician.term_start || ''} - ${politician.term_finish || ''}`
    : ''

export const mergeConsecutiveTerms = (offices: Array<PoliticianOffice>): Array<PoliticianOffice> =>
  offices.reduce((acc, cur) => {
    acc.some((office) => {
      if (
        office.term_start === cur.term_finish &&
        office.party_abbreviation === cur.party_abbreviation &&
        office.office_name_male === cur.office_name_male
      ) {
        office.term_start = cur.term_start
        return true
      }
      return false
    }) || acc.push({...cur})
    return acc
  }, [])

export type SplitOffices = {
  currentOffices: Array<PoliticianOffice>,
  pastOffices: Array<PoliticianOffice>,
}

export const splitOfficesByYear = (
  offices: Array<PoliticianOffice>,
  currentYear: number
): SplitOffices => {
  let current = []
  const past = []
  offices.forEach((office) => {
    if (office.term_finish >= currentYear || office.term_start >= currentYear) {
      current.push(office)
    } else {
      past.push(office)
    }
  })
  if (current.length === 0) {
    current = [past.shift()]
  }
  return {currentOffices: current, pastOffices: past}
}

export const getQueryFromGroup = (group: string): string =>
  group === 'all'
    ? 'poslanci'
    : group === 'candidates_2018_bratislava_mayor'
      ? 'kandidati_bratislava'
      : group === 'candidates_2019_president'
        ? 'kandidati_prezident'
        : ''

export const getGroupFromQuery = (group: string): string =>
  group === 'poslanci'
    ? 'all'
    : group === 'kandidati_bratislava'
      ? 'candidates_2018_bratislava_mayor'
      : group === 'kandidati_prezident'
        ? 'candidates_2019_president'
        : ''
