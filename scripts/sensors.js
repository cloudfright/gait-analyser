

const noteFrequencies = [

  440.00, // A4
  466.16, // A#/Bb 4
  493.88, // B4
  523.25, // C4
  554.37, // C#/Db 4
  587.33, // D4
  622.25, // D#/Eb 4
  659.25, // E4
  698.46, // F4
  739.99, // F#/Gb 4
  783.99, // G4
  830.61, // G#/Ab 4
  888.00  // A5

];

const AccelerationStates = {
  Stationary: 'Stationary',
  Accelerate: 'Accelerate',
  Decelerate: 'Decelerate'
};

const AccelerationThreshold = 2;
const DecelerationThreshold = AccelerationThreshold / 3;
const AccelerationMax = AccelerationThreshold * 2;
const AccelerationThresholdCount = 3;

const Direction = {
  Undefined: 'Undefined',
  Forwards: 'Forwards',
  Backwards: 'Backwards',
};

let accelerationState = AccelerationStates.Stationary;
let currentDirection = Direction.Undefined;
const speechSynth = window.speechSynthesis;;

// ---------------

class ExponentialMovingAverage {
  constructor(alpha, mean) {
    this.alpha = alpha;
    this.mean = !mean ? 0 : mean;
  }

  get beta() {
    return 1 - this.alpha;
  }

  get filtered() {
    return this.mean;
  }

  update(newValue) {
    const redistributedMean = this.beta * this.mean;
    const meanIncrement = this.alpha * newValue;
    const newMean = redistributedMean + meanIncrement;
    this.mean = newMean;
  }
}

let smoothAx = new ExponentialMovingAverage(0.7);
let smoothAy = new ExponentialMovingAverage(0.7);
let smoothAz = new ExponentialMovingAverage(0.7);
let aMax = 0;

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

  let utterance = new SpeechSynthesisUtterance("Permission granted");

  speechSynth.speak(utterance);

}



function handleMotion(event) {

  smoothAx.update(event.acceleration.x);
  smoothAy.update(event.acceleration.y);
  smoothAz.update(event.acceleration.z);
  
  updateState(event);
}

function updateState(event) {

  let newValue = smoothAx.filtered;

  switch (accelerationState) {

    case AccelerationStates.Stationary:

      if (Math.abs(newValue) >= AccelerationThreshold) {
        currentDirection = newValue < 0 ? Direction.Forwards : Direction.Backwards;
        accelerationState = AccelerationStates.Accelerate;
        console.log(newValue, 'STATIONARY -> ACCELERATE', currentDirection);
      }
      break;

    case AccelerationStates.Accelerate:

      if (currentDirection == Direction.Forwards) {

        if (newValue >= AccelerationThreshold) { // We're going forwards, so a positive rise above the threshold indicates deceleration 
          accelerationState = AccelerationStates.Decelerate;
          console.log(newValue, 'ACCELERATE -> DECELERATE');
        }
        if (abs(newValue) > aMax) {
          aMax = abs(newValue);
        }
      }
      else {

        if (newValue <= -AccelerationThreshold) { // We're going backwards, so a negative rise above the threshold indicates deceleration 
          accelerationState = AccelerationStates.Decelerate;
          console.log(newValue, 'ACCELERATE -> DECELERATE');
        }
      }
      break;

    case AccelerationStates.Decelerate:

      if (currentDirection == Direction.Forwards) {

        if (newValue <= DecelerationThreshold) { // We're going forwards, a value below the deceleration threshold means we're stationary 
          accelerationState = AccelerationStates.Stationary;
          console.log(newValue, 'DECELERATE -> STATIONARY!');

          let utterance = new SpeechSynthesisUtterance(Math.round(aMax));
          speechSynth.speak(utterance);
          aMax = 0;
        }
      }
      else {

        if (newValue >= -DecelerationThreshold) { // We're going backwards, so a negative value below the deceleration means we're stationary 
          accelerationState = AccelerationStates.Stationary;
          console.log(newValue, 'DECELERATE -> STATIONARY');

          let utterance = new SpeechSynthesisUtterance(Math.round(aMax));
          speechSynth.speak(utterance);
          aMax = 0;
        }
      }
      break;

  }
}  