// @flow
import React from 'react'
import RelationList from './RelationList'

import type {RelatedEntity} from '../../../state'
import ToggleBox from '../ToggleBox'

type RelationsProps = {
  data: Array<RelatedEntity>,
  name: string,
}

const Relations = ({data, name}: RelationsProps) => (
  <ToggleBox buttonText="Vzťahy" buttonInfo={data.length}>
    <RelationList data={data} name={name} />
  </ToggleBox>
)

export default Relations
