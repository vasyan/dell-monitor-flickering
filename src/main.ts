import './style.css'
import './fullscreen'

const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
    throw new Error('WebGL not supported');
}

const vertexShaderSource = `
attribute vec4 position;
void main() {
    gl_Position = position;
}`;

const fragmentShaderSource = `
precision mediump float;
uniform vec4 color;
void main() {
    gl_FragColor = color;
}`;

function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number): WebGLShader {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed: ', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
  }

  return shader;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
  console.error('Shader program linking failed: ', gl.getProgramInfoLog(shaderProgram));
  throw new Error('Shader program linking failed');
}


const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(shaderProgram, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


function render(color: [number, number, number, number]) {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(shaderProgram);

  const colorLocation = gl.getUniformLocation(shaderProgram, 'color');
  gl.uniform4fv(colorLocation, color);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function linear(t: number): number {
  return t;
}

// function easeInOut(t: number): number {
//   return -0.5 * (Math.cos(Math.PI * t) - 1);
// }

function easeInOut(t: number, minValue: number = 0.1): number {
  const easedValue = -0.5 * (Math.cos(Math.PI * t) - 1);

  const scaledValue = easedValue * (1 - minValue);

  return scaledValue + minValue;
}

const grayColorNormalized = [128 / 255, 128 / 255, 128 / 255, 1];  // Normalized gray color

let intensity = 0;
let direction = 1;  // 1 for increasing intensity, -1 for decreasing
let easingFunction: (...args: any[]) => number = easeInOut;  // Default to linear

const makeIntentisyControl = (initialValue: number = 0) => {
  let value = initialValue;

  return {
    set: (newValue: number) => {
      value = newValue;
      const el = document.getElementById('fps');

      if (el) {
        el.innerHTML = value.toFixed(3);
      }
    },
    get: () => value,
  }
}

const intensityControl = makeIntentisyControl(2.004);

let running = true;

function animate(force = false) {
  if (force) running = true;
  if (!running) return

  intensity += intensityControl.get() * direction;
  if (intensity > 1 || intensity < 0) {
      direction *= -1;
      intensity = Math.max(0, Math.min(intensity, 1));  // Clamp between 0 and 1
  }

  // console.log('intensity', intensity);
  const easedIntensity = easingFunction(intensity, 0.5);
  const color: [number, number, number, number] = [easedIntensity * grayColorNormalized[0], 
                 easedIntensity * grayColorNormalized[1], 
                 easedIntensity * grayColorNormalized[2], 
                 1];
  render(color);

  requestAnimationFrame(() => {
    // const timeLeft = executionTime - (Date.now() - startTime);
    // console.log('timeLeft', timeLeft);
    // if (!stop && timeLeft) animate(timeLeft, startTime)
    animate()
  });
}

const FIRE_DURATION = 500;
const FIRE_INTERVAL = 100;
const FIRE_COUNT = 4;

async function fire() {
  console.log('start');

  for (let i = 0; i < FIRE_COUNT; i++) {
    console.log('fire!');
    animate(true);
    await new Promise(resolve => setTimeout(resolve, FIRE_DURATION))
    running = false;
    await new Promise(resolve => setTimeout(resolve, FIRE_INTERVAL))
  }
}

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event: KeyboardEvent) {
  if (event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'Space') {
    const value = event.code;

    if (event.shiftKey) {
      switch (value) {
        case 'ArrowUp':
          intensityControl.set(intensityControl.get() + 0.001);
          break;
        case 'ArrowDown':
          intensityControl.set(intensityControl.get() - 0.001);
          break;
      }
    } else {
      switch (value) {
        case 'ArrowUp':
          intensityControl.set(intensityControl.get() + 0.1);
          break;
        case 'ArrowDown':
          intensityControl.set(intensityControl.get() - 0.1);
          break;
        case 'Space':
          fire();
          break
      }
    }
  }
}
