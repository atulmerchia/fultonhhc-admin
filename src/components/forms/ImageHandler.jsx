import React, { Component } from 'react'
import ReactCrop from 'react-image-crop'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/react'
import Firebase from 'lib/firebase-client'
import API from 'lib/api'

const DEFAULT_INFO = "Uploading. This screen will close when done. This may take 1-2 minutes."
const DEFAULT_CROP = { unit: "%", width: 100, height: 100 }

class ImageHandler extends Component {
  constructor(props) {
    super(props);

    this.state = { open: false, enabled: false, src: [], crop: DEFAULT_CROP }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.show = this.show.bind(this);

    this.uppy = Uppy({
      restrictions: { allowedFileTypes: ['image/jpeg', '.jpg', '.jpeg'] },
      onBeforeFileAdded: f => {
        if(f.meta.cropped) return true;

        let reader = new FileReader();
        reader.addEventListener("load", _ => this.setState({ src: this.state.src.concat({ name: f.name, data: reader.result }) }));
        reader.readAsDataURL(f.data);
        return false;
      }
    })

    this.uppy.on('upload', this.handleUpload);
  }

  handleUpload(data) {
    if (this.state.uploading) return this.uppy.info("Currently uploading. Please wait.");

    this.setState({ uploading: true });
    this.uppy.info("Initializing...");

    const files = data.fileIDs.length && data.fileIDs.map(id => this.uppy.getFile(id).data);
    if (!files) return window.alert("Failed to fetch file");

    this.uppy.info(DEFAULT_INFO, 1000*60);

    const { bucket, callback } = this.state;
    console.log(files);
    API.imgPost(bucket, files)
      .then(res => this.setState({ open: false, uploading: false }, _ => callback(res)))
      .catch(err => {
        console.log(err);
        this.setState({ uploading: false });
        this.uppy.info(err.err);
        window.alert(err.err);
      })
  }

  componentWillUnmount() { this.uppy.close() }

  show(bucket, callback) { this.setState({ open: true, bucket, callback }) }

  handleSubmit() {
    this.getCroppedImg(this.state.img, this.state.crop)
      .then(data => this.uppy.addFile({
        name: this.state.src.pop().name,
        type: 'image/jpeg',
        data: data,
        isRemote: false,
        meta: { cropped: true }
      }))
      .then(_ => this.setState({ crop: DEFAULT_CROP, enabled: false }))
  }

  getCroppedImg(image, crop) {
    const fileName = "cropped.jpeg";
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) return console.error("Canvas is empty");
        blob.name = fileName;
        resolve(blob);
      }, "image/jpeg");
    });
  }

  render(){
    return (
      <>
        <DashboardModal
          uppy={this.uppy}
          open={this.state.open}
          onRequestClose={_ => this.setState({ src: [], open: false, crop: DEFAULT_CROP })}
        />
        {this.state.src.length && this.state.open ?
          <div className="uppy-Dashboard--modal mimic">
            <div className="uppy-Dashboard-inner mimic">
              <ReactCrop
                src={this.state.src[this.state.src.length-1].data}
                crop={this.state.crop}
                onImageLoaded={img => this.setState({ img: img, enabled: true })}
                onChange={crop => this.setState({ crop })}
              />
              {this.state.enabled
                ? <div className="btn-group-rt">
                    <div
                      className="btn btn-alt"
                      onClick={_ => this.setState({ src: this.state.src.slice(0, -1), crop: DEFAULT_CROP }) }
                    >
                      Cancel
                    </div>
                    <div className="btn btn-primary" onClick={this.handleSubmit}>Crop</div>
                  </div>
                : <></>
              }
            </div>
          </div>
        : <></>}
      </>
    )
  }
}

ImageHandler.registerInstance = ref => { ImageHandler.instance = ref; }
ImageHandler.show = (b,c) => ImageHandler.instance.show(b,c)

export default ImageHandler;
