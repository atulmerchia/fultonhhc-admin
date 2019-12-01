import React from 'react'
import helpers from 'lib/api'

const open = e => {
  e.currentTarget.classList.toggle('dropdown-open');
  e = e.currentTarget.children[1];
  e.style.maxHeight = `${e.scrollHeight}px`;
}

const Dropdown = props => (
  <div className="dropdown" onClick={open}>
    <div className="dropdown-display">
      {props.current || props.placeholder || "Select option..."}
      <div className="dropdown-caret" />
    </div>
    <div className="dropdown-menu">
      {Object.entries(props.options).sort(props.sort).map(opt => (
        <div
          className="dropdown-item"
          onClick={_ => props.onSelect(opt)}
        >
          {props.textExtractor(opt)}
        </div>
      ))}
    </div>
  </div>
)

export default Dropdown;
