// @flow
import React from 'react'
import {Container} from 'reactstrap'
import SearchAutocomplete from './SearchAutocomplete'
import SearchResults from './SearchResults'

import './Search.css'

const Search = () => (
  <Container className="" style={{maxWidth: '1200px'}}>
    <SearchAutocomplete />
    <SearchResults />
  </Container>
)

export default Search
