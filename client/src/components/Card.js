import React from 'react'
import './Card.css'

export default ({title, text, imgSrc}) => (
  <div className="card card-center">
    <img className="card-img-top" src={imgSrc} alt={title} />
    <div className="card-body">
      <h4 className="card-title">{title}</h4>
      <p className="card-text">{text}</p>
    </div>
  </div>
)
