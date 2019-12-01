import React from 'react'
import { NavLink } from 'react-router-dom'
import Icon from '@material-ui/core/Icon'
import Firebase from 'lib/firebase-client'

const tabs = [
  ['Home',      '/home'         , 'home'],
  ['Impact',    '/impact'       , 'photos'],
  ['Inventory', '/inventory'    , 'store'],
  ['Orders',    '/orders'       , 'receipt'],
  ['Partners',  '/partners'     , 'people'],
  ['General',  '/general'     , 'settings']
]

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  render() {
    return (
      <nav className={"sidebar open-" + this.state.open}>
        <div className="header">
          <Icon onClick={_ => this.setState({ open: !this.state.open })}>
            {this.state.open ? 'close' : 'menu'}
          </Icon>
        </div>
        {tabs.map(t => (
          <NavLink activeClassName="active" className="tab" to={t[1]} onClick={_ => this.setState({ open: false })}>
            <Icon className="icon">{t[2]}</Icon>
            <span className="text">{t[0]}</span>
          </NavLink>
        ))}
        <NavLink className="tab" to="/login" onClick={_ => Firebase.signOut()}>
          <Icon className="icon">exit_to_app</Icon>
          <span className="text">Exit</span>
        </NavLink>
      </nav>
    )
  }
}
