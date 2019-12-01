import React from 'react';
import Icon from '@material-ui/core/Icon';

const Loading = props => (
  <div id="loading-wrapper" className={props.wrapperClass}>
    <span>
      <Icon
        id="loading-icon"
        fontSize="large">
        favorite
      </Icon>
      <br/>
      Loading
    </span>
  </div>
)

export default Loading
