import React from 'react'
import {ListGroupItemHeading, ListGroupItemText, ListGroupItem} from 'reactstrap'
import type {Colab} from '../../../state'

export type ColabDetailProps = {
  colab: Colab,
}

const ColabDetail = ({colab}: ColabDetailProps) => (
  <ListGroupItem tag="a" href={colab.url} target="_blank" rel="noopener" action>
    <ListGroupItemHeading>{colab.name}</ListGroupItemHeading>
    <ListGroupItemText>{colab.description}</ListGroupItemText>
  </ListGroupItem>
)

export default ColabDetail
