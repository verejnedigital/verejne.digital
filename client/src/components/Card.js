import React from 'react'
import './Card.css'
import {Card, CardImg, CardBody, CardTitle, CardText} from 'reactstrap'

export default ({title, text, imgSrc}) => (
  <Card className="card-center">
    <CardImg top width="100%" src={imgSrc} alt={title} />
    <CardBody>
      <CardTitle>{title}</CardTitle>
      <CardText>{text}</CardText>
    </CardBody>
  </Card>
)
