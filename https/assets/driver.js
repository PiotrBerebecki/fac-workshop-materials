/* global document, EndPoint, VideoEndPoint */
// Application logic here

// const V2RemoteVideoTag = document.querySelector('#V2 .remoteVideo');
// const V3RemoteVideoTag = document.querySelector('#V3 .remoteVideo');
// const V4RemoteVideoTag = document.querySelector('#V4 .remoteVideo');
//
// const V1LocalVideoTag = document.querySelector('#V1 .localVideo');
// const V2LocalVideoTag = document.querySelector('#V2 .localVideo');
// const V3LocalVideoTag = document.querySelector('#V3 .localVideo');
// const V4LocalVideoTag = document.querySelector('#V4 .localVideo');
//
// const V1StateTag = document.querySelector('#V1 .state');
// const V2StateTag = document.querySelector('#V2 .state');
// const V3StateTag = document.querySelector('#V3 .state');
// const V4StateTag = document.querySelector('#V4 .state');

// const V2 = new VideoEndPoint(
//   'V2',
//   V2RemoteVideoTag,
//   V2LocalVideoTag,
//   V2StateTag
// );
// const V3 = new VideoEndPoint(
//   'V3',
//   V3RemoteVideoTag,
//   V3LocalVideoTag,
//   V3StateTag
// );
// const V4 = new VideoEndPoint(
//   'V4',
//   V4RemoteVideoTag,
//   V4LocalVideoTag,
//   V4StateTag
// );

const formDOM = document.getElementById('identity');
const videoControlsDOM = document.getElementById('videocontrols');

formDOM.addEventListener('submit', event => {
  event.preventDefault();
  const callerName = event.target[0].value;
  formDOM.classList.add('hidden');
  videoControlsDOM.classList.remove('hidden');

  const remoteVideoTag = document.querySelector('.remoteVideo');
  const localVideoTag = document.querySelector('.localVideo');
  const stateTag = document.querySelector('.state');
  const hangUpTag = document.querySelector('.endCall');

  const caller = new VideoEndPoint(
    callerName,
    remoteVideoTag,
    localVideoTag,
    stateTag,
    hangUpTag
  );

  videoControlsDOM.addEventListener('submit', event => {
    showVideo(event);
  });

  function showVideo(event) {
    event.preventDefault();
    const callTargetName = event.target[0].value;
    // remoteVideoTag.classList.remove('hidden');
    // localVideoTag.classList.remove('hidden');
    EndPoint.names[callerName].makeCall(callTargetName);
  }

  hangUpTag.addEventListener('click', () => {
    EndPoint.names[callerName].hangUp();
  });
});
