// @flow
import React from 'react'
import {Badge} from 'reactstrap'
import {orderBy} from 'lodash'

import RecursiveInfo from './RecursiveInfo'
import {showRelationType, getRelationTitle, getColor} from '../utilities'
import type {RelatedEntity} from '../../../state'

type RelationListProps = {
  data: Array<RelatedEntity>,
  name: string,
}

type RelationItemProps = {
  related: RelatedEntity,
  name: string,
}

type TitleBadgeProps = {
  related: RelatedEntity,
  name: string,
}

export default ({data, name, useNewApi}: RelationListProps) => (
  <ul className="list-unstyled info-button-list">
    {orderBy(data, ['edge_types']).map((related: RelatedEntity) => (
      <RelationItem key={related.eid} related={related} name={name} />
    ))}
  </ul>
)

const RelationItem = ({related, name}: RelationItemProps) => (
  <li key={related.eid} className="">
    <RecursiveInfo
      name={related.name}
      eid={related.eid}
      badge={<TitleBadge key={related.eid} related={related} name={name} />}
    />
  </li>
)

const TitleBadge = ({related, name}: TitleBadgeProps) => {
  const result = []
  related.edge_types.forEach((type: number, i: number) => {
    const symmetric: boolean = related.edge_types.includes(-type)
    if (type >= 0 || !symmetric) {
      result.push(
        <Badge
          key={type}
          color={getColor(type, related.edge_effective_to_dates[i])}
          title={getRelationTitle(type, name, related.name, related.edge_effective_to_dates[i])}
          className="mr-1 info-badge"
        >
          {showRelationType(
            type,
            related.edge_type_texts[i],
            related.edge_effective_to_dates[i],
            !symmetric
          )}
        </Badge>
      )
    }
  })
  return result
}
