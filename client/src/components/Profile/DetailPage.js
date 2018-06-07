// @flow
import React from 'react'
import {Link, NavLink} from 'react-router-dom'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withState} from 'recompose'
import {withDataProviders} from 'data-provider'
import {
  cadastralInfoProvider,
  detailsProvider,
  assetDeclarationProvider,
} from '../../dataProviders/profileDataProviders'
import {
  paramsYearSelector,
  parsedAssetDeclarationsForYearSelector,
  politicianDetailSelector,
  assetDeclarationsSortedYearsSelector,
  politicianCadastralSelector,
} from '../../selectors/profileSelectors'
import {DEFAULT_MAP_CENTER} from '../../constants'

import Cardboard from './components/Cardboard'
import DetailCadastralTable from './components/DetailCadastralTable'
import DetailAsset from './components/DetailAssets'
import MapContainer from './components/MapContainer'
import {Row, Col, Container} from 'reactstrap'

import './DetailPage.css'

import type {ContextRouter} from 'react-router-dom'
import type {State, PoliticianDetail, CadastralData, GeolocationPoint} from '../../state'
import type {ParsedAssetDeclarationsType} from '../../types/profileTypes'

export type ProfileDetailPageProps = {
  assetsYears: Array<string>,
  selectedYear: string,
  assets: ParsedAssetDeclarationsType,
  politician: PoliticianDetail,
  cadastral: CadastralData,
  mapCenter: GeolocationPoint,
  goMap: (ProfileDetailPageProps) => Function, // TODO instead take map center from url
} & ContextRouter

const DetailPage = ({
  assetsYears,
  selectedYear,
  assets,
  politician,
  cadastral,
  mapCenter,
  goMap,
}: ProfileDetailPageProps) => (
  <Container>
    <Row tag="header" key="title" className="header profile-header">
      <Col>
        <h1 className="title">
          <NavLink to="/profil">
            <span className="bolder">profil</span>.verejne.digital
          </NavLink>
        </h1>
      </Col>
    </Row>
    <Cardboard key="cardboard" politician={politician} />,
    <Row tag="article" key="politician" className="profile">
      <Col tag="section">
        <div className="profile-tabs">
          {assetsYears.map((y) => (
            <Link
              to={{search: `?year=${y}`}}
              className={y === selectedYear ? 'tab active' : 'tab'}
              key={y}
            >
              {y}
            </Link>
          ))}
        </div>
        <section>
          <DetailAsset
            assets={assets.unmovable_assets}
            year={selectedYear}
            title="Majetkové priznanie: Nehnuteľnosti"
            image={`https://verejne.digital/img/majetok/${politician.surname}_${
              politician.firstname
            }.png`}
            source={assets.source}
          />
        </section>
        <section>
          <DetailAsset
            assets={assets.movable_assets}
            year={selectedYear}
            title="Majetkové priznanie: Hnuteľný majetok"
            source={assets.source}
          />
        </section>
        <section>
          <DetailAsset
            assets={assets.income_assets}
            year={selectedYear}
            title="Majetkové priznanie: ostatné"
            source={assets.source}
          />
        </section>
      </Col>
      <Col tag="section">
        <DetailCadastralTable cadastral={cadastral} onParcelShow={goMap} />
      </Col>
    </Row>
    <Row key="map" className="profile-map">
      <Col>
        <MapContainer assets={cadastral} center={mapCenter} />
      </Col>
    </Row>
  </Container>
)

export default compose(
  withDataProviders(({match: {params: {id}}}) => [
    detailsProvider(id),
    cadastralInfoProvider(id),
    assetDeclarationProvider(id),
  ]),
  connect((state: State, props: ContextRouter) => ({
    selectedYear: paramsYearSelector(state, props),
    assetsYears: assetDeclarationsSortedYearsSelector(state, props),
    assets: parsedAssetDeclarationsForYearSelector(state, props),
    politician: politicianDetailSelector(state, props),
    cadastral: Object.values(politicianCadastralSelector(state, props)),
  })),
  withState('mapCenter', 'setMapCenter', DEFAULT_MAP_CENTER),
  withHandlers({
    goMap: (props) => (parcel) => {
      props.setMapCenter({lat: parcel.lat, lng: parcel.lon})
    },
  })
)(DetailPage)
