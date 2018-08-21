// @flow
import React from 'react'
import CircleIcon from 'react-icons/lib/fa/circle-o'
import FilledCircleIcon from 'react-icons/lib/fa/circle'
import {withState} from 'recompose'
import {FACEBOOK_LIKE_SRC} from '../../../constants'
import './Legend.css'
import MapIcon from '../../../assets/mapIcon.svg'

type Props = {
  legendOpen: boolean,
  setLegendOpen: (open: boolean) => void,
}

const Legend = ({legendOpen, setLegendOpen}: Props) => (
  (legendOpen) ? (
    <div className="legend">
      <div className="legend__header">
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
        Legenda
      </p>
      <p>
        <CircleIcon className="svg" />
        Firma / Osoba
      </p>
      <p>
        <FilledCircleIcon className="svg" />
        Obchod so štátom
      </p>
      {/*<p>
        <CircleIcon className="svg orange" />
        Kontakt s politikou
      </p>
      <p>
        <FilledCircleIcon className="svg orange" />
        Kontakt s politikou a obchod so štátom
      </p>*/}
      <p>
        <img src={MapIcon} className="map-icon-image" alt="mapIconImage" />
        Okres / mestská časť
      </p>
      <p>
        <span className="legend-marker">0</span>
        <span>Skupina entít</span>
      </p>
    </div>
  ) : (
    <button type="button" className="legend" onClick={() => setLegendOpen(true)}>
      Legenda
    </button>
  )
)

export default withState('legendOpen', 'setLegendOpen', true)(Legend)
