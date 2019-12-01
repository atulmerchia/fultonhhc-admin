import React from 'react'
import { ImageHandler } from 'components/forms'

const ImageTrigger = props => (
  <div
    className={props.className}
    onClick={_ => ImageHandler.show(props.bucket, props.onUpload)}
  >
    {props.children}
  </div>
)

export default ImageTrigger
