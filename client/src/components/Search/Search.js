// @flow
import React from 'react'
import {Container} from 'reactstrap'
import SearchAutocomplete from './SearchAutocomplete'
import SearchResults from './SearchResults'

import './Search.css'

const Search = () => (
  <Container className="" style={{maxWidth: '1200px'}}>
    {/* $FlowFixMe Connected components are hard to type */}
    <SearchAutocomplete />
    {/* $FlowFixMe Connected components are hard to type */}
    <SearchResults />
  </Container>
)

export default Search
