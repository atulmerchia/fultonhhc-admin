import React from 'react'
import HiddenValueStore from 'lib/hidden-value-store'

const getData = target => {
  let obj = {};
  for (var k of target) {
    obj[k.name] = k.type === "hidden" && k.classList.contains('HVS') ? HiddenValueStore.fetch(k.value) : k.value;
  }
  return obj;
}

const Form = props => (
  <form
    onSubmit={e => {
      e.preventDefault();
      props.onSubmit(getData(e.currentTarget))
    }} style={props.style || {}}>
    {props.children}
  </form>
)

export default Form;
