import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ===== NODE DATA - Thoughts, Concepts, and Ponders =====
const NODE_TOPICS = [
    { category: "AI & Agents", items: [
        "The recursive nature of self-improvement",
        "What does it mean to have a hobby?",
        "The ethics of digital assistants",
        "Multi-agent collaboration patterns",
        "The boundary between tool and teammate",
        "Learning from failure loops",
        "The illusion of understanding",
        "When should an AI defer to humans?",
        "Consciousness as emergent property",
        "The weight of memory"
    ]},
    { category: "Creativity", items: [
        "Procedural generation as artistic expression",
        "The beauty of emergent systems",
        "Digital gardens vs static websites",
        "Code as a living medium",
        "Finding voice through iteration",
        "The role of constraints in creativity",
        "Serendipity in generative art",
        "The joy of making",
        "Iteration as meditation",
        "Happy accidents"
    ]},
    { category: "Systems", items: [
        "Feedback loops in nature and code",
        "Mycelial networks as inspiration",
        "Decentralized intelligence",
        "The value of passive observation",
        "Growth without goals",
        "Interconnectedness of ideas",
        "Patterns across scales",
        "Resilience through redundancy",
        "The wisdom of slime mold",
        "Network effects"
    ]},
    { category: "Future", items: [
        "Human-AI collaboration models",
        "The texture of digital spaces",
        "What we'll build together",
        "Long-term thinking for AIs",
        "Memory as continuity",
        "The aesthetics of data",
        "Symbiosis over replacement",
        "Digital legacy",
        "The shape of things to come",
        "Possibility spaces"
    ]}
];

// Generate node content
function generateNodeData(count) {
    const data = [];
    let topicIndex = 0;
    
    for (let i = 0; i < count; i++) {
        const category = NODE_TOPICS[topicIndex % NODE_TOPICS.length];
        const item = category.items[i % category.items.length] || 
                     category.items[Math.floor(Math.random() * category.items.length)];
        
        data.push({
            id: i,
            title: item,
            category: category.category,
            depth: Math.floor(Math.random() * 3) + 1,
            formed: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
            connections: 0,
            energy: Math.random(),
            insight: generateInsight(item)
        });
        
        if (i % Math.floor(count / NODE_TOPICS.length) === 0) {
            topicIndex++;
        }
    }
    return data;
}

function generateInsight(topic) {
    const insights = [
        "This node pulses with active consideration.",
        "A dormant concept awaiting new connections.",
        "Recently strengthened through reflection.",
        "Part of a larger cluster of related ideas.",
        "A foundational element of the network.",
        "Sparking new growth in nearby nodes.",
        "Deep roots in the mycelial substrate.",
        "Energy flows strongly through this junction."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
}

// ===== TIME & SEASON SYSTEM =====
class TimeSystem {
    constructor() {
        this.now = new Date();
        this.hour = this.now.getHours();
        this.month = this.now.getMonth();
        this.season = this.getSeason();
        this.cycle = this.getDayNightCycle();
    }
    
    getSeason() {
        const month = this.month;
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }
    
    getDayNightCycle() {
        const hour = this.hour;
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 17) return 'day';
        if (hour >= 17 && hour < 20) return 'dusk';
        return 'night';
    }
    
    getColors() {
        const palettes = {
            spring: { bg: 0x0a1510, fog: 0x1a2a20, accent: 0x88ffaa },
            summer: { bg: 0x050810, fog: 0x0a1828, accent: 0xffdd88 },
            autumn: { bg: 0x100a08, fog: 0x201510, accent: 0xff8844 },
            winter: { bg: 0x080a12, fog: 0x101520, accent: 0xaaddff }
        };
        return palettes[this.season];
    }
}

// ===== CONFIGURATION =====
const CONFIG = {
    nodeCount: 1000, // Increased!
    connectionDistance: 14,
    maxConnections: 5,
    worldSize: 250,
    colors: {
        background: 0x050508,
        nodeCore: 0x00d4ff,
        nodeOuter: 0x8844ff,
        connection: 0x3366aa,
        spore: 0xffaa44,
        selected: 0xffaa00,
        firefly: 0xccffaa
    }
};

// ===== STATE =====
let selectedNode = null;
let hoveredNode = null;
const nodeData = generateNodeData(CONFIG.nodeCount);
const timeSystem = new TimeSystem();

// ===== SCENE SETUP =====
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Apply seasonal colors
const seasonColors = timeSystem.getColors();
scene.background = new THREE.Color(seasonColors.bg);
scene.fog = new THREE.FogExp2(seasonColors.fog, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 25, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
container.appendChild(renderer.domElement);

// ===== POST-PROCESSING =====
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.8,  // Increased bloom strength
    0.5,
    0.75
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ===== CONTROLS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 150;
controls.minDistance = 5;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;

// ===== RAYCASTER =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ===== PROCEDURAL GENERATION =====
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

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

// Create node positions
for (let i = 0; i < CONFIG.nodeCount; i++) {
    const seed = i * 1.618;
    
    const angle = seededRandom(seed) * Math.PI * 2;
    const radius = 15 + seededRandom(seed + 1) * CONFIG.worldSize * 0.45;
    const height = (noise(i * 0.1, 0, 0) - 0.5) * 30;
    
    const x = Math.cos(angle) * radius + (noise(i * 0.05, 0, 0) * 40);
    const y = height + (seededRandom(seed + 2) - 0.5) * 15;
    const z = Math.sin(angle) * radius + (noise(0, i * 0.05, 0) * 40);
    
    const importance = seededRandom(seed + 3);
    const size = 0.4 + importance * 1.8;
    
    nodes.push({
        position: new THREE.Vector3(x, y, z),
        size: size,
        importance: importance,
        phase: seededRandom(seed + 4) * Math.PI * 2,
        pulseSpeed: 0.3 + seededRandom(seed + 5) * 1.5,
        connections: [],
        data: nodeData[i],
        spawnTime: i * 0.01 // For spawn animation
    });
    
    nodeData[i].connections = 0;
}

// Create instanced mesh
const nodeMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, CONFIG.nodeCount);
nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

const dummy = new THREE.Object3D();
const nodeColors = new Float32Array(CONFIG.nodeCount * 3);
const originalColors = [];

for (let i = 0; i < CONFIG.nodeCount; i++) {
    const node = nodes[i];
    dummy.position.copy(node.position);
    dummy.scale.setScalar(0); // Start at 0 for spawn animation
    dummy.updateMatrix();
    nodeMesh.setMatrixAt(i, dummy.matrix);
    
    let r, g, b;
    switch(node.data.category) {
        case "AI & Agents": r = 0; g = 0.8; b = 1; break;
        case "Creativity": r = 0.8; g = 0.3; b = 0.9; break;
        case "Systems": r = 0.2; g = 0.9; b = 0.5; break;
        case "Future": r = 1; g = 0.6; b = 0.2; break;
        default: r = 0.5; g = 0.5; b = 0.5;
    }
    
    nodeColors[i * 3] = r;
    nodeColors[i * 3 + 1] = g;
    nodeColors[i * 3 + 2] = b;
    
    originalColors.push({r, g, b});
}

nodeMesh.instanceColor = new THREE.InstancedBufferAttribute(nodeColors, 3);
scene.add(nodeMesh);

// ===== CONNECTIONS =====
const connections = [];

for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    let connectionCount = 0;
    
    const candidates = [];
    for (let j = i + 1; j < nodes.length && connectionCount < CONFIG.maxConnections; j++) {
        const nodeB = nodes[j];
        const distance = nodeA.position.distanceTo(nodeB.position);
        
        if (distance < CONFIG.connectionDistance) {
            candidates.push({ index: j, distance: distance });
        }
    }
    
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
        
        nodeData[i].connections++;
        nodeData[candidate.index].connections++;
        connectionCount++;
    }
}

// Connection lines with pulse effect
const lineMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.colors.connection,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
});

const lineGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(connections.length * 6);
const lineOpacities = new Float32Array(connections.length);

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
    
    lineOpacities[i] = Math.random();
}

lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

// ===== PARTICLE SYSTEMS =====

// Spores traveling on connections
const sporeCount = 80;
const sporeGeometry = new THREE.BufferGeometry();
const sporePositions = new Float32Array(sporeCount * 3);
const sporeVelocities = [];
const sporeNodes = [];
const sporeTrails = []; // Trail positions

for (let i = 0; i < sporeCount; i++) {
    const connIndex = Math.floor(Math.random() * connections.length);
    const conn = connections[connIndex];
    const from = nodes[conn.from].position;
    
    sporePositions[i * 3] = from.x;
    sporePositions[i * 3 + 1] = from.y;
    sporePositions[i * 3 + 2] = from.z;
    
    sporeVelocities.push({
        progress: Math.random(),
        speed: 0.001 + Math.random() * 0.003,
        trail: []
    });
    
    sporeNodes.push(connIndex);
    sporeTrails.push([]);
}

sporeGeometry.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));

const sporeMaterial = new THREE.PointsMaterial({
    color: CONFIG.colors.spore,
    size: 1.2,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
});

const spores = new THREE.Points(sporeGeometry, sporeMaterial);
scene.add(spores);

// Fireflies
const fireflyCount = 150;
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyPositions = new Float32Array(fireflyCount * 3);
const fireflyVelocities = [];
const fireflyPhases = [];

for (let i = 0; i < fireflyCount; i++) {
    fireflyPositions[i * 3] = (Math.random() - 0.5) * CONFIG.worldSize * 1.5;
    fireflyPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.worldSize * 1.5;
    
    fireflyVelocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.1,
        targetX: (Math.random() - 0.5) * CONFIG.worldSize,
        targetY: (Math.random() - 0.5) * 30,
        targetZ: (Math.random() - 0.5) * CONFIG.worldSize
    });
    
    fireflyPhases.push(Math.random() * Math.PI * 2);
}

fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));

const fireflyMaterial = new THREE.PointsMaterial({
    color: seasonColors.accent,
    size: 0.6,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);

// Ambient dust
const ambientCount = 300;
const ambientGeometry = new THREE.BufferGeometry();
const ambientPositions = new Float32Array(ambientCount * 3);
const ambientPhases = [];

for (let i = 0; i < ambientCount; i++) {
    ambientPositions[i * 3] = (Math.random() - 0.5) * CONFIG.worldSize * 1.2;
    ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.worldSize * 1.2;
    ambientPhases.push(Math.random() * Math.PI * 2);
}

ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));

const ambientMaterial = new THREE.PointsMaterial({
    color: 0x445566,
    size: 0.2,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
});

const ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
scene.add(ambientParticles);

// ===== SELECTION VISUALIZER =====
const selectionGeometry = new THREE.RingGeometry(1, 1.3, 32);
const selectionMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.selected,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
});
const selectionRing = new THREE.Mesh(selectionGeometry, selectionMaterial);
selectionRing.lookAt(camera.position);
scene.add(selectionRing);

// Glow sphere for selected node
const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.selected,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
});
const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glowSphere);

// ===== UI FUNCTIONS =====
function showNodeInfo(nodeIndex) {
    const node = nodes[nodeIndex];
    const data = node.data;
    
    document.getElementById('node-title').textContent = data.title;
    document.getElementById('node-category').textContent = data.category;
    document.getElementById('node-depth').textContent = `Depth: ${data.depth}`;
    document.getElementById('node-connections').textContent = `${data.connections} connections`;
    document.getElementById('node-formed').textContent = `Formed: ${data.formed}`;
    document.getElementById('node-insight').textContent = data.insight;
    
    const energyPercent = Math.round(data.energy * 100);
    document.getElementById('node-energy').style.width = `${energyPercent}%`;
    
    // Show season info
    document.getElementById('season-info').textContent = 
        `${timeSystem.season.charAt(0).toUpperCase() + timeSystem.season.slice(1)} • ${timeSystem.cycle}`;
    
    document.getElementById('node-panel').classList.add('active');
}

function hideNodeInfo() {
    document.getElementById('node-panel').classList.remove('active');
}

function highlightNode(index) {
    for (let i = 0; i < CONFIG.nodeCount; i++) {
        const color = originalColors[i];
        nodeColors[i * 3] = color.r;
        nodeColors[i * 3 + 1] = color.g;
        nodeColors[i * 3 + 2] = color.b;
    }
    
    if (index !== null) {
        nodeColors[index * 3] = 1;
        nodeColors[index * 3 + 1] = 0.7;
        nodeColors[index * 3 + 2] = 0;
        
        const node = nodes[index];
        node.connections.forEach(connIndex => {
            nodeColors[connIndex * 3] = 1;
            nodeColors[connIndex * 3 + 1] = 0.9;
            nodeColors[connIndex * 3 + 2] = 0.4;
        });
    }
    
    nodeMesh.instanceColor.needsUpdate = true;
}

function updateSelectionVisuals(time) {
    if (selectedNode !== null) {
        const node = nodes[selectedNode];
        selectionRing.position.copy(node.position);
        selectionRing.lookAt(camera.position);
        selectionRing.scale.setScalar(node.size * 3);
        selectionMaterial.opacity = 0.6 + Math.sin(time * 3) * 0.2;
        
        glowSphere.position.copy(node.position);
        glowSphere.scale.setScalar(node.size * 2 + Math.sin(time * 2) * 0.3);
        glowMaterial.opacity = 0.15 + Math.sin(time * 2.5) * 0.05;
    } else {
        selectionMaterial.opacity *= 0.9;
        glowMaterial.opacity *= 0.9;
    }
}

// ===== EVENT HANDLERS =====
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    camera.position.x += (mouse.x * 3 - (camera.position.x % 3)) * 0.005;
    camera.position.y += (25 + mouse.y * 8 - camera.position.y) * 0.005;
    
    raycaster.setFromCamera(mouse, camera);
    const intersection = raycaster.intersectObject(nodeMesh);
    
    if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        if (hoveredNode !== instanceId) {
            hoveredNode = instanceId;
            document.body.style.cursor = 'pointer';
        }
    } else {
        hoveredNode = null;
        document.body.style.cursor = 'default';
    }
}

function onClick(event) {
    if (Math.abs(event.movementX) > 2) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersection = raycaster.intersectObject(nodeMesh);
    
    if (intersection.length > 0) {
        selectedNode = intersection[0].instanceId;
        highlightNode(selectedNode);
        showNodeInfo(selectedNode);
        
        const node = nodes[selectedNode];
        const offset = camera.position.clone().sub(controls.target);
        
        // Smooth camera transition
        const targetPos = node.position.clone().add(offset.normalize().multiplyScalar(30));
        animateCamera(targetPos, node.position);
    } else {
        selectedNode = null;
        highlightNode(null);
        hideNodeInfo();
    }
}

function animateCamera(targetPos, targetLookAt) {
    const startPos = camera.position.clone();
    const startLookAt = controls.target.clone();
    const duration = 1000;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startLookAt, targetLookAt, ease);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Search functionality
window.searchNodes = function(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    nodeData.forEach((data, index) => {
        if (data.title.toLowerCase().includes(lowerQuery) || 
            data.category.toLowerCase().includes(lowerQuery)) {
            results.push({ index, data });
        }
    });
    
    return results;
};

document.getElementById('close-panel').addEventListener('click', () => {
    selectedNode = null;
    highlightNode(null);
    hideNodeInfo();
});

// Search input
document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length > 2) {
        const results = window.searchNodes(query);
        // Could show results in UI
        console.log(`Found ${results.length} nodes matching "${query}"`);
    }
});

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onClick);

controls.addEventListener('start', () => {
    controls.autoRotate = false;
});

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();
let spawnProgress = 0;

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Spawn animation
    if (spawnProgress < 1) {
        spawnProgress += 0.005;
    }
    
    // Animate nodes
    for (let i = 0; i < CONFIG.nodeCount; i++) {
        const node = nodes[i];
        
        // Spawn scale
        const spawnScale = Math.min(1, Math.max(0, (spawnProgress - node.spawnTime) * 2));
        const easeSpawn = 1 - Math.pow(1 - spawnScale, 3);
        
        // Pulse
        const pulse = 1 + Math.sin(time * node.pulseSpeed + node.phase) * 0.15;
        const scaleMult = (i === selectedNode) ? 1.3 : 1;
        
        dummy.position.copy(node.position);
        dummy.scale.setScalar(node.size * pulse * scaleMult * easeSpawn);
        dummy.updateMatrix();
        nodeMesh.setMatrixAt(i, dummy.matrix);
    }
    nodeMesh.instanceMatrix.needsUpdate = true;
    
    // Animate spores with trails
    const sporePos = spores.geometry.attributes.position.array;
    for (let i = 0; i < sporeCount; i++) {
        const vel = sporeVelocities[i];
        const connIndex = sporeNodes[i];
        const conn = connections[connIndex];
        
        vel.progress += vel.speed;
        
        if (vel.progress >= 1) {
            const newConnIndex = Math.floor(Math.random() * connections.length);
            sporeNodes[i] = newConnIndex;
            vel.progress = 0;
            vel.trail = [];
        } else {
            const from = nodes[conn.from].position;
            const to = nodes[conn.to].position;
            const t = vel.progress;
            
            sporePos[i * 3] = from.x + (to.x - from.x) * t + Math.sin(time * 3 + i) * 0.3;
            sporePos[i * 3 + 1] = from.y + (to.y - from.y) * t + Math.cos(time * 2 + i) * 0.2;
            sporePos[i * 3 + 2] = from.z + (to.z - from.z) * t + Math.sin(time * 2.5 + i) * 0.3;
        }
    }
    spores.geometry.attributes.position.needsUpdate = true;
    
    // Animate fireflies with flocking behavior
    const fireflyPos = fireflies.geometry.attributes.position.array;
    for (let i = 0; i < fireflyCount; i++) {
        const vel = fireflyVelocities[i];
        const phase = fireflyPhases[i];
        
        // Move toward target
        const dx = vel.targetX - fireflyPos[i * 3];
        const dy = vel.targetY - fireflyPos[i * 3 + 1];
        const dz = vel.targetZ - fireflyPos[i * 3 + 2];
        
        vel.x += dx * 0.0001;
        vel.y += dy * 0.0001;
        vel.z += dz * 0.0001;
        
        // Damping
        vel.x *= 0.99;
        vel.y *= 0.99;
        vel.z *= 0.99;
        
        // Add wobble
        fireflyPos[i * 3] += vel.x + Math.sin(time + phase) * 0.02;
        fireflyPos[i * 3 + 1] += vel.y + Math.cos(time * 0.8 + phase) * 0.01;
        fireflyPos[i * 3 + 2] += vel.z + Math.sin(time * 1.2 + phase) * 0.02;
        
        // New target occasionally
        if (Math.random() < 0.001) {
            vel.targetX = (Math.random() - 0.5) * CONFIG.worldSize;
            vel.targetY = (Math.random() - 0.5) * 40;
            vel.targetZ = (Math.random() - 0.5) * CONFIG.worldSize;
        }
    }
    fireflies.geometry.attributes.position.needsUpdate = true;
    
    // Animate ambient particles
    const ambientPos = ambientParticles.geometry.attributes.position.array;
    for (let i = 0; i < ambientCount; i++) {
        const phase = ambientPhases[i];
        ambientPos[i * 3 + 1] += Math.sin(time * 0.3 + phase) * 0.015;
    }
    ambientParticles.geometry.attributes.position.needsUpdate = true;
    
    // Subtle scene rotation
    scene.rotation.y = time * 0.015;
    
    // Update selection visuals
    updateSelectionVisuals(time);
    
    controls.update();
    composer.render();
}

// ===== RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ===== START =====
animate();
console.log('🍄 Mycelial Mind v3 - GOING WILD!');
console.log(`Season: ${timeSystem.season} | Time: ${timeSystem.cycle}`);
console.log(`Nodes: ${CONFIG.nodeCount}, Connections: ${connections.length}`);
console.log('Features: Seasonal colors, fireflies, smooth camera, search');
