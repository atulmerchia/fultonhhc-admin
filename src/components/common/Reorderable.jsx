import React from 'react';
import Icon from '@material-ui/core/Icon';
import { Hidden } from 'components/forms'

export default class Reorderable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { list: (props.list || []).slice() };
  }

  componentWillReceiveProps(props) {
    this.setState({ list: (props.list || []).slice() })
  }

  onDragStart (e, index) {
    this.dragging = this.state.list[index];
    e.dataTransfer.setData("text/html", e.currentTarget);
  }

  onDragOver (index) {
    if (this.dragging === this.state.list[index]) return;
    let list = this.state.list.filter(item => item !== this.dragging)
    list.splice(index, 0, this.dragging)
    this.setState({ list });
  }

  deleteItem (index) {
    let { list } = this.state;
    list.splice(index, 1);
    if (list.length || !this.props.needsOne) this.setState({ list });
  }

  getList () { return this.state.list; }

  render() {
    return (
      <div className={`reorderable-list ${`reorderable-list-${this.props.layout || "col"}`} ${this.props.className || ""}`}>
        {this.state.list.map( (item, i) => (
          <div
            key={i}
            className={"reorderable-item " + (this.props.innerClassName || "")}
            draggable
            onDragOver={_ => this.onDragOver(i)}
            onDragStart={e => this.onDragStart(e, i)}
            onDragEnd={_ => { this.dragging = null }}
          >
            <Icon className="delete" onClick={_ => this.deleteItem(i)}>delete</Icon>
            <this.props.component data={item} />
          </div>
        ))}
        {!this.props.adderComponent ? <></> :
        <div className={"reorderable-item " + (this.props.innerClassName || "")}>
          <this.props.adderComponent adder={x => this.setState({ list: this.state.list.concat(x) })} />
        </div>}
        <Hidden name={this.props.name} value={_ => this.state.list} />
      </div>
    )
  }
}
