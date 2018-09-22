import type {Politician, PoliticianDetail} from '../../state'

export const getTerm = (politician: Politician | PoliticianDetail): string =>
  (politician.term_start || politician.term_finish)
    ? `${politician.term_start || ''} - ${politician.term_finish || ''}`
    : ''
