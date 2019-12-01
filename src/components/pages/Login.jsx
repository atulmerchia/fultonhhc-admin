import React from 'react';
import { Form, Input, Submit } from 'components/forms'
import Icon from '@material-ui/core/Icon'
import Logo from 'assets/logo.svg'
import Firebase from 'lib/firebase-client'

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = { err: false, working: false }
  }

  submit(data) {
    this.setState({ err: false, working: true });
    Firebase.signIn(data).catch(err => this.setState({ err: "Invalid email/password", working: false }))
  }

  render() {
    return (
      <div className="login">
        <img src={Logo}/>
        <h1>Fulton County Healthy Heart Coalition</h1>
        <h2>Admin Portal</h2>
        <Form onSubmit={this.submit}>
          <div className="form">
            <div className="row">
              <Input name="email" placeholder="email" prompt="Email" type="email"/>
            </div>
            <div className="row">
              <Input name="password" placeholder="password" prompt="Password" type="password"/>
            </div>
            <div className={"err-" + !!this.state.err}>{this.state.err || "This site keeps you signed in"}</div>
          </div>
          <Submit disabled={this.state.working}>
            {this.state.working ? "Authorizing" : "Log in"}
            {this.state.working ? <Icon className="spinning">autorenew</Icon> : <></>}
          </Submit>
        </Form>
      </div>
    )
  }
}
