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

const Findata = ({
  data: {established_on: establishedOn, finances, ico, terminated_on: terminatedOn, legal_form_id},
}: FindataProps) => (
  <Fragment>
    <Item
      label="IČO"
      url={legal_form_id === 243 || legal_form_id === 6
        ? `http://www.zrsr.sk/zr_ico.aspx`
        : `http://www.orsr.sk/hladaj_ico.asp?ICO=${ico}&SID=0`}
      linkText={ico}
    >
      &nbsp;(
      <ExternalLink isMapView={false} url={icoUrl(ico)}>
        Detaily o {legal_form_id === 243 || legal_form_id === 6 ? 'podnikateľovi' : 'firme'}
      </ExternalLink>
      )
    </Item>
    {establishedOn && <Item label="Založená">{showDate(establishedOn)}</Item>}
    {terminatedOn && <Item label="Zaniknutá">{showDate(terminatedOn)}</Item>}
    <Finances data={finances} ico={ico} />
  </Fragment>
)

export default Findata
