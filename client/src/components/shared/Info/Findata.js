// @flow
import React, {Fragment} from 'react'

import type {FinancialData} from '../../../services/utilities'
import {icoUrl, showDate} from '../../../services/utilities'
import Finances from './Finances'
import Item from './Item'
import ExternalLink from '../ExternalLink'

type FindataProps = {
  data: FinancialData,
}

const Findata = ({data: {established_on, finances, ico, terminated_on}}: FindataProps) => (
  <Fragment>
    <Item
      label="IČO"
      url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${ico}&SID=0`}
      // TODO link to zrsr when there is a way to tell companies and persons apart
      linkText={ico}
    >
      &nbsp;(<ExternalLink isMapView={false} url={icoUrl(ico)}>
        Detaily o firme
      </ExternalLink>)
    </Item>
    {established_on && <Item label="Založená">{showDate(established_on)}</Item>}
    {terminated_on && <Item label="Zaniknutá">{showDate(terminated_on)}</Item>}
    <Finances data={finances} ico />
  </Fragment>
)

export default Findata
