import React from 'react'
import API from 'lib/api'
import helpers from 'lib/helpers'
import { Loading } from 'components/common'
import { Form, Input, Submit } from 'components/forms'

export default class General extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    Promise.all([API.get('/contact'), API.get('/meta')])
      .then( ([ci, m]) => this.setState({
        loading: false,
        data: {
          ...ci,
          phone: helpers.num2phone(ci.phone),
          calendar_id: m.calendar_id,
          purchase_order_email: m.purchase_order_email,
          ...m.social_media
        }
      }))
      .catch(err => window.alert(err.err))
  }

  handleSubmit(data) {
    const contact = API.validate(data, 'contact');
    if (!contact) return;

    const meta = API.validate(data, 'meta');
    if (!meta) return;

    Promise.all([API.put('/contact', contact), API.put('/meta', meta)])
      .catch(err => window.alert(err.err));
  }

  render() {
    if (this.state.loading) return <Loading/>
    return (
      <div className="general">
        <Form onSubmit={this.handleSubmit}>
          <Input name="name" prompt="Name of Primary contact" defaultValue={this.state.data.name}/>
          <Input name="email" prompt="Contact Email" type="email" defaultValue={this.state.data.email}/>
          <Input name="phone" prompt="Contact Phone #" type="tel" format={helpers.num2phone} defaultValue={this.state.data.phone}/>
          <Input name="purchase_order_email" prompt="Email for Purchase Orders" type="email" defaultValue={this.state.data.purchase_order_email}/>
          <Input name="profile_fb" prompt="Facebook Page" defaultValue={this.state.data.profile_fb}/>
          <Input name="profile_ig" prompt="Instagram Account" defaultValue={this.state.data.profile_ig}/>
          <Input name="profile_tw" prompt="Twitter Account" defaultValue={this.state.data.profile_tw}/>
          <Input name="calendar_id" prompt="Event Google Calendar ID" defaultValue={this.state.data.calendar_id}/>
          <div className="btn-group">
            <div className="btn btn-alt" onClick={this.componentDidMount}>Discard Changes</div>
            <Submit className="btn btn-primary">Save Changes</Submit>
          </div>
        </Form>
        <h3>For tech support contact atulmerchia@gmail.com</h3>
      </div>
    )
  }
}
