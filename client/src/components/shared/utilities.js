export function showRelationType(typeId: number, typeText: string, arrow: boolean) {
  if (typeId == null) {
    return 'Neznáme'
  }
  return `${typeText || 'Neznáme'} ${arrow ? typeId > 0 ? '>' : '<' : ''}`
}

export function getRelationTitle(typeId: number, name1: string, name2: string) {
  return typeId != null
    ? typeId > 0
      ? name1.concat(' zastupuje túto funkciu pre ').concat(name2)
      : name2.concat(' zastupuje túto funkciu pre ').concat(name1)
    : 'Spojenie neznáme'
}
