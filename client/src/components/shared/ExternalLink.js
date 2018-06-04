// @flow
import React from 'react'
import External from 'react-icons/lib/fa/external-link'

type Props = {
  url: string,
  text: string,
};

const ExternalLink = ({url, text} :Props) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {text}&nbsp;<External />
  </a>
)

export default ExternalLink
