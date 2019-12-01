import React from 'react';

const Submit = props => (
  <div
    {...props}
    className={"submit " + (props.className || "") + (props.disabled ? " disabled" : "")}
    tabIndex="0"
  >
    {props.children}
    <input className="hidden-submit" type="submit"/>
  </div>
);

export default Submit;
