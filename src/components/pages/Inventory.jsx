import React from 'react'
import API from 'lib/api'
import { ImageTrigger, Loading } from 'components/common';
import { Form, Input, Submit } from 'components/forms';
import Icon from '@material-ui/core/Icon'

const open = e => {
  e = e.currentTarget.parentNode;
  e.classList.toggle('collapsible-open');
  e.style.maxHeight = `${e.scrollHeight}px`;
}

const sort = data => Object.entries(data).sort( (a,b) => a[0] !== "_" && a[1].name < b[1].name ? -1 : 1 )

export default class Inventory extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.componentDidMount = this.componentDidMount.bind(this)

    this.addItem = this.addItem.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDiscard = this.handleDiscard.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  componentDidMount() {
    API.get('/inventory')
      .then(data => this.setState({ loading: false, data: data }))
      .catch(err => window.alert(err.err))
  }

  addItem() {
    this.setState(
      { data: Object.assign(this.state.data, { "_": { name: "New Item" } }) },
      _ => document.getElementById("_").click()
    )
  }

  handleSubmit(data) {
    let { id } = data;
    if (id === "_") id = "";
    data = API.validate(data, 'product');
    if (id !== null && data) API.post(`/inventory/${id}`, data)
      .then(data => {
        delete this.state.data[id || "_"];
        this.setState(
          { data: Object.assign(this.state.data, data) },
          _ => !id && document.getElementById(Object.keys(data)[0]).click()
        )
      })
      .catch(err => { console.log(err);window.alert(err.err) })
  }

  handleDiscard (key, val) {
    delete this.state.data[key];
    this.forceUpdate(
      _ => this.setState({ data: Object.assign(this.state.data, { [key]: val } ) },
      _ => document.getElementById(key).click()
    ))
  }

  deleteItem (key) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const deleted = this.state.data[key];
    delete this.state.data[key];
    this.forceUpdate();

    if (key && key !== '_') API.delete(`/inventory/${key}`)
      .catch(err => this.setState({ data: Object.assign(this.state.data, { [key]: deleted }) },
        _ => {
          document.getElementById(key).click()
          console.log(err);
          window.alert(err.err)
        }));
  }

  render() {
    if (this.state.loading) return <Loading/>
    return (
      <div className="inventory">
        {
          sort(this.state.data).map( ([key, val]) => (
            <div className="collapsible" key={key}>
              <div id={key} className="header" onClick={open}>
                <span className="name">{val.name}</span>
                <span className="price">{Number(val.price/100).toFixed(2)}</span>
              </div>
              <Form onSubmit={this.handleSubmit}>
                <input name="id" type="hidden" value={key} />
                <Input name="name" prompt="Product" defaultValue={val.name}/>
                <Input name="price" prompt="Price (USD)" type="number" defaultValue={Number(val.price/100).toFixed(2)}/>
                <Input name="details" prompt="Brief description" defaultValue={val.details}/>
                <div className="img-handler">
                  <div className="lock-aspect lock-aspect-1x1">
                    <ImageTrigger bucket="inventory" onUpload={url => { this.state.data[key].img_url = url; this.forceUpdate() }}>
                      <input name="img_url" type="hidden" value={val.img_url} />
                      <img src={val.img_url} />
                      <div className="cover">Change photo</div>
                    </ImageTrigger>
                  </div>
                </div>
                <div className="btn-group">
                  <div onClick={_ => this.handleDiscard(key, val)} className="btn btn-alt">Discard Changes</div>
                  <Submit className="btn btn-primary">Save Changes</Submit>
                  <div className="btn btn-alt" style={{padding: "0.5rem"}} onClick={_ => this.deleteItem(key)}>
                    <Icon fontSize="large">delete</Icon>
                  </div>
                </div>
              </Form>
            </div>
          ))
        }
        <div className="btn btn-primary" onClick={this.addItem}>Add new</div>
      </div>
    )
  }
}
