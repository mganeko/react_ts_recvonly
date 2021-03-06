import React from 'react';
import ReactDOM from 'react-dom';
import Video from './video'; // video.tsx
//import Sora from 'sora-js-sdk';
import Sora, {
  //AudioCodecType,
  ConnectionOptions,
  //ConnectionPublisher,
  ConnectionSubscriber,
  VideoCodecType,
} from "sora-js-sdk";

import { MouseEvent } from 'react';

import './index.css';

// ----
// TODO
// ----

// ------ params -----
const signalingUrl = 'wss://sora-labo.shiguredo.jp/signaling';
let roomId = 'user@sora-room';
const roomFromUrl = getRoomFromUrl();
if (roomFromUrl && (roomFromUrl !== '')) {
  roomId = roomFromUrl;
}
let signalingKey = '';
const keyFromUrl = getKeyFromUrl();
if (keyFromUrl && (keyFromUrl !== '')) {
  signalingKey = keyFromUrl;
}

// ---- URL ----
function getRoomFromUrl(): string {
  const search = window.location.search;
  const re = new RegExp('room=([^&=]+)');
  const results = re.exec(search);
  let room = '';
  if (results) {
    room = results[1];
  }
  return room;
}

function getKeyFromUrl(): string | null {
  const search = window.location.search;
  const re = new RegExp('key=([^&=]+)');
  const results = re.exec(search);
  let key = null;
  if (results) {
    key = results[1];
  }
  return key;
}

// --- Sora -----
const debug = false; //true;
const sora = Sora.connection(signalingUrl, debug);

// ------ App class ------
// interface SoraAppPropsInterface {
//   text?: string;
// }

interface SoraAppStateInterface {
  //playing: boolean;
  connected: boolean;
  roomId: string;
  signalingKey: string;
  videoCodec: VideoCodecType;
  remoteStreams: { [key: string]: MediaStream; }
}

class App extends React.Component {
  //localStream: MediaStream | null;
  subscriber: ConnectionSubscriber | null;
  state: SoraAppStateInterface;

  constructor(props: object) {
    super(props);
    //this.localStream = null;
    this.state = {
      //playing: false,
      connected: false,
      roomId: roomId,
      signalingKey: signalingKey,
      videoCodec: 'H264',
      remoteStreams: {},
    };

    // This binding is necessary to make `this` work in the callback
    //this.startVideo = this.startVideo.bind(this);
    //this.stopVideoHandler = this.stopVideoHandler.bind(this);
    //this.stopVideo = this.stopVideo.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
    //this.handleCodecChange = this.handleCodecChange.bind(this);
    this.addRemoteStream = this.addRemoteStream.bind(this);
    this.removeRemoteStream = this.removeRemoteStream.bind(this);
    this.removeAllRemoteStream = this.removeAllRemoteStream.bind(this);

    // -- Sora connection --
    this.subscriber = null;
  }

  componentDidMount() {
    console.log('App DidMound()');
  }

  componentWillUnmount() {
    console.log('App WillUnmount()');
    //if (this.localStream) {
    //  this.stopVideo();
    //}
  }

  // -----------
  // startVideo(e: MouseEvent<HTMLButtonElement>) {
  //   e.preventDefault();
  //   console.log('start Video');
  //   if (this.localStream) {
  //     console.warn('localVideo ALREADY started');
  //     return;
  //   }

  //   const constraints = { video: true, audio: true };
  //   navigator.mediaDevices.getUserMedia(constraints)
  //     .then(stream => {
  //       this.localStream = stream;
  //       this.setState({ playing: true });
  //     })
  //     .catch(err => console.error('media ERROR:', err));
  // }

  // stopVideoHandler(e: MouseEvent<HTMLButtonElement>) {
  //   e.preventDefault();
  //   console.log('stop Video');
  //   this.stopVideo();
  // }

  // stopVideo() {
  //   if (this.localStream) {
  //     this.localStream.getTracks().forEach(track => track.stop());
  //     this.localStream = null;
  //     this.setState({ playing: false });
  //   }
  // }

  // -----------------
  connect(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log('connect');
    if (this.subscriber) {
      console.warn('ALREADY connected');
      return;
    }

    const metadata = {
      signaling_key: this.state.signalingKey
    };
    const options: ConnectionOptions = {
      audio: true,
      multistream: false,
      video: true,
      videoCodecType: this.state.videoCodec,
      videoBitRate: 800,
    };
    const app = this;
    //console.log('app:', app);

    console.log('connecting roomId=%s codec=%s key=%s', this.state.roomId, options.videoCodecType, this.state.signalingKey);
    this.subscriber = sora.recvonly(this.state.roomId, metadata, options);

    this.subscriber.on('track', function (event: RTCTrackEvent) {
      const stream = event.streams[0];
      if (stream) {
        console.log('addtrack stream.id=%s', stream.id);
      }
      else {
        console.warn('NO stream in on track');
        return;
      }

      // --- for multi stream ---
      const id = 'remote_' + stream.id;
      app.addRemoteStream(id, stream);
    });

    this.subscriber.on('removetrack', function (event: MediaStreamTrackEvent) {
      const kind = event.track?.kind;
      const targetStream = event.target as MediaStream;
      if (targetStream != null) {
        const trackCount = targetStream.getTracks().length;
        console.log('removetracks stream.id=%s, trackKind=%s, track count=%d', targetStream.id, kind, trackCount);
        if (trackCount > 0) {
          return;
        }

        // --- for multi stream ---
        const id = 'remote_' + targetStream.id;
        app.removeRemoteStream(id);
      }
    });

    this.subscriber.on('disconnect', (e: any) => {
      console.log('sora disconnected:', e);
      this.handleDisconnect()
    });

    this.subscriber.connect()
      .then(() => {
        console.log('sora connected');
        app.setState({ connected: true });
      })
      .catch((err: any) => {
        console.error('sora connect ERROR:', err);
        this.subscriber = null;
        this.setState({ connected: false });
      });
  }

  disconnect(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log('disconnect');
    this.handleDisconnect();
  }

  handleDisconnect() {
    if (this.subscriber) {
      this.subscriber.disconnect();
      this.subscriber = null;
    }

    this.removeAllRemoteStream();
    this.setState({ connected: false });
  }

  handleRoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ roomId: e.target.value });
  }

  handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ signalingKey: e.target.value });
  }

  // handleCodecChange(e: React.ChangeEvent<HTMLSelectElement>) {
  //   this.setState({ videoCodec: e.target.value });
  // }

  addRemoteStream(id: string, stream: MediaStream) {
    if (this.state.remoteStreams[id]) {
      // already exist
      console.log('remote stream ALREADY exist id=' + id);
      return;
    }

    const clonedStreams = Object.assign({}, this.state.remoteStreams);
    clonedStreams[id] = stream;
    this.setState({ remoteStreams: clonedStreams });
  }

  removeRemoteStream(id: string) {
    const clonedStreams = Object.assign({}, this.state.remoteStreams);
    delete clonedStreams[id];
    this.setState({ remoteStreams: clonedStreams });
  }

  removeAllRemoteStream() {
    const newStreams = {};
    this.setState({ remoteStreams: newStreams });
  }

  // -----------------
  render() {
    console.log('App render()');

    const remoteVideos: JSX.Element[] = [];
    Object.keys(this.state.remoteStreams).forEach(function (this: { [key: string]: MediaStream; }, key: string) {
      const stream: MediaStream = this[key]; // this は this.state.remoteStream
      console.log('key=id=%s, stream.id=%s', key, stream.id);
      remoteVideos.push(
        <Video id={key} key={key} width={"100%"} height={""} volume={0.5} controls={true} stream={stream}>
        </Video>
      );
    }, this.state.remoteStreams);

    return (
      <div className="App" >
        React-Sora RecvOnly for momo monitor<br />
        { /*
        Video Codec:
        <select value={this.state.videoCodec} onChange={this.handleCodecChange} disabled={this.state.connected} >
          <option value="VP8">VP8</option>
          <option value="VP9">VP9</option>
          <option value="H264">H264</option>
          <option value="H265">H265</option>
        </select>
        &nbsp;
        <button onClick={this.startVideo} disabled={this.state.playing || this.state.connected}> Start Video</button >
        <button onClick={this.stopVideo} disabled={!this.state.playing || this.state.connected}>Stop Video</button>
        <br />
        */ }
        SignalingKey: <input id="signaling_key" type="text" size={32} value={this.state.signalingKey} onChange={this.handleKeyChange} disabled={this.state.connected}></input>
        <br />
        Room: <input id="room_id" type="text" value={this.state.roomId} onChange={this.handleRoomChange} disabled={this.state.connected}></input>
        <button onClick={this.connect} disabled={this.state.connected}> Connect</button >
        <button onClick={this.disconnect} disabled={!this.state.connected}>Disconnect</button>
        <br />
        <div className="VideoContainer">
          { /* <Video id={"local_video"} width={"160px"} height={"120px"} stream={this.localStream} 
          </Video> */ }
          <div className="RemoteContainer">
            {remoteVideos}
          </div>
        </div>
      </div >
    );
  }
}

// ====================== ReactDOM rendering ====================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
