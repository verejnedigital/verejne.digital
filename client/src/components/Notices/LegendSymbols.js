import QuestionCircle from 'react-icons/lib/fa/question-circle'
import ExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'
import classnames from 'classnames'
import React from 'react'

export function getWarningSymbol(level: number) {
  if (level < 0) {
    return <QuestionCircle className={classnames('warning', `warning${level}`)} />
  } else if (level > 0) {
    return <ExclamationTriangle className={classnames('warning', `warning-${level}`)} />
  } else {
    return ''
  }
}

export function formatSimilarPercent(value: number) {
  const styles = [
    {style: 'similarity-high', num: 75},
    {style: 'similarity-medium', num: 50},
    {style: 'similarity-low', num: 25},
    {style: '', num: -1},
  ]

  return (
    <span className={classnames('similarity', styles.find((style) => value > style.num).style)}>
      {value}%
    </span>
  )
}

export function formatSimilarCount(value: number) {
  return (
    <span className="similar-count" title={value}>
      {value > 20 ? '20+' : value}
    </span>
  )
}
