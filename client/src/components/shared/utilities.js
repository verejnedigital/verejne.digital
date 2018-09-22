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

export const getRelationTitle = (typeId: number, name1: string, name2: string, typeDate: string) =>
  typeId != null
    ? typeDate === ''
      ? typeId > 0
        ? name1.concat(' zastupuje túto funkciu pre ').concat(name2)
        : name2.concat(' zastupuje túto funkciu pre ').concat(name1)
      : typeId > 0
        ? name1
          .concat(' zastupoval/a túto funkciu pre ')
          .concat(name2)
          .concat(' do ')
          .concat(typeDate)
        : name2
          .concat(' zastupoval/a túto funkciu pre ')
          .concat(name1)
          .concat(' do ')
          .concat(typeDate)
    : 'Spojenie neznáme'

export const getColor = (type: number, date: string) =>
  date === '' ? (type >= 0 ? 'primary' : 'dark') : 'secondary'
