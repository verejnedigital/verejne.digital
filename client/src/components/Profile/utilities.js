import type {Politician, PoliticianDetail} from '../../state'

export const getTerm = (politician: Politician | PoliticianDetail): string =>
  politician.term_start || politician.term_finish
    ? `${politician.term_start || ''} - ${politician.term_finish || ''}`
    : ''

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
