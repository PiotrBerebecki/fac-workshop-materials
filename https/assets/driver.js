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

const callBtn = document.querySelector('.startCall');
const hangUpBtn = document.querySelector('.endCall');

formDOM.addEventListener('submit', event => {
  event.preventDefault();
  const callerName = event.target[0].value;
  // console.log(callerName);
  formDOM.classList.add('hidden');
  videoControlsDOM.classList.remove('hidden');

  const remoteVideoTag = document.querySelector('.remoteVideo');
  const localVideoTag = document.querySelector('.localVideo');
  const stateTag = document.querySelector('.state');

  const caller = new VideoEndPoint(
    callerName,
    remoteVideoTag,
    localVideoTag,
    stateTag
  );

  const getCallTarget = button => {
    return button.parentElement.querySelector('.target').value;
  };

  callBtn.addEventListener('click', () => {
    const callTargetName = getCallTarget(callBtn);
    EndPoint.names[callerName].makeCall(callTargetName);
  });

  hangUpBtn.addEventListener('click', () => {
    EndPoint.names[callerName].hangUp();
    console.log('hanging up');
  });
});
