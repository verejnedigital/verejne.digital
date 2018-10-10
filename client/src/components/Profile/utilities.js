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
