import React from 'react'
import External from 'react-icons/lib/fa/external-link'

export default ({url, text}) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {text}&nbsp;<External />
  </a>
)
