// @flow
import * as React from 'react'
import {FaExternalLinkAlt} from 'react-icons/fa'

type Props = {
  url: string,
  children?: React.Node,
}

const ExternalLink = ({url, children}: Props) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {children} <FaExternalLinkAlt />
  </a>
)

export default ExternalLink
