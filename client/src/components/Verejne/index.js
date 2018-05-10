import React from 'react'
import GoogleMap from './GoogleMap'
import './App.css'

const Verejne = () => (
  <div id="wrapper">
    <div id="stream">
      <nav className="sidebarnav navbar">
        <div className="navbar-header" id="world-top">
          <button
            type="button" className="navbar-toggle"
            data-toggle="collapse" data-target=".navbar-collapse"
          >
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
          <a className="navbar-brand"><img src="/SKico.png" height="22" /></a> <a className="navbar-brand">verejne<span style={{fontWeight: 400}}>.digital</span></a>
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav">
            <li><a href="https://medium.com/@verejne.digital/o-%C4%8Do-ide-verejne-digital-14a1c6dcbe09"
              target="_blank"
            >o projekte</a></li>
            <li><a href="http://www.facebook.com/verejne.digital" target="_blank">kontaktuj nás na Facebooku</a></li>
            <li><a href="profil/">profil.verejne.digital </a></li>
            <li><a href="prepojenia/index.html">prepojenia.verejne.digital </a></li>
            <li><a href="obstaravania/index.html">obstaravania.verejne.digital</a></li>
          </ul>
        </div>
      </nav>

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

      <div className="modal fade" id="aboutModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <center><h3>verejne.digital</h3></center>
            </div>
            <div className="modal-body" id="aboutContent" />
          </div>
        </div>
      </div>

      <div className="list-group" id="info_list" />
    </div>
    {/*<div id="map" />*/}
    <GoogleMap />
    <div id="legend">
      <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=false&height=46&appId=" width="151" height="23" style={{border: 'none', overflow: 'hidden'}} scrolling="no" frameBorder="0" />
      <button type="button" className="close" onClick={() => console.log('close')}><span aria-hidden="true">&times;</span></button>
      <p><span style={{color: '#0062db', fontSize: '18px'}}><i className="fa fa-circle-o" aria-hidden="true" /></span>&nbsp; Firma / Osoba</p>
      <p style={{marginTop: '-10px'}}><span style={{color: '#0062db', fontSize: '18px'}}><i className="fa fa-circle" aria-hidden="true" /></span>& nbsp; Obchod so štátom</p >
      <p style={{marginTop: '-10px'}}><span style={{color: '#e55600', fontSize: '18px'}}><i className="fa fa-circle-o" aria-hidden="true" /></span> & nbsp; Kontakt s politikou</p >
      <p style={{marginTop: '-10px'}}><span style={{color: '#e55600', fontSize: '18px'}}><i className="fa fa-circle" aria-hidden="true" /></span> & nbsp; Kontakt s politikou <br /> & nbsp;& nbsp;& nbsp;& nbsp; a obchod so štátom</p >
    </div >
  </div >
)
export default Verejne
