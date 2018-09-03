import React, { Component } from 'react';
import Navigation from './Navigation';
import './Main.css';
import Legend from './Legend';

export default class Main extends Component {

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="sidebar">
            <div id="myAffix">
              <Navigation />
              <Legend />
              <div className="fbfooter">
                <hr />
                <div className="row">
                  <div className="col-sm-offset-2 col-sm-10 col-xs-offset-2 col-xs-10">
                    <iframe src="https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Fverejne.digital&width=111&layout=button_count&action=like&size=small&show_faces=true&share=true&height=46&appId=" width="200" height="23" className="fbIframe" scrolling="no" frameBorder="0" allowTransparency="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="main">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
