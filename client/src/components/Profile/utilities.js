// @flow
import type {Politician, PoliticianDetail, PoliticianOffice} from '../../state'

export const getTerm = (politician: Politician | PoliticianDetail | PoliticianOffice): string =>
  (politician.term_start || politician.term_finish)
    ? `${politician.term_start || ''} - ${politician.term_finish || ''}`
    : ''
