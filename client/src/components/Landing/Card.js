import React from 'react'
import {CardImg, CardBody, CardTitle, CardText} from 'reactstrap'
import {Link} from 'react-router-dom'
import './Card.css'

export default ({title, text, imgSrc, to}) => (
  <Link to={to} className="card">
    <div className="card-image-wrap">
      <CardImg className="card-image" src={imgSrc} alt={title} />
    </div>
    <CardBody>
      <CardTitle className="card-title">{title}</CardTitle>
      <CardText className="card-text">{text}</CardText>
    </CardBody>
  </Link>
)
