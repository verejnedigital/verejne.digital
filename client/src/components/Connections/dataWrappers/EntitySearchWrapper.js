// @flow
import React from 'react'
import {parse} from 'qs'
import {withRouter, type ContextRouter} from 'react-router-dom'
import type {ComponentType} from 'react'

export type EntitySearchProps = {
  entitySearch1: string,
  entitySearch2: string,
  showGraph: boolean,
}

const EntitySearchWrapper = (WrappedComponent: ComponentType<*>) => {
  const wrapped = (props: ContextRouter) => {
    const query = parse(props.location.search.substring(1))
    return (
      <WrappedComponent
        {...props}
        entitySearch1={query.eid1 || ''}
        entitySearch2={query.eid2 || ''}
        showGraph={query.graph || false}
      />
    )
  }

  return withRouter(wrapped)
}

export default EntitySearchWrapper
