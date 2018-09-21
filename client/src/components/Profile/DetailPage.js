// @flow
import React, {Fragment} from 'react'
import {Link, NavLink} from 'react-router-dom'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {stringify} from 'qs'
import {size, map} from 'lodash'
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
  sortedCadastralInfoSelector,
  filteredCadastralInfoLengthSelector,
  paginatedCadastralInfoSelector,
  cadastralPageSelector,
  cadastralSearchSelector,
} from '../../selectors/profileSelectors'
import {locationSearchSelector} from '../../selectors'
import {DEFAULT_MAP_CENTER, COUNTRY_ZOOM} from '../../constants'

import Cardboard from './components/Cardboard'
import DetailCadastralTable from './components/DetailCadastralTable'
import DetailAsset from './components/DetailAssets'
import MapContainer from './components/MapContainer'
import Info from '../shared/Info/Info'
import {Row, Col, Container} from 'reactstrap'

import './DetailPage.css'

import type {ContextRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router'
import type {State, PoliticianDetail, CadastralData, GeolocationPoint} from '../../state'
import type {ParsedAssetDeclarationsType} from '../../types/profileTypes'

export type ProfileDetailPageProps = {
  assetsYears: Array<string>,
  selectedYear: string,
  assets: ?ParsedAssetDeclarationsType,
  politician: PoliticianDetail,
  cadastral: Array<CadastralData>,
  paginatedCadastral: CadastralData,
  cadastralLength: number,
  cadastralPage: number,
  cadastralSearch: string,
  query: Object,
  history: RouterHistory,
  mapProps: {center: GeolocationPoint, zoom: number},
  goMap: (ProfileDetailPageProps) => Function, // TODO instead take map center from url
} & ContextRouter

const DetailPage = ({
  assetsYears,
  selectedYear,
  assets,
  politician,
  cadastral,
  paginatedCadastral,
  cadastralLength,
  cadastralPage,
  cadastralSearch,
  query,
  history,
  mapProps,
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
    <Cardboard key="cardboard" politician={politician} />
    <Row tag="article" key="politician" className="profile">
      <Col tag="section">
        {politician.entities &&
          size(politician.entities) > 0 && (
          <section className="mb-4">
            <h5 className="ml-2">
                Pozor, možno iba {size(politician.entities) > 1 ? 'menovci' : 'menovec'}.
            </h5>
            {map(politician.entities, (e, i) => (
              <Info key={i} data={e} className="bc-transparent" />
            ))}
          </section>
        )}
        <div className="profile-tabs">
          {assetsYears.map((y) => (
            <Link
              to={{search: stringify({...query, year: y})}}
              className={y === selectedYear ? 'tab active' : 'tab'}
              key={y}
            >
              {y}
            </Link>
          ))}
        </div>
        {assets && (
          <Fragment>
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
          </Fragment>
        )}
      </Col>
      <Col tag="section">
        {cadastral.length > 0 &&
          <DetailCadastralTable
            cadastral={paginatedCadastral}
            cadastralLength={cadastralLength}
            currentPage={cadastralPage}
            search={cadastralSearch}
            query={query}
            history={history}
            onParcelShow={goMap}
          />
        }
      </Col>
    </Row>
    {cadastral.length > 0 &&
      <Row key="map" id="map" className="profile-map">
        <Col>
          <MapContainer assets={cadastral} {...mapProps} />
        </Col>
      </Row>
    }
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
    cadastral: sortedCadastralInfoSelector(state, props),
    paginatedCadastral: paginatedCadastralInfoSelector(state, props),
    cadastralLength: filteredCadastralInfoLengthSelector(state, props),
    cadastralPage: cadastralPageSelector(state, props),
    cadastralSearch: cadastralSearchSelector(state, props),
    query: locationSearchSelector(state, props),
  })),
  withState('mapProps', 'setMapProps', {center: DEFAULT_MAP_CENTER, zoom: COUNTRY_ZOOM}),
  withHandlers({
    goMap: (props) => (parcel) => {
      props.setMapProps({center: {lat: parcel.lat, lng: parcel.lon}, zoom: 15})
      const mapElement = document.getElementById('map')
      if (mapElement) mapElement.scrollIntoView({behavior: 'smooth'})
    },
  })
)(DetailPage)
