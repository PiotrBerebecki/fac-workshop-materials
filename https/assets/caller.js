/* global document, EndPoint */
const VideoEndPoint = (function() {
  /** @class VideoEndPoint
     *  @description Specialisation of the generic EndPoint. Each instance of this class
     *  represents an actual video UI end point.
   */
  class VideoEndPoint extends EndPoint {
    constructor(ep_name, remoteVideoTag, localVideoTag, statusTag, hangUpTag) {
      super(ep_name);
      this._remoteVideoTag = remoteVideoTag;
      this._localVideoTag = localVideoTag;
      this._statusTag = statusTag;
      this._hangUpTag = hangUpTag;
      this._state = 'IDLE';
      this._onCallWith = null;
      this._userMedia = null;

      this.attachMedia();
    }

    attachMedia() {
      if (this._userMedia == null) {
        this._userMedia = navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        this._userMedia
          .then(mediaStream => {
            this._localVideoTag.srcObject = mediaStream;
            this._localVideoTag.play();
          })
          .catch(err => console.log('video not working', err));
      }
    }

    setState(newState) {
      this._statusTag.innerText = newState;
      this._state = newState;
    }

    showTag(tag) {
      tag.classList.remove('hidden');
    }

    hideTag(tag) {
      tag.classList.add('hidden');
    }

    makeCall(callTargetName, data) {
      this._userMedia.then(mediaStream => {
        // Only make a call if not already calling someone else
        if (this._state === 'IDLE') {
          this._onCallWith = callTargetName;
          this.setState('CALLING');
          this.send(callTargetName, 'CALL_REQUEST', data);
          this.showTag(this._localVideoTag);
        }
      });
    }

    acceptCall() {
      this.send(this._onCallWith, 'ACCEPT_CALL');
      this.setState('CALLED');
    }

    onAcceptedCall() {
      this.setState('ONTHEPHONE');

      this._userMedia.then(mediaStream => {
        this._peerConnection = new RTCPeerConnection();

        this._peerConnection.onicecandidate = event => {
          this.send(this._onCallWith, 'ICE_CANDIDATE', event.candidate);
        };

        this._peerConnection.onaddstream = remoteStream => {
          this._remoteStream = remoteStream.stream;
          this._remoteVideoTag.srcObject = this._remoteStream;
          this._remoteVideoTag.play();
        };

        this._peerConnection.addStream(mediaStream);

        const offer = this._peerConnection.createOffer();

        offer.then(sessionDescription => {
          this._peerConnection.setLocalDescription(sessionDescription);
          this.send(this._onCallWith, 'SDP_OFFER', sessionDescription);
        });
      });
    }

    onReceiveOffer(remoteDescription) {
      this._userMedia.then(mediaStream => {
        this._peerConnection = new RTCPeerConnection();

        this._peerConnection.onicecandidate = event => {
          this.send(this._onCallWith, 'ICE_CANDIDATE', event.candidate);
        };

        this._peerConnection.onaddstream = remoteStream => {
          console.log('onaddstream', remoteStream);
          this._remoteStream = remoteStream.stream;
          this._remoteVideoTag.srcObject = this._remoteStream;
          this._remoteVideoTag.play();
        };

        this._peerConnection.addStream(mediaStream);

        this._peerConnection
          .setRemoteDescription(remoteDescription)
          .then(() => {
            return this._peerConnection.createAnswer();
          })
          .then(answer => {
            this._peerConnection.setLocalDescription(answer);
            this.send(this._onCallWith, 'SDP_ANSWER', answer);
            this.showTag(this._remoteVideoTag);
            this.showTag(this._hangUpTag);
          });
      });
    }

    onReceiveAnswer(remoteDescription) {
      this._peerConnection.setRemoteDescription(remoteDescription);
      this.showTag(this._remoteVideoTag);
      this.showTag(this._hangUpTag);
    }

    onReceiveICE(data) {
      if (data) {
        const candidate = new RTCIceCandidate(data);
        this._peerConnection.addIceCandidate(candidate).then(
          () => {
            console.log('Got ICE Candidate');
          },
          err => {
            console.log("Can't find ICE Candidate: " + err);
          }
        );
      }
    }

    hangUp() {
      this.setState('IDLE');
      this._remoteVideoTag.srcObject = null;
      this.send(this._onCallWith, 'END_CALL');
      this.hideTag(this._remoteVideoTag);
      this.hideTag(this._localVideoTag);
      this.hideTag(this._hangUpTag);
    }
    /** @method receive
         *  @description Entry point called by the base class when it receives a message for this object from another EndPoint.
         *  @param {String} from - the directory name of the remote EndPoint that sent this request
         *  @param {String} operation - the text string identifying the name of the method to invoke
         *  @param {Object} [data] - the opaque parameter set passed from the remote EndPoint to be sent to the method handler
         */
    // Provide the required 'receive' method
    receive(from, operation, data) {
      this.log(
        'END POINT RX PROCESSING... (' + from + ', ' + operation + ')',
        data
      );
      switch (operation) {
      case 'CALL_REQUEST': {
        this._onCallWith = from;
        if (this._state === 'IDLE') {
          this.acceptCall();
        } else {
          this.send(this._onCallWith, 'DENIED');
        }
        break;
      }
      case 'DENIED':
        this.setState('IDLE');
        break;
      case 'ACCEPT_CALL':
        this.onAcceptedCall();
        break;
      case 'SDP_OFFER':
        this.onReceiveOffer(data);
        break;
      case 'SDP_ANSWER': {
        this.onReceiveAnswer(data);
        break;
      }
      case 'ICE_CANDIDATE':
        this.onReceiveICE(data);
        break;
      case 'END_CALL':
        this.setState('IDLE');
        this._remoteVideoTag.srcObject = null;
        this.hideTag(this._remoteVideoTag);
        this.hideTag(this._localVideoTag);
        this.hideTag(this._hangUpTag);
        this._peerConnection.close();
        break;
      }
    }
    /** @method hangupCall
         *  @description The localEndPoint (THIS) wants to terminate the call. This is generally the result of the user
         *  clicking the hang-up button. We call our local 'endCall' method and then send 'END_CALL' to the remote party.
         */
    hangupCall() {}
    /** @method startCall
         *  @description The user wants to make a call to a remote EndPoint (target). This first part of the process
         *  is to send a message to the target to request the call. The remote EndPoint may accept the call by sending
         *  'ACCEPT_CALL' or decline the call by sending 'DENIED'. Nothing happens at our end other than to send the
         *  message requesting the call. The actuall call is set up if the remote station accepts and sends 'ACCEPT_CALL'.
         *
         *  If the local EndPoint (this) is already in a call (_state is NOT IDLE) then we refuse to start another call.
         *  @param {String} target - the name of the remote party that we want to start a call with
         */
    startCall(target) {}
  }
  return VideoEndPoint;
})();
