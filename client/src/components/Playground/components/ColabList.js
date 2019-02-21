import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withDataProviders} from 'data-provider'
import {ListGroup} from 'reactstrap'
import type {Colab, State} from '../../../state'
import {colabsSelector} from '../../../selectors'
import {colabsProvider} from '../../../dataProviders/colabDataProviders'
import ColabDetail from './ColabDetail'

export type ColabListProps = {
  colabs: Colab[],
}

const ColabList = ({colabs}: ColabListProps) => {
  return (
    <>
      <h2 className="report-list-title">Zoznam reportov</h2>
      <ListGroup>
        {colabs.map((colab, index) => (
          <ColabDetail colab={colab} key={index} />
        ))}
      </ListGroup>
    </>
  )
}

export default compose(
  withDataProviders(() => [colabsProvider()]),
  connect((state: State) => ({
    colabs: colabsSelector(state),
  }))
)(ColabList)
