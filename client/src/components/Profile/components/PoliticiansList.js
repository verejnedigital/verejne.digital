// @flow
import React from 'react'
import Politician from './Politician'
import {Table} from 'reactstrap'
import PoliticiansListWrapper from './PoliticiansListWrapper'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {sortBy} from 'lodash'
import {FaSortUp} from 'react-icons/fa'
import {FaSortDown} from 'react-icons/fa'
import {isItCandidatesListSelector} from '../../../selectors'
import {setProfileSort} from '../../../actions/profileActions'

import './PoliticiansList.css'

import type {ContextRouter} from 'react-router-dom'
import type {
  Politician as PoliticianType,
  State,
  PoliticiansSortState,
  PoliticiansSortKey,
} from '../../../state'

type PoliticianListProps = {
  politicians: Array<PoliticianType>,
  isItCandidatesList: boolean,
  setProfileSort: typeof setProfileSort,
  politicianGroup: string,
  sortState: PoliticiansSortState,
}

type HeaderCellProps = {
  text: string,
  title?: string,
  sortKey: PoliticiansSortKey,
  active: boolean,
  reverse: boolean,
  setProfileSort: typeof setProfileSort,
  politicianGroup: string,
}

const HeaderCell = ({
  text,
  title,
  sortKey,
  active,
  reverse,
  setProfileSort,
  politicianGroup,
}: HeaderCellProps) => (
  <th
    className="clickable text-left column-title"
    onClick={() => setProfileSort(politicianGroup, sortKey, active && !reverse)}
    title={title}
  >
    {text} {active ? reverse ? <FaSortUp /> : <FaSortDown /> : ''}
  </th>
)

const PoliticiansList = ({
  politicians,
  politicianGroup,
  sortState,
  isItCandidatesList,
  setProfileSort,
}: PoliticianListProps) => (
  <Table id="politicians-table">
    <thead>
      <tr>
        <th />
        <th />
        <HeaderCell
          text="Meno a priezvisko"
          sortKey="surname"
          active={sortState.sortKey === 'surname'}
          reverse={sortState.reverse}
          setProfileSort={setProfileSort}
          politicianGroup={politicianGroup}
        />
        {!isItCandidatesList && (
          <HeaderCell
            text="Strana"
            sortKey="party_abbreviation"
            active={sortState.sortKey === 'party_abbreviation'}
            reverse={sortState.reverse}
            setProfileSort={setProfileSort}
            politicianGroup={politicianGroup}
          />
        )}
        <HeaderCell
          text="Ročný príjem"
          sortKey="latest_income"
          active={sortState.sortKey === 'latest_income'}
          reverse={sortState.reverse}
          setProfileSort={setProfileSort}
          politicianGroup={politicianGroup}
        />
        <HeaderCell
          text="Stavby"
          title="Domy, byty a iné stavby"
          sortKey="num_houses_flats"
          active={sortState.sortKey === 'num_houses_flats'}
          reverse={sortState.reverse}
          setProfileSort={setProfileSort}
          politicianGroup={politicianGroup}
        />
        <HeaderCell
          text="Orná pôda &amp; záhrady"
          sortKey="num_fields_gardens"
          active={sortState.sortKey === 'num_fields_gardens'}
          reverse={sortState.reverse}
          setProfileSort={setProfileSort}
          politicianGroup={politicianGroup}
        />
        <HeaderCell
          text="Ostatné"
          sortKey="num_others"
          active={sortState.sortKey === 'num_others'}
          reverse={sortState.reverse}
          setProfileSort={setProfileSort}
          politicianGroup={politicianGroup}
        />
      </tr>
    </thead>
    <tbody>
      {politicians.map((politician, i) => (
        <Politician key={politician.id} index={i} politician={politician} />
      ))}
    </tbody>
  </Table>
)

export default compose(
  PoliticiansListWrapper,
  withRouter,
  connect(
    (state: State, props: ContextRouter) => ({
      isItCandidatesList: isItCandidatesListSelector(state, props),
    }),
    {setProfileSort}
  )
)(PoliticiansList)
