// @flow

import type {Ties} from './CircleIcon'

export const showRelationType = (
  typeId: number,
  typeText: string,
  typeDate: string,
  arrow: boolean
) =>
  typeId == null
    ? 'Neznáme'
    : `${typeText || 'Neznáme'}${typeDate ? ' do '.concat(typeDate) : ''}${
      arrow ? (typeId > 0 ? ' >' : ' <') : ''
    }`

export const getRelationTitle = (
  typeId: number,
  name1: string,
  name2: string,
  typeDate: string,
  symmetric: boolean
) =>
  typeId != null
    ? symmetric
      ? typeDate === ''
        ? `${name1} a ${name2} majú tento vzťah`
        : `${name1} a ${name2} mali tento vzťah do ${typeDate}`
      : typeDate === ''
        ? typeId > 0
          ? `${name1} zastupuje túto funkciu pre ${name2}`
          : `${name2} zastupuje túto funkciu pre ${name1}`
        : typeId > 0
          ? `${name1} zastupoval/a túto funkciu pre ${name2} do ${typeDate}`
          : `${name2} zastupoval/a túto funkciu pre ${name1} do ${typeDate}`
    : 'Spojenie neznáme'

export const getColor = (type: number, date: string) =>
  date === '' ? (type >= 0 ? 'primary' : 'dark') : 'secondary'

export const getCircleIconTitle = (data: Ties) => {
  return data.political_entity
    ? 'Politik'
    : data.trade_with_government && data.contact_with_politics
      ? 'Kontakt s politikou a obchod so štátom'
      : data.trade_with_government
        ? 'Obchod so štátom'
        : data.contact_with_politics
          ? 'Kontakt s politikou'
          : 'Firma / osoba'
}
