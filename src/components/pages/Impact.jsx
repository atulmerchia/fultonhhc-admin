import React from 'react'
import API from 'lib/api'
import { ImageTrigger, Loading, Reorderable, RichEditor } from 'components/common'
import { Dropdown, Form, Input, Submit } from 'components/forms'
import Icon from '@material-ui/core/Icon'

export default class Impact extends React.Component {
  constructor (props) {
    super(props);
    this.state = { loading: true, selected: null };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addItem = this.addItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  componentDidMount () {
    API.get('/impact')
      .then(data => this.setState({ loading: false, data: data }))
      .catch(err => window.alert(err.err))
  }

  handleSubmit (data) {
    const id = this.state.selected;
    data = API.validate(data, 'impact');
    if (id !== null && data) API.post(`/impact/${id}`, data)
      .then(data => {
        delete this.state.data[id];
        this.setState({
          data: Object.assign(this.state.data, data),
          selected: Object.keys(data)[0]
        })
      })
      .catch(err => window.alert(err.err))
  }

  addItem() {
    this.setState({
      data: Object.assign(this.state.data, { "": {} }),
      selected: ""
    })
  }

  deleteItem () {
    const id = this.state.selected;

    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const deleted = this.state.data[id];
    delete this.state.data[id];
    this.forceUpdate();

    if (id) API.delete(`/impact/${id}`)
      .then(_ => this.setState({ selected: null }))
      .catch(err => this.setState({
        data: Object.assign(this.state.data, { [id]: deleted }),
        selected: id
      }, _ => {
        console.log(err);
        window.alert(err.err)
      }));
  }

  render () {
    if (this.state.loading) return <Loading/>

    console.log(this.state);
    let selected = this.state.data[this.state.selected];
    return (
      <div className="impact">
        <div className="header">
          <Dropdown
            current={selected && selected.title}
            options={this.state.data}
            sort={ (a,b) => a[1].title < b[1].title ? -1 : 1}
            textExtractor={x => x[1].title}
            onSelect={x => this.setState({ selected: x[0] })}
          />
          <div className="btn btn-primary" onClick={this.addItem}>Add new</div>
        </div>
        {!selected ? <></> :
          <div className="editor">
            <Form onSubmit={this.handleSubmit}>
              <input name="id" type="hidden" value={selected.id}/>
              <Input name="title" prompt="Title" defaultValue={selected.title}/>
              <hr/>
              <h2>Cover Images</h2>
              <Reorderable
                name="img_urls"
                layout="grid"
                list={selected.img_urls}
                component={ ({ data }) => <div className="lock-aspect lock-aspect-16x9"><img src={data}/></div>}
                adderComponent={ ({ adder }) => (
                  <ImageTrigger className="lock-aspect lock-aspect-16x9" bucket="impact" onUpload={adder}>
                    <Icon className="cover">add</Icon>
                  </ImageTrigger>
                )}
              />
              <hr/>
              <RichEditor name="Information" defaultValue={selected.description} id="description"/>
              <div className="btn-group">
                <div className="btn btn-alt" onClick={this.componentDidMount}>Discard Changes</div>
                <Submit className="btn btn-primary">Save Changes</Submit>
                <div className="btn btn-alt" style={{padding: "0.5rem"}} onClick={this.deleteItem}>
                  <Icon fontSize="large">delete</Icon>
                </div>
              </div>
            </Form>
          </div>
        }
      </div>
    )
  }
}
