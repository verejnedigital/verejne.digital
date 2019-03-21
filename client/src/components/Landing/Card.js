// @flow
import React from 'react'
import {CardImg, CardBody, CardTitle, CardText, Badge} from 'reactstrap'
import {Link} from 'react-router-dom'
import './Card.css'

type CardProps = {|
  title: string,
  text: string,
  imgSrc: string,
  to: string,
  beta?: boolean,
|}

const Card = ({title, text, imgSrc, to, beta}: CardProps) => (
  <Link to={to} className="card">
    <div className="card-image-wrap">
      <CardImg className="card-image" src={imgSrc} alt={title} />
    </div>
    <CardBody>
      <CardTitle className="card-title">{title} {beta && <Badge color="primary">Beta</Badge>}</CardTitle>
      <CardText className="card-text">{text}</CardText>
    </CardBody>
  </Link>
)

export default Card
