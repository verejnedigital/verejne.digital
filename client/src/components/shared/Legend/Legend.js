// @flow
import React from 'react'
import classnames from 'classnames'
import {FaDotCircle, FaCircle} from 'react-icons/fa'
import {compose, withState, withHandlers} from 'recompose'
import {Row, Col} from 'reactstrap'
import SubgraphInstructions from '../../Connections/components/SubgraphInstructions'
import {FACEBOOK_LIKE_SRC} from '../../../constants'
import './Legend.css'
import MapIcon from '../../../assets/mapIcon.svg'

type Props = {
  legendOpen: boolean,
  toggleLegend: () => void,
  positionAbsolute?: boolean,
  closable?: boolean,
  defaultOpen?: boolean,
  graphControls?: boolean,
}

const Legend = ({legendOpen, toggleLegend, positionAbsolute, closable, graphControls}: Props) =>
  legendOpen ? (
    <div className={classnames('legend', {'position-absolute': positionAbsolute})}>
      <div className="legend__header">
        <iframe
          src={FACEBOOK_LIKE_SRC}
          width="145px"
          height="20px"
          scrolling="no"
          frameBorder="0"
          title="Facebook"
        />
        {closable && (
          <button type="button" className="close" onClick={toggleLegend}>
            <span>&times;</span>
          </button>
        )}
      </div>
      <Row>
        {graphControls && (
          <Col lg="7" md="12">
            <SubgraphInstructions />
          </Col>
        )}
        <Col sm="12" lg={graphControls ? 5 : 12}>
          <p>Legenda</p>
          <p>
            <FaDotCircle className="svg" />
            Firma / Osoba
          </p>
          <p>
            <FaCircle className="svg" />
            Obchod so štátom
          </p>
          <p>
            <FaDotCircle className="svg orange" />
            Kontakt s politikou
          </p>
          <p>
            <FaCircle className="svg purple" />
            Politik
          </p>
          <p>
            <FaCircle className="svg orange" />
            Kontakt s politikou a obchod so štátom
          </p>
          <p>
            <img src={MapIcon} className="map-icon-image" alt="mapIconImage" />
            Okres / mestská časť
          </p>
          <p>
            <span className="legend-marker">0</span>
            <span>Skupina entít</span>
          </p>
        </Col>
      </Row>
    </div>
  ) : (
    <button
      type="button"
      className={classnames('legend', {'position-absolute': positionAbsolute})}
      onClick={toggleLegend}
    >
      Legenda
    </button>
  )

export default compose(
  withState('legendOpen', 'setLegendOpen', ({defaultOpen = true}) => defaultOpen),
  withHandlers({
    toggleLegend: ({setLegendOpen}) => () => setLegendOpen((current: boolean) => !current),
  })
)(Legend)
