import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const container = document.body;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 40, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0x222233));
const sunLight = new THREE.PointLight(0xffffff, 2, 0, 2);
scene.add(sunLight);

const planetData = [
  { name: 'Sun', size: 8, color: 0xffcc33, distance: 0, orbitSpeed: 0, rotationSpeed: 0.001 },
  { name: 'Mercury', size: 0.6, color: 0x8b8589, distance: 12, orbitSpeed: 0.04, rotationSpeed: 0.004 },
  { name: 'Venus', size: 1.2, color: 0xe6c28b, distance: 18, orbitSpeed: 0.03, rotationSpeed: 0.002 },
  { name: 'Earth', size: 1.25, color: 0x2a6bd6, distance: 24, orbitSpeed: 0.025, rotationSpeed: 0.02 },
  { name: 'Mars', size: 0.9, color: 0xd14b2a, distance: 30, orbitSpeed: 0.02, rotationSpeed: 0.018 },
  { name: 'Jupiter', size: 3.5, color: 0xd9a066, distance: 42, orbitSpeed: 0.013, rotationSpeed: 0.04 },
  { name: 'Saturn', size: 3.0, color: 0xe0caa2, distance: 55, orbitSpeed: 0.01, rotationSpeed: 0.038 },
  { name: 'Uranus', size: 2.0, color: 0x7fd1e6, distance: 68, orbitSpeed: 0.007, rotationSpeed: 0.03 },
  { name: 'Neptune', size: 2.0, color: 0x2b5bd6, distance: 80, orbitSpeed: 0.006, rotationSpeed: 0.032 },
];

const planetGroups = [];

planetData.forEach((p) => {
  if (p.name === 'Sun') {
    const geom = new THREE.SphereGeometry(p.size, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);
    sunLight.position.copy(mesh.position);
    return;
  }

  const group = new THREE.Group();
  const geom = new THREE.SphereGeometry(p.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.x = p.distance;
  group.add(mesh);
  scene.add(group);

  if (p.name === 'Saturn') {
    const ringGeom = new THREE.RingGeometry(p.size * 1.3, p.size * 2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x9b7e5a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.x = p.distance;
    group.add(ring);
  }

  planetGroups.push({ group, mesh, data: p });
});

// Raycaster for clicking planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let focusTarget = null;

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetGroups.map(p => p.mesh));
  if (intersects.length > 0) {
    const picked = intersects[0].object;
    const worldPos = new THREE.Vector3();
    picked.getWorldPosition(worldPos);
    focusTarget = worldPos;
  }
}

window.addEventListener('click', onClick);

// Fill legend
const legend = document.getElementById('legend');
if (legend) {
  planetData.forEach(p => {
    const el = document.createElement('div');
    el.className = 'legend-item';
    const sw = document.createElement('span');
    sw.className = 'swatch';
    sw.style.background = '#' + p.color.toString(16).padStart(6, '0');
    el.appendChild(sw);
    const label = document.createElement('span');
    label.textContent = p.name;
    el.appendChild(label);
    legend.appendChild(el);
  });
}

const clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  planetGroups.forEach(obj => {
    obj.group.rotation.y += obj.data.orbitSpeed * dt * 60;
    obj.mesh.rotation.y += obj.data.rotationSpeed * dt * 60;
  });

  if (focusTarget) {
    // smooth camera to focus target
    controls.target.lerp(focusTarget, 0.06);
    const desired = new THREE.Vector3().copy(focusTarget).add(new THREE.Vector3(0, 6, 18));
    camera.position.lerp(desired, 0.06);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
