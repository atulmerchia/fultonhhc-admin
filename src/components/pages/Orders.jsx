import React from 'react'
import API from 'lib/api'
import helpers from 'lib/helpers'
import { Loading } from 'components/common';
import { Checkbox, Form, Input, Submit } from 'components/forms';
import Icon from '@material-ui/core/Icon'

const open = e => {
  e = e.currentTarget.parentNode;
  e.classList.toggle('collapsible-open');
  e.style.maxHeight = `${e.scrollHeight}px`;
}

export default class Orders extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount() {
    Promise.all([API.get('/order'), API.get('/inventory')])
      .then( ([data, inventory]) => this.setState({
        loading: false,
        data: Object.entries(data).sort( ([_a,a],[_b,b]) => {
          if (a.fulfilled != b.fulfilled) return a.fulfilled ? 1 : -1;
          return a.fulfilled ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
        }),
        inventory: inventory
      }))
      .catch(err => window.alert(err.err))
  }

  toggleFulfillment(ref, key) {
    const value = !ref.state.value;
    ref.setState({ value })
    API.put(`/order/${key}`, { fulfilled: value })
      .catch(err => ref.setState({ value: !value }, _ => window.alert(err.err)))
  }

  render() {
    if (this.state.loading) return <Loading/>
    return (
      <div className="orders">
        {
          this.state.data.map( ([key, val]) => (
            <div className="collapsible" key={key}>
              <div className={"header fulfilled-" + val.fulfilled} onClick={open}>
                <span className="name">{val.customer.name}</span>
                <span className="price">{helpers.formatDay(val.createdAt)}</span>
              </div>
              <div className="summary">
                <div>Confirmation:
                  <div>Confirmation #{val.confirmation}</div>
                  <div>Order placed {helpers.formatDay(val.createdAt)}</div>
                  <Checkbox className="fulfilled" defaultValue={val.fulfilled} onClick={ref => this.toggleFulfillment(ref, key)}>
                    fulfilled
                  </Checkbox>
                </div>
                <div>Contact information:
                  <div>Name: {val.customer.name}</div>
                  <div>Email: {val.customer.contact.email}</div>
                  <div>Phone: {helpers.num2phone(val.customer.contact.phone)}</div>
                </div>
                <div>Shipping Address:
                  <div>{val.customer.shipping_address.address_line1}</div>
                  {val.customer.shipping_address.address_line2 ? <div>{val.customer.shipping_address.address_line1}</div> : <></>}
                  <div>{val.customer.shipping_address.city}, {val.customer.shipping_address.state} {val.customer.shipping_address.zip}</div>
                </div>
                <div>Payment information:
                  <div>Paid: {helpers.formatDollar(val.payment.amount)}</div>
                  <div>Card: {val.payment.card} ending in {val.payment.last4}</div>
                </div>
                <div>Billing Address:
                  <div>{val.payment.billing_address.address_line1}</div>
                  {val.payment.billing_address.address_line2 ? <div>{val.payment.billing_address.address_line1}</div> : <></>}
                  <div>{val.payment.billing_address.city}, {val.payment.billing_address.state} {val.payment.billing_address.zip}</div>
                </div>
                <div>Order:
                  {Object.entries(val.order).map(x => <div>{x[1]} x {this.state.inventory[x[0]].name}</div>)}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }
}
