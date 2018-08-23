// @flow
import React from 'react'
import {CardImg, CardBody, CardTitle, CardText} from 'reactstrap'
import {Link} from 'react-router-dom'
import './Card.css'

type CardProps = {|
  title: string,
  text: string,
  imgSrc: string,
  to: string,
|}

const Card = ({title, text, imgSrc, to}: CardProps) => (
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

export default Card
