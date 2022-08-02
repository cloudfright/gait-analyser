
const AccelerationThreshold = 1;

let sound;

function initSound() {

  // we don't need the mic, but it seems to be the only way to get the audio context unmuted when asking for permission
  var mic = new Pizzicato.Sound({
    source: 'input',
    options: { volume: 0 }
  });

  sound = new Pizzicato.Sound({
    source: 'wave',
    options: { type: 'square', frequency: 440, attack: 0 }
  });
  
  var group = new Pizzicato.Group();

  group.addSound(mic);
  group.addSound(sound);
  
  var stereoPanner = new Pizzicato.Effects.StereoPanner({
    pan: 0.5
  });
  
  sound.addEffect(stereoPanner);
}

function requestMotionPermission() {

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // Handle iOS 13+ devices.
    DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        } else {
          console.error('Request to access the orientation was rejected');
        }
      })
      .catch(console.error);
  } else {
    // Handle regular non iOS 13+ devices.
    window.addEventListener('devicemotion', handleMotion);
  }


}

function startAudio() {
  sound.play();

}

function stopAudio() {
  sound.stop();
}


function handleMotion(event) {

  sound.frequency(440 + event.accelerationIncludingGravity.x - event.acceleration.x);
  sound.play();
/*
  if (Math.abs(event.acceleration.x) >= AccelerationThreshold) {
    sound.play();
  }
  else {
    sound.stop();
  }
*/

  /*
  event.rotationRate.alpha
  event.rotationRate.beta
  event.rotationRate.gamma


  event.acceleration.y
  event.acceleration.z

  event.accelerationIncludingGravity.x - event.acceleration.x
  event.accelerationIncludingGravity.y - event.acceleration.y
  event.accelerationIncludingGravity.z - event.acceleration.z
https://stackoverflow.com/questions/57942230/ios-safari-web-audio-api-restriction-problem
https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/PlayingandSynthesizingSounds/PlayingandSynthesizingSounds.html
https://github.com/CreateJS/SoundJS

https://paulbakaus.com/tutorials/html5/web-audio-on-ios/

https://stackoverflow.com/questions/12517000/no-sound-on-ios-6-web-audio-api

https://gist.github.com/kus/3f01d60569eeadefe3a1

just resume like this:

document.addEventListener('touchend', ()=>window.audioContext.resume());

https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

https://developer.chrome.com/blog/autoplay/#webaudio

---> https://github.com/alemangui/pizzicato/issues/115


*/

}