
const AccelerationThreshold = 1;

var sound = new Pizzicato.Sound({
  source: 'wave',
  options: { type: 'square', frequency: 440, attack: 0 }
});

var stereoPanner = new Pizzicato.Effects.StereoPanner({
  pan: 0.5
});

sound.addEffect(stereoPanner);


function requestPermission() {

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

  if (Math.abs(event.acceleration.x) >= AccelerationThreshold) {
    sound.play();
  }
  else {
    sound.stop();
  }


  /*
  event.rotationRate.alpha
  event.rotationRate.beta
  event.rotationRate.gamma


  event.acceleration.y
  event.acceleration.z

  event.accelerationIncludingGravity.x - event.acceleration.x
  event.accelerationIncludingGravity.y - event.acceleration.y
  event.accelerationIncludingGravity.z - event.acceleration.z
*/

}