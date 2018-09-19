// @flow
import QuestionCircle from 'react-icons/lib/fa/question-circle'
import ExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'
import classnames from 'classnames'
import React from 'react'

export const getWarningSymbol = (level: number, title: string | null = null) => {
  if (level < 0) {
    return (
      <div className="warning-symbol" title={title}>
        <QuestionCircle className={classnames('warning', `warning${level}`)} />
      </div>
    )
  } else if (level > 0) {
    return (
      <div className="warning-symbol" title={title}>
        <ExclamationTriangle className={classnames('warning', `warning-${level}`)} />
      </div>
    )
  } else {
    return ''
  }
}

export const formatSimilarPercent = (value: number) => {
  let style
  if (value > 75) style = 'similarity-high'
  else if (value > 50) style = 'similarity-medium'
  else if (value > 25) style = 'similarity-low'
  else style = ''

  return <span className={classnames('similarity', style)}>{value}%</span>
}

export const formatSimilarCount = (value: number) => (
  <span className="similar-count" title={value}>
    {value > 20 ? '20+' : value}
  </span>
)
