import React from 'react'
import GoogleMap from './GoogleMap'
import './Verejne.css'
import Legend from './Legend'

const Verejne = ({legendOpen, setLegendOpen}) => (
  <div id="wrapper">
    <div id="stream">
      <div style={{padding: '3px'}}>
        <input id="entitysearch-fake" className="form-control" type="text" placeholder="Hľadaj firmu / človeka"
          data-toggle="modal" data-target="#searchEntityModal" style={{margin: '2px'}}
        />
        <input id="search-field" className="form-control" type="text" placeholder="Hľadaj adresu" style={{margin: '2px'}} />
      </div>

      <div className="modal fade" id="searchEntityModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <input id="entitysearch" className="form-control" type="text" style={{width: '300px'}}
                placeholder="Hľadaj firmu / človeka"
              />
              <label id="search-status" style={{margin: '5px'}} />
            </div>
            <div id="search-results" className="modal-body" />
          </div>
        </div>
      </div>

      <div className="list-group" id="info_list" />
    </div>
    <GoogleMap />
    <Legend />
  </div >
)
export default Verejne
