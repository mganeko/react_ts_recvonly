(this.webpackJsonpreact_ts_recvonly=this.webpackJsonpreact_ts_recvonly||[]).push([[0],{14:function(e,t,n){},29:function(e,t,n){},30:function(e,t,n){"use strict";n.r(t);var o=n(3),a=n(4),s=n(1),i=n(8),c=n(7),r=n(0),l=n.n(r),d=n(5),m=n.n(d);n(14);var u=function(e){var t=Object(r.useRef)(null);return Object(r.useEffect)((function(){var n=e.stream,o=0;e.volume&&(o=e.volume);var a=t.current;null!=a?(a.srcObject===n?console.log("useEffect() same stream, so skip:",n):(a.srcObject=n,console.log("useEffect() set stream:",n)),a.volume=o):console.log("useEffect() ref.current NULL")})),console.log("Video rendering, id=%s",e.id),e.controls?l.a.createElement("video",{className:"video_with_border",ref:t,id:e.id,width:e.width,height:e.height,autoPlay:!0,muted:!0,playsInline:!0,controls:!0}):l.a.createElement("video",{className:"video_with_border",ref:t,id:e.id,width:e.width,height:e.height,autoPlay:!0,muted:!0,playsInline:!0})},h=n(6),v=n.n(h),b=(n(29),"user@sora-room"),g=function(){var e=window.location.search,t=new RegExp("room=([^&=]+)").exec(e),n="";t&&(n=t[1]);return n}();g&&""!==g&&(b=g);var f="",y=function(){var e=window.location.search,t=new RegExp("key=([^&=]+)").exec(e),n=null;t&&(n=t[1]);return n}();y&&""!==y&&(f=y);var k=v.a.connection("wss://sora-labo.shiguredo.jp/signaling",!1),p=function(e){Object(i.a)(n,e);var t=Object(c.a)(n);function n(e){var a;return Object(o.a)(this,n),(a=t.call(this,e)).subscriber=void 0,a.state=void 0,a.state={connected:!1,roomId:b,signalingKey:f,videoCodec:"H264",remoteStreams:{}},a.connect=a.connect.bind(Object(s.a)(a)),a.disconnect=a.disconnect.bind(Object(s.a)(a)),a.handleRoomChange=a.handleRoomChange.bind(Object(s.a)(a)),a.handleKeyChange=a.handleKeyChange.bind(Object(s.a)(a)),a.addRemoteStream=a.addRemoteStream.bind(Object(s.a)(a)),a.removeRemoteStream=a.removeRemoteStream.bind(Object(s.a)(a)),a.removeAllRemoteStream=a.removeAllRemoteStream.bind(Object(s.a)(a)),a.subscriber=null,a}return Object(a.a)(n,[{key:"componentDidMount",value:function(){console.log("App DidMound()")}},{key:"componentWillUnmount",value:function(){console.log("App WillUnmount()")}},{key:"connect",value:function(e){var t=this;if(e.preventDefault(),console.log("connect"),this.subscriber)console.warn("ALREADY connected");else{var n={signaling_key:this.state.signalingKey},o={audio:!0,multistream:!1,video:!0,videoCodecType:this.state.videoCodec,videoBitRate:800},a=this;console.log("connecting roomId=%s codec=%s key=%s",this.state.roomId,o.videoCodecType,this.state.signalingKey),this.subscriber=k.recvonly(this.state.roomId,n,o),this.subscriber.on("track",(function(e){var t=e.streams[0];if(t){console.log("addtrack stream.id=%s",t.id);var n="remote_"+t.id;a.addRemoteStream(n,t)}else console.warn("NO stream in on track")})),this.subscriber.on("removetrack",(function(e){var t,n=null===(t=e.track)||void 0===t?void 0:t.kind,o=e.target;if(null!=o){var s=o.getTracks().length;if(console.log("removetracks stream.id=%s, trackKind=%s, track count=%d",o.id,n,s),s>0)return;var i="remote_"+o.id;a.removeRemoteStream(i)}})),this.subscriber.on("disconnect",(function(e){console.log("sora disconnected:",e),t.handleDisconnect()})),this.subscriber.connect().then((function(){console.log("sora connected"),a.setState({connected:!0})})).catch((function(e){console.error("sora connect ERROR:",e),t.subscriber=null,t.setState({connected:!1})}))}}},{key:"disconnect",value:function(e){e.preventDefault(),console.log("disconnect"),this.handleDisconnect()}},{key:"handleDisconnect",value:function(){this.subscriber&&(this.subscriber.disconnect(),this.subscriber=null),this.removeAllRemoteStream(),this.setState({connected:!1})}},{key:"handleRoomChange",value:function(e){this.setState({roomId:e.target.value})}},{key:"handleKeyChange",value:function(e){this.setState({signalingKey:e.target.value})}},{key:"addRemoteStream",value:function(e,t){if(this.state.remoteStreams[e])console.log("remote stream ALREADY exist id="+e);else{var n=Object.assign({},this.state.remoteStreams);n[e]=t,this.setState({remoteStreams:n})}}},{key:"removeRemoteStream",value:function(e){var t=Object.assign({},this.state.remoteStreams);delete t[e],this.setState({remoteStreams:t})}},{key:"removeAllRemoteStream",value:function(){this.setState({remoteStreams:{}})}},{key:"render",value:function(){console.log("App render()");var e=[];return Object.keys(this.state.remoteStreams).forEach((function(t){var n=this[t];console.log("key=id=%s, stream.id=%s",t,n.id),e.push(l.a.createElement(u,{id:t,key:t,width:"100%",height:"",volume:.5,controls:!0,stream:n}))}),this.state.remoteStreams),l.a.createElement("div",{className:"App"},"React-Sora RecvOnly for momo monitor",l.a.createElement("br",null),"SignalingKey: ",l.a.createElement("input",{id:"signaling_key",type:"text",size:32,value:this.state.signalingKey,onChange:this.handleKeyChange,disabled:this.state.connected}),l.a.createElement("br",null),"Room: ",l.a.createElement("input",{id:"room_id",type:"text",value:this.state.roomId,onChange:this.handleRoomChange,disabled:this.state.connected}),l.a.createElement("button",{onClick:this.connect,disabled:this.state.connected}," Connect"),l.a.createElement("button",{onClick:this.disconnect,disabled:!this.state.connected},"Disconnect"),l.a.createElement("br",null),l.a.createElement("div",{className:"VideoContainer"},l.a.createElement("div",{className:"RemoteContainer"},e)))}}]),n}(l.a.Component);m.a.render(l.a.createElement(p,null),document.getElementById("root"))},9:function(e,t,n){e.exports=n(30)}},[[9,1,2]]]);
//# sourceMappingURL=main.b396e9cd.chunk.js.map