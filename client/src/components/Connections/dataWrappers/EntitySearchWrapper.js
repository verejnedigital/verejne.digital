import React from 'react'
import {parse} from 'qs'
import {withRouter} from 'react-router-dom'

const EntitySearchWrapper = (WrappedComponent) => {
  const wrapped = (props) => {
    const query = parse(props.location.search.substring(1))
    return (
      <WrappedComponent
        {...props}
        entitySearch1={query.eid1 || ''}
        entitySearch2={query.eid2 || ''}
      />
    )
  }

  return withRouter(wrapped)
}

export default EntitySearchWrapper
