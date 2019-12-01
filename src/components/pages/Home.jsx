import React from 'react';
import API from 'lib/api';
import { ImageTrigger, Loading, Reorderable, RichEditor } from 'components/common';
import { Form, Input, Submit } from 'components/forms';
import Icon from '@material-ui/core/Icon';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true }
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    API.get('/home')
      .then(data => this.setState({ loading: false, ...data }))
      .catch(err => window.alert(err.err))
  }

  handleSubmit(data) {
    data = API.validate(data, 'home');
    if (data) API.put('/home', data).catch(err => window.alert(err.err));
  }

  render() {
    if (this.state.loading) return <Loading/>
    return (
      <div className="home">
        <Form onSubmit={this.handleSubmit}>
          <Input name="title" prompt="Main header text" defaultValue={this.state.title}/>
          <Input name="subtitle" prompt="Secondary header text" defaultValue={this.state.subtitle}/>
          <hr/>
          <h2>Cover Images</h2>
          <Reorderable
            name="cover_images"
            layout="grid"
            list={this.state.cover_images}
            component={({ data }) => (
              <div className="lock-aspect lock-aspect-16x9">
                <img src={data}/>
              </div>
            )}
            adderComponent={({ adder }) => (
              <ImageTrigger className="lock-aspect lock-aspect-16x9" bucket="home" onUpload={adder}>
                <Icon className="cover">add</Icon>
              </ImageTrigger>
            )}
          />
          <hr/>
          <RichEditor name="Homepage Content" defaultValue={this.state.text} id="text"/>
          <div className="btn-group">
            <div className="btn btn-alt" onClick={this.componentDidMount}>Discard Changes</div>
            <Submit className="btn btn-primary">Save Changes</Submit>
          </div>
        </Form>
      </div>
    )
  }
}
