// @flow
import * as React from 'react'
import External from 'react-icons/lib/fa/external-link'

type Props = {
  url: string,
  children?: React.Node,
}

const ExternalLink = ({url, children}: Props) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {children} <External />
  </a>
)

export default ExternalLink
