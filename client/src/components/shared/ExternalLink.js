// @flow
import React from 'react'
import External from 'react-icons/lib/fa/external-link'

type Props = {
  url: string,
  text: string,
};

const ExternalLink = ({url, text} :Props) => (
  <button href={url} className="recursive-info-btn btn btn-link" target="_blank" rel="noopener noreferrer">
    {text}&nbsp;<External />
  </button>
)

export default ExternalLink
