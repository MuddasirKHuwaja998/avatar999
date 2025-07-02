let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let avatar;
let mouthShapeKey = null;

const loader = new THREE.GLTFLoader();
loader.load("avatar.glb", (gltf) => {
  avatar = gltf.scene;
  avatar.traverse((obj) => {
    if (obj.isMesh && obj.morphTargetDictionary) {
      mouthShapeKey = Object.keys(obj.morphTargetDictionary).find(k => /mouth|jaw|open|aa|A/i.test(k));
      obj.material.metalness = 0;
    }
  });
  scene.add(avatar);
  avatar.position.set(0, -1.2, 0);
  camera.position.set(0, 1, 2.5);
  animate();
}, undefined, (err) => {
  alert("Could not load avatar.glb file! " + err);
});

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 2, 2);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

let audioCtx, analyser, dataArray;
let mouthValue = 0;

document.getElementById("mic-btn").onclick = async function() {
  if (!navigator.mediaDevices) {
    alert("Mic not supported in this browser.");
    return;
  }
  let stream = await navigator.mediaDevices.getUserMedia({audio:true});
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let source = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.fftSize = 2048;
  dataArray = new Uint8Array(analyser.fftSize);

  function mouthLoop() {
    analyser.getByteTimeDomainData(dataArray);
    let avg = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / dataArray.length;
    mouthValue = Math.min(Math.max((avg - 5) / 20, 0), 1);

    if (avatar && mouthShapeKey) {
      avatar.traverse((obj) => {
        if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetDictionary[mouthShapeKey]) {
          let idx = obj.morphTargetDictionary[mouthShapeKey];
          obj.morphTargetInfluences[idx] = mouthValue;
        }
      });
    }
    requestAnimationFrame(mouthLoop);
  }
  mouthLoop();
};