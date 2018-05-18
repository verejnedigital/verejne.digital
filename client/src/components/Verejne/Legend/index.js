// @flow
import React from 'react'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import FilledCircleIcon from 'react-icons/lib/fa/circle'
import classnames from 'classnames'
import {withState} from 'recompose'
import {FACEBOOK_LIKE_SRC} from '../../../constants'
import './Legend.css'
import MapIcon from '../mapIcon.svg'

const Legend = ({legendOpen, setLegendOpen}) => (
  <div className={classnames('Legend', {Hidden: !legendOpen})}>
    <div className="Legend__Header">
      <iframe
        src={FACEBOOK_LIKE_SRC}
        width="145px"
        height="20px"
        scrolling="no"
        frameBorder="0"
        title="Facebook"
      />
      <button type="button" className="close" onClick={() => setLegendOpen(false)}>
        <span>&times;</span>
      </button>
    </div>
    <p>
      <CircleIcon className="Svg" />
      Firma / Osoba
    </p>
    <p>
      <FilledCircleIcon className="Svg" />
      Obchod so štátom
    </p>
    <p>
      <CircleIcon className="Svg Orange" />
      Kontakt s politikou
    </p>
    <p>
      <FilledCircleIcon className="Svg Orange" />
      Kontakt s politikou a obchod so štátom
    </p>
    <p>
      <img src={MapIcon} className="MapIconImage" alt="mapIconImage" />
      Okres / mestská časť
    </p>
    <p>
      <span className="LegendMarker">0</span>
      <span>Skupina entít</span>
    </p>
  </div>
)

export default withState('legendOpen', 'setLegendOpen', true)(Legend)
