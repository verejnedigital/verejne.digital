// @flow
import React from 'react'

type Props = {
  text: string,
}

const DummyResults = ({text}: Props) => (
  <div className="row align-items-center">
    <div className="col">
      <h3 className="text-center">{text}</h3>
    </div>
  </div>
)

export const BeforeResults = () =>
  DummyResults({text: 'Zadajte dvojicu pre začiatok vyhľadávania.'})
export const EmptyResults = () =>
  DummyResults({text: 'Prepojenie neexistuje.'})
export const NoEntityResults = () =>
  DummyResults({text: 'Daná osoba nebola nájdená'})
