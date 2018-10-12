// @flow
import React, {Fragment} from 'react'

import type {EnhancedCompanyFinancial} from '../../../services/utilities'
import FinancesItem from './FinancesItem'
import ToggleBox from '../ToggleBox'

type FinancesProps = {
  data: EnhancedCompanyFinancial[],
  ico: string,
}

const Finances = ({
  data: [lastFinances = {}, ...otherFinances],
  ico,
  expanded,
  toggle,
}: FinancesProps) => (
  <Fragment>
    <FinancesItem data={lastFinances} ico={ico} />
    {!!otherFinances.length && (
      <ToggleBox buttonText="Staršie záznamy" buttonInfo={otherFinances.length}>
        {otherFinances.map((finances) => <FinancesItem key={finances.year} data={finances} ico={ico} />)}
      </ToggleBox>
    )}
  </Fragment>
)

export default Finances
