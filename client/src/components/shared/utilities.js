export const showRelationType = (typeId: number, typeText: string, arrow: boolean) =>
  typeId == null ? 'Neznáme' : `${typeText || 'Neznáme'}${arrow ? typeId > 0 ? ' >' : ' <' : ''}`

export const getRelationTitle = (typeId: number, name1: string, name2: string) =>
  typeId != null
    ? typeId > 0
      ? name1.concat(' zastupuje túto funkciu pre ').concat(name2)
      : name2.concat(' zastupuje túto funkciu pre ').concat(name1)
    : 'Spojenie neznáme'
