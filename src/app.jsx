import React from "react";
import { BrowserRouter, Switch, Redirect, Route, Link } from "react-router-dom"
import * as Pages from 'components/pages'
import { Sidebar } from 'components/common'
import { ImageHandler } from 'components/forms'
import { hot } from "react-hot-loader"
import Firebase from 'lib/firebase-client'
import "css/main.scss"

window.test = Firebase.token

class App extends React.Component {
  componentDidMount() { Firebase.registerApp(this); }
  componentDidUpdate() { ImageHandler.registerInstance(this.imageHandler); }

  render() {
    if (!Firebase.isLoggedIn()) return <div id="app-wrapper"><Pages.Login/></div>;

    return (
      <BrowserRouter>
        <ImageHandler ref={r => { this.imageHandler = r }}/>
        <Sidebar />
        <div id="app-wrapper">
          <Switch>
            <Route path="/home" component={Pages.Home} />
            <Route path="/impact" component={Pages.Impact} />
            <Route path="/inventory" component={Pages.Inventory} />
            <Route path="/orders" component={Pages.Orders} />
            <Route path="/partners" component={Pages.Partners} />
            <Route path="/general" component={Pages.General} />
            <Route path="/page-not-found" component={Pages.PageNotFound} />
            <Redirect from="/login" to="/home" />
            <Redirect exact from="/" to="/home" />
            <Redirect from="/*" to="/page-not-found"/>
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
};

export default hot(module)(App);
