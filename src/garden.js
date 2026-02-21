import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ===== CONFIGURATION =====
const CONFIG = {
    nodeCount: 800,
    connectionDistance: 12,
    maxConnections: 4,
    worldSize: 200,
    colors: {
        background: 0x050508,
        nodeCore: 0x00d4ff,
        nodeOuter: 0x8844ff,
        connection: 0x3366aa,
        spore: 0xffaa44
    }
};

// ===== SCENE SETUP =====
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.background);
scene.fog = new THREE.FogExp2(CONFIG.colors.background, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
container.appendChild(renderer.domElement);

// ===== POST-PROCESSING (BLOOM) =====
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ===== CONTROLS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 100;
controls.minDistance = 5;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// ===== PROCEDURAL GENERATION =====
// Simple pseudo-random for consistent but varied results
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Simplex-like noise function
function noise(x, y, z, seed = 0) {
    return (Math.sin(x * 0.1 + seed) + Math.sin(y * 0.1 + seed * 2) + Math.sin(z * 0.1 + seed * 3)) / 3;
}

// ===== NODE GENERATION =====
const nodes = [];
const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const nodeMaterial = new THREE.MeshBasicMaterial({ 
    color: CONFIG.colors.nodeCore,
    transparent: true,
    opacity: 0.9
});

// Create node positions with organic clustering
for (let i = 0; i < CONFIG.nodeCount; i++) {
    const seed = i * 1.618; // Golden ratio for distribution
    
    // Use noise to create organic clusters
    const angle = seededRandom(seed) * Math.PI * 2;
    const radius = 10 + seededRandom(seed + 1) * CONFIG.worldSize * 0.4;
    const height = (noise(i * 0.1, 0, 0) - 0.5) * 20;
    
    const x = Math.cos(angle) * radius + (noise(i * 0.05, 0, 0) * 30);
    const y = height + (seededRandom(seed + 2) - 0.5) * 10;
    const z = Math.sin(angle) * radius + (noise(0, i * 0.05, 0) * 30);
    
    // Vary node size based on "importance"
    const importance = seededRandom(seed + 3);
    const size = 0.5 + importance * 1.5;
    
    nodes.push({
        position: new THREE.Vector3(x, y, z),
        size: size,
        importance: importance,
        phase: seededRandom(seed + 4) * Math.PI * 2,
        pulseSpeed: 0.5 + seededRandom(seed + 5) * 1.5,
        connections: []
    });
}

// Create instanced mesh for nodes
const nodeMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, CONFIG.nodeCount);
nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

const dummy = new THREE.Object3D();
const nodeColors = new Float32Array(CONFIG.nodeCount * 3);

// Position nodes and assign colors
for (let i = 0; i < CONFIG.nodeCount; i++) {
    const node = nodes[i];
    dummy.position.copy(node.position);
    dummy.scale.setScalar(node.size);
    dummy.updateMatrix();
    nodeMesh.setMatrixAt(i, dummy.matrix);
    
    // Color based on position/importance
    const colorMix = node.importance;
    const r = 0 + colorMix * 0.5;
    const g = 0.8 + colorMix * 0.2;
    const b = 1;
    
    nodeColors[i * 3] = r;
    nodeColors[i * 3 + 1] = g;
    nodeColors[i * 3 + 2] = b;
}

nodeMesh.instanceColor = new THREE.InstancedBufferAttribute(nodeColors, 3);
scene.add(nodeMesh);

// ===== CONNECTION GENERATION =====
// Find nearby nodes and create connections
const connections = [];

for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    let connectionCount = 0;
    
    // Find closest nodes
    const candidates = [];
    for (let j = i + 1; j < nodes.length && connectionCount < CONFIG.maxConnections; j++) {
        const nodeB = nodes[j];
        const distance = nodeA.position.distanceTo(nodeB.position);
        
        if (distance < CONFIG.connectionDistance) {
            candidates.push({ index: j, distance: distance });
        }
    }
    
    // Sort by distance and pick closest
    candidates.sort((a, b) => a.distance - b.distance);
    
    for (let k = 0; k < Math.min(candidates.length, CONFIG.maxConnections); k++) {
        const candidate = candidates[k];
        nodeA.connections.push(candidate.index);
        nodes[candidate.index].connections.push(i);
        
        connections.push({
            from: i,
            to: candidate.index,
            distance: candidate.distance,
            phase: (nodeA.phase + nodes[candidate.index].phase) / 2
        });
        
        connectionCount++;
    }
}

// Create connection lines using TubeGeometry for organic look
const connectionGroup = new THREE.Group();
const connectionMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.connection,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
});

// Use simple lines for performance in MVP
const lineMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.colors.connection,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
});

const lineGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(connections.length * 6); // 2 points * 3 coords

for (let i = 0; i < connections.length; i++) {
    const conn = connections[i];
    const from = nodes[conn.from].position;
    const to = nodes[conn.to].position;
    
    linePositions[i * 6] = from.x;
    linePositions[i * 6 + 1] = from.y;
    linePositions[i * 6 + 2] = from.z;
    linePositions[i * 6 + 3] = to.x;
    linePositions[i * 6 + 4] = to.y;
    linePositions[i * 6 + 5] = to.z;
}

lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

// ===== PARTICLE SPORES =====
const sporeCount = 50;
const sporeGeometry = new THREE.BufferGeometry();
const sporePositions = new Float32Array(sporeCount * 3);
const sporeVelocities = [];
const sporeNodes = []; // Which connection each spore is following

for (let i = 0; i < sporeCount; i++) {
    const connIndex = Math.floor(Math.random() * connections.length);
    const conn = connections[connIndex];
    const from = nodes[conn.from].position;
    
    sporePositions[i * 3] = from.x;
    sporePositions[i * 3 + 1] = from.y;
    sporePositions[i * 3 + 2] = from.z;
    
    sporeVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.003
    });
    
    sporeNodes.push(connIndex);
}

sporeGeometry.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));

const sporeMaterial = new THREE.PointsMaterial({
    color: CONFIG.colors.spore,
    size: 0.8,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const spores = new THREE.Points(sporeGeometry, sporeMaterial);
scene.add(spores);

// ===== AMBIENT PARTICLES =====
const ambientCount = 200;
const ambientGeometry = new THREE.BufferGeometry();
const ambientPositions = new Float32Array(ambientCount * 3);
const ambientPhases = [];

for (let i = 0; i < ambientCount; i++) {
    ambientPositions[i * 3] = (Math.random() - 0.5) * CONFIG.worldSize;
    ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.worldSize;
    ambientPhases.push(Math.random() * Math.PI * 2);
}

ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));

const ambientMaterial = new THREE.PointsMaterial({
    color: 0x336699,
    size: 0.3,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});

const ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
scene.add(ambientParticles);

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();
    
    // Animate nodes (pulsing scale)
    for (let i = 0; i < CONFIG.nodeCount; i++) {
        const node = nodes[i];
        const pulse = 1 + Math.sin(time * node.pulseSpeed + node.phase) * 0.2;
        
        dummy.position.copy(node.position);
        dummy.scale.setScalar(node.size * pulse);
        dummy.updateMatrix();
        nodeMesh.setMatrixAt(i, dummy.matrix);
    }
    nodeMesh.instanceMatrix.needsUpdate = true;
    
    // Animate spores traveling along connections
    const sporePos = spores.geometry.attributes.position.array;
    for (let i = 0; i < sporeCount; i++) {
        const vel = sporeVelocities[i];
        const connIndex = sporeNodes[i];
        const conn = connections[connIndex];
        
        vel.progress += vel.speed;
        
        if (vel.progress >= 1) {
            // Switch to new connection
            const newConnIndex = Math.floor(Math.random() * connections.length);
            sporeNodes[i] = newConnIndex;
            vel.progress = 0;
        } else {
            const from = nodes[conn.from].position;
            const to = nodes[conn.to].position;
            
            // Lerp position with slight organic drift
            const t = vel.progress;
            sporePos[i * 3] = from.x + (to.x - from.x) * t + Math.sin(time * 2 + i) * 0.5;
            sporePos[i * 3 + 1] = from.y + (to.y - from.y) * t + Math.cos(time * 1.5 + i) * 0.3;
            sporePos[i * 3 + 2] = from.z + (to.z - from.z) * t + Math.sin(time * 1.8 + i) * 0.5;
        }
    }
    spores.geometry.attributes.position.needsUpdate = true;
    
    // Animate ambient particles (gentle floating)
    const ambientPos = ambientParticles.geometry.attributes.position.array;
    for (let i = 0; i < ambientCount; i++) {
        const phase = ambientPhases[i];
        ambientPos[i * 3 + 1] += Math.sin(time * 0.5 + phase) * 0.01;
    }
    ambientParticles.geometry.attributes.position.needsUpdate = true;
    
    // Slowly rotate the entire scene
    scene.rotation.y = time * 0.02;
    
    controls.update();
    composer.render();
}

// ===== RESIZE HANDLER =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ===== MOUSE INTERACTION =====
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Subtle camera influence
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.01;
    camera.position.y += (20 + mouseY * 5 - camera.position.y) * 0.01;
});

// Stop auto-rotation on user interaction
controls.addEventListener('start', () => {
    controls.autoRotate = false;
});

// ===== START =====
animate();
console.log('🍄 Mycelial Mind initialized');
console.log(`Nodes: ${CONFIG.nodeCount}, Connections: ${connections.length}, Spores: ${sporeCount}`);
