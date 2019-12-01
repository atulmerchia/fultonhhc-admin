import React from 'react'

export default class Checkbox extends React.Component {
  constructor (props) {
    super(props);
    this.state = { value: props.defaultValue };
  }

  render() {
    return (
      <div className={this.props.className} onClick={_ => this.props.onClick(this)}>
        {this.props.children}
        <input type="checkbox" checked={this.state.value} />
      </div>
    )
  }
}
