// @flow
import type {Politician, PoliticianDetail, PoliticianOffice} from '../../state'

export const getTerm = (politician: Politician | PoliticianDetail | PoliticianOffice): string =>
  politician.term_start || politician.term_finish
    ? `${politician.term_start || ''} - ${politician.term_finish || ''}`
    : ''

export const mergeConsecutiveTerms = (
  offices: Array<PoliticianOffice>
): Array<PoliticianOffice> => {
  let last = null
  return offices.reduce((acc, cur) => {
    if (
      last &&
      last.term_start === cur.term_finish &&
      last.party_abbreviation === cur.party_abbreviation &&
      last.office_name_male === cur.office_name_male
    ) {
      last.term_start = cur.term_start
    } else {
      last = {...cur}
      acc.push(last)
    }
    return acc
  }, [])
}

export const splitOfficesByYear = (
  offices: Array<PoliticianOffice>,
  currentYear: number
): Array<PoliticianOffice> => {
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
  return {current, past}
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
