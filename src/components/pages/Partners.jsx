import React from 'react'
import API from 'lib/api'
import { ImageTrigger, Loading, Reorderable } from 'components/common';
import { Form, Input, Submit } from 'components/forms';
import Icon from '@material-ui/core/Icon'

const open = e => {
  e = e.currentTarget.parentNode;
  e.classList.toggle('collapsible-open');
  e.style.maxHeight = `${e.scrollHeight}px`;
}

const sort = data => Object.entries(data).sort( (a,b) => a[1].org < b[1].org && a[0] !== '_' ? -1 : 1 )

export default class Partners extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.addItem = this.addItem.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.handleDiscard = this.handleDiscard.bind(this);
    this.handleSubmitPartner = this.handleSubmitPartner.bind(this);
  }

  componentDidMount() {
    API.get('/about')
      .then(data => this.setState({
        loading: false,
        data: data.partners,
        people: data.people.join(', '),
        cover_photo: data.cover_photo
      }))
      .catch(err => window.alert(err.err))
  }

  handleDiscard (key, val) {
    delete this.state.data[key];
    this.forceUpdate(
      _ => this.setState({ data: Object.assign(this.state.data, { [key]: val } ) },
      _ => document.getElementById(key).click()
    ))
  }

  handleSubmit (data) {
    data = API.validate(data, 'about');
    if (data) API.put('/about', data).catch(err => window.alert(err.err));
  }

  addItem() {
    this.setState(
      { data: Object.assign(this.state.data, { "_": { org: "New Partner" } }) },
      _ => document.getElementById("_").click()
    )
  }

  addPerson(key, adder) {
    let x = parseInt(window.prompt('Enter 1 if person, 2 if group, 3 if person with title'));
    if (x === 1) adder(window.prompt('Enter person'));
    else if (x === 2) adder([[window.prompt('Enter group')]]);
    else if (x === 3) adder([[window.prompt('Enter title'), window.prompt('Enter person')]]);
    else return;
    x = document.getElementById(key);
    x.click(); x.click();
  }

  deleteItem (key) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const deleted = this.state.data[key];
    delete this.state.data[key];
    this.forceUpdate();

    if (key && key !== '_') API.delete(`/about/${key}`)
      .catch(err => this.setState({ data: Object.assign(this.state.data, { [key]: deleted }) },
        _ => {
          document.getElementById(key).click()
          console.log(err);
          window.alert(err.err)
        }));
  }


  handleSubmitPartner(data) {
    console.log(data);
    let { id } = data;
    console.log(id);
    if (id === "_") id = "";
    data = API.validate(data, 'partner');
    if (id !== null && data) API.post(`/about/${id}`, data)
      .then(data => {
        delete this.state.data[id || "_"];
        this.setState(
          { data: Object.assign(this.state.data, data) },
          _ => !id && document.getElementById(Object.keys(data)[0]).click()
        )
      })
      .catch(err => { console.log(err); window.alert(err.err) })
  }

  render () {
    if (this.state.loading) return <Loading/>
    return (
      <div className="partners">
        <div className="collapsible">
          <div className="header" onClick={open}>HHC Members and Cover Photo</div>
          <Form onSubmit={this.handleSubmit} style={{width: '50%'}}>
            <Input name="people" prompt="HHC Members" defaultValue={this.state.people}/>
            <div className="img-handler">
              <div className="lock-aspect lock-aspect-16x9">
                <ImageTrigger bucket="partners" onUpload={url => this.setState({ cover_photo: url })}>
                  <input name="cover_photo" type="hidden" value={this.state.cover_photo} />
                  <img src={this.state.cover_photo} />
                  <div className="cover">Change photo</div>
                </ImageTrigger>
              </div>
            </div>
            <Submit className="btn btn-primary top">Save changes</Submit>
          </Form>
        </div>
        {
          sort(this.state.data).map( ([key, val]) => (
            <div className="collapsible" key={key}>
              <div className="header" id={key} onClick={open}>{val.org}</div>
              <hr/>
              <Form onSubmit={this.handleSubmitPartner}>
                <input type="hidden" name="id" value={key}/>
                <Input name="org" prompt="Organization Name" defaultValue={val.org}/>
                <Input name="website" prompt="Website" defaultValue={val.website}/>
                <div className="img-handler">
                  <div className="lock-aspect lock-aspect-16x9">
                    <ImageTrigger bucket="partners" onUpload={url => { this.state.data[key].img_url = url; this.forceUpdate() }}>
                      <input name="img_url" type="hidden" value={val.img_url} />
                      <img src={val.img_url} />
                      <div className="cover">Change photo</div>
                    </ImageTrigger>
                  </div>
                </div>
                <Reorderable
                  name="people"
                  layout="col"
                  list={val.people || []}
                  component={ ({ data }) => (
                    <div>{Array.isArray(data)
                      ? <><em>{data[0]}</em>{data[1]}</>
                      : data
                    }</div>
                  )}
                  adderComponent={ ({ adder }) => <div className="btn btn-primary" onClick={_ => this.addPerson(key, adder)}>Add Person</div> }
                />
                <hr/>
                <div className="btn-group">
                  <div className="btn btn-alt" onClick={_ => this.handleDiscard(key, val)}>Discard Changes</div>
                  <Submit className="btn btn-primary">Save Changes</Submit>
                  <div className="btn btn-alt" style={{padding: "0 0.5rem"}} onClick={_ => this.deleteItem(key)}>
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
