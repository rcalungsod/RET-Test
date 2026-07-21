import * as THREE from 'three';
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

function createStarfield(count = 2500, radius = 800) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: true });
  return new THREE.Points(geom, mat);
}
scene.add(createStarfield());

function createGlowSprite(size) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,225,160,1)');
  gradient.addColorStop(0.3, 'rgba(255,200,100,0.5)');
  gradient.addColorStop(1, 'rgba(255,180,60,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

function createLabelSprite(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 48;
  ctx.font = `${fontSize}px system-ui, sans-serif`;
  canvas.width = Math.ceil(ctx.measureText(text).width) + 20;
  canvas.height = fontSize + 20;
  ctx.font = `${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(235,240,255,0.95)';
  ctx.textBaseline = 'top';
  ctx.fillText(text, 10, 6);
  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.025;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  return sprite;
}

function createOrbitLine(radius) {
  const points = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0x4a5a75, transparent: true, opacity: 0.35 });
  return new THREE.LineLoop(geom, mat);
}

const planetData = [
  { name: 'Sun', size: 8, color: 0xffcc33, distance: 0, orbitSpeed: 0, rotationSpeed: 0.001 },
  { name: 'Mercury', size: 0.6, color: 0x8b8589, distance: 12, orbitSpeed: 0.04, rotationSpeed: 0.004, tilt: 0 },
  { name: 'Venus', size: 1.2, color: 0xe6c28b, distance: 18, orbitSpeed: 0.03, rotationSpeed: 0.002, tilt: 177 },
  { name: 'Earth', size: 1.25, color: 0x2a6bd6, distance: 24, orbitSpeed: 0.025, rotationSpeed: 0.02, tilt: 23.5 },
  { name: 'Mars', size: 0.9, color: 0xd14b2a, distance: 30, orbitSpeed: 0.02, rotationSpeed: 0.018, tilt: 25 },
  { name: 'Jupiter', size: 3.5, color: 0xd9a066, distance: 42, orbitSpeed: 0.013, rotationSpeed: 0.04, tilt: 3 },
  { name: 'Saturn', size: 3.0, color: 0xe0caa2, distance: 55, orbitSpeed: 0.01, rotationSpeed: 0.038, tilt: 27 },
  { name: 'Uranus', size: 2.0, color: 0x7fd1e6, distance: 68, orbitSpeed: 0.007, rotationSpeed: 0.03, tilt: 98 },
  { name: 'Neptune', size: 2.0, color: 0x2b5bd6, distance: 80, orbitSpeed: 0.006, rotationSpeed: 0.032, tilt: 28 },
];

const planetGroups = [];

planetData.forEach((p) => {
  if (p.name === 'Sun') {
    const geom = new THREE.SphereGeometry(p.size, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: p.color });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);
    scene.add(createGlowSprite(p.size * 6));
    const label = createLabelSprite(p.name);
    label.position.set(0, p.size + 3, 0);
    scene.add(label);
    sunLight.position.copy(mesh.position);
    return;
  }

  scene.add(createOrbitLine(p.distance));

  const group = new THREE.Group();
  const geom = new THREE.SphereGeometry(p.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.x = p.distance;
  mesh.rotation.z = THREE.MathUtils.degToRad(p.tilt || 0);
  group.add(mesh);

  const label = createLabelSprite(p.name);
  label.position.set(p.distance, p.size + 1.5, 0);
  group.add(label);

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
