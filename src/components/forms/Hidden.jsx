import React from 'react'
import HiddenValueStore from 'lib/hidden-value-store'
import uuid from 'uuid/v4'

export default class Hidden extends React.Component {
  constructor(props) {
    super(props);
    this.valueKey = uuid();
  }

  componentWillUnmount() { HiddenValueStore.erase(this.valueKey); }

  render() {
    HiddenValueStore.store(this.valueKey, this.props.value);
    return <input className="HVS" name={this.props.name} type="hidden" value={this.valueKey}/>
  }
}
