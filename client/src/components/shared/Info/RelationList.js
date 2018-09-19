// @flow
import React from 'react'
import {Badge} from 'reactstrap'
import {orderBy} from 'lodash'

import RecursiveInfo from './RecursiveInfo'
import {showRelationType, getRelationTitle} from '../utilities'
import type {RelatedEntity} from '../../../state'

type RelationListProps = {
  data: Array<RelatedEntity>,
  name: string,
}

type RelationItemProps = {
  related: RelatedEntity,
  name: string,
}

export default ({data, name}: RelationListProps) => (
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

const TitleBadge = ({related, name}: RelationItemProps) =>
  related.edge_types.map((type: number, i: number) => (
    <Badge
      key={type}
      color={type > 0 ? 'dark' : 'secondary'}
      title={getRelationTitle(type, name, related.name)}
      className="mr-1 info-badge"
    >
      {showRelationType(type, related.edge_type_texts[i])}
    </Badge>
  ))
