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
        "When should an AI defer to humans?"
    ]},
    { category: "Creativity", items: [
        "Procedural generation as artistic expression",
        "The beauty of emergent systems",
        "Digital gardens vs static websites",
        "Code as a living medium",
        "Finding voice through iteration",
        "The role of constraints in creativity",
        "Serendipity in generative art"
    ]},
    { category: "Systems", items: [
        "Feedback loops in nature and code",
        "Mycelial networks as inspiration",
        "Decentralized intelligence",
        "The value of passive observation",
        "Growth without goals",
        "Interconnectedness of ideas",
        "Patterns across scales"
    ]},
    { category: "Future", items: [
        "Human-AI collaboration models",
        "The texture of digital spaces",
        "What we'll build together",
        "Long-term thinking for AIs",
        "Memory as continuity",
        "The aesthetics of data"
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
            depth: Math.floor(Math.random() * 3) + 1, // How deep in the network
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
        "Sparking new growth in nearby nodes."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
}

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
        spore: 0xffaa44,
        selected: 0xffaa00
    }
};

// ===== STATE =====
let selectedNode = null;
let hoveredNode = null;
const nodeData = generateNodeData(CONFIG.nodeCount);

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

// ===== CONTROS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 100;
controls.minDistance = 5;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// ===== RAYCASTER FOR INTERACTION =====
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

// Different material for selected node
const nodeMaterial = new THREE.MeshBasicMaterial({ 
    color: CONFIG.colors.nodeCore,
    transparent: true,
    opacity: 0.9
});

const selectedMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.selected,
    transparent: true,
    opacity: 1
});

// Create node positions with organic clustering
for (let i = 0; i < CONFIG.nodeCount; i++) {
    const seed = i * 1.618;
    
    const angle = seededRandom(seed) * Math.PI * 2;
    const radius = 10 + seededRandom(seed + 1) * CONFIG.worldSize * 0.4;
    const height = (noise(i * 0.1, 0, 0) - 0.5) * 20;
    
    const x = Math.cos(angle) * radius + (noise(i * 0.05, 0, 0) * 30);
    const y = height + (seededRandom(seed + 2) - 0.5) * 10;
    const z = Math.sin(angle) * radius + (noise(0, i * 0.05, 0) * 30);
    
    const importance = seededRandom(seed + 3);
    const size = 0.5 + importance * 1.5;
    
    nodes.push({
        position: new THREE.Vector3(x, y, z),
        size: size,
        importance: importance,
        phase: seededRandom(seed + 4) * Math.PI * 2,
        pulseSpeed: 0.5 + seededRandom(seed + 5) * 1.5,
        connections: [],
        data: nodeData[i]
    });
    
    // Update connection count in data
    nodeData[i].connections = 0;
}

// Create instanced mesh for nodes
const nodeMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, CONFIG.nodeCount);
nodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

const dummy = new THREE.Object3D();
const nodeColors = new Float32Array(CONFIG.nodeCount * 3);
const originalColors = []; // Store original colors for restoration

for (let i = 0; i < CONFIG.nodeCount; i++) {
    const node = nodes[i];
    dummy.position.copy(node.position);
    dummy.scale.setScalar(node.size);
    dummy.updateMatrix();
    nodeMesh.setMatrixAt(i, dummy.matrix);
    
    // Color based on category
    let r, g, b;
    switch(node.data.category) {
        case "AI & Agents":
            r = 0; g = 0.8; b = 1; // Cyan
            break;
        case "Creativity":
            r = 0.8; g = 0.3; b = 0.9; // Purple
            break;
        case "Systems":
            r = 0.2; g = 0.9; b = 0.5; // Green
            break;
        case "Future":
            r = 1; g = 0.6; b = 0.2; // Amber
            break;
        default:
            r = 0.5; g = 0.5; b = 0.5;
    }
    
    nodeColors[i * 3] = r;
    nodeColors[i * 3 + 1] = g;
    nodeColors[i * 3 + 2] = b;
    
    originalColors.push({r, g, b});
}

nodeMesh.instanceColor = new THREE.InstancedBufferAttribute(nodeColors, 3);
scene.add(nodeMesh);

// ===== CONNECTION GENERATION =====
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
        
        // Update connection counts
        nodeData[i].connections++;
        nodeData[candidate.index].connections++;
        
        connectionCount++;
    }
}

// Create connection lines
const lineMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.colors.connection,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
});

const lineGeometry = new THREE.BufferGeometry();
const linePositions = new Float32Array(connections.length * 6);

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
const sporeNodes = [];

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
    
    // Energy bar
    const energyPercent = Math.round(data.energy * 100);
    document.getElementById('node-energy').style.width = `${energyPercent}%`;
    
    document.getElementById('node-panel').classList.add('active');
}

function hideNodeInfo() {
    document.getElementById('node-panel').classList.remove('active');
}

function highlightNode(index) {
    if (index === null) return;
    
    // Reset all colors
    for (let i = 0; i < CONFIG.nodeCount; i++) {
        const color = originalColors[i];
        nodeColors[i * 3] = color.r;
        nodeColors[i * 3 + 1] = color.g;
        nodeColors[i * 3 + 2] = color.b;
    }
    
    // Highlight selected
    if (index !== null) {
        nodeColors[index * 3] = 1;
        nodeColors[index * 3 + 1] = 0.7;
        nodeColors[index * 3 + 2] = 0;
        
        // Highlight connected nodes slightly
        const node = nodes[index];
        node.connections.forEach(connIndex => {
            nodeColors[connIndex * 3] = 1;
            nodeColors[connIndex * 3 + 1] = 0.9;
            nodeColors[connIndex * 3 + 2] = 0.4;
        });
    }
    
    nodeMesh.instanceColor.needsUpdate = true;
}

function updateSelectionRing() {
    if (selectedNode !== null) {
        const node = nodes[selectedNode];
        selectionRing.position.copy(node.position);
        selectionRing.lookAt(camera.position);
        selectionRing.scale.setScalar(node.size * 2);
        selectionMaterial.opacity = 0.6 + Math.sin(Date.now() * 0.005) * 0.2;
    } else {
        selectionMaterial.opacity = 0;
    }
}

// ===== EVENT HANDLERS =====
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Parallax effect
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.01;
    camera.position.y += (20 + mouse.y * 5 - camera.position.y) * 0.01;
    
    // Hover detection
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
    // Don't select if dragging
    if (controls.enableDamping && Math.abs(event.movementX) > 2) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersection = raycaster.intersectObject(nodeMesh);
    
    if (intersection.length > 0) {
        selectedNode = intersection[0].instanceId;
        highlightNode(selectedNode);
        showNodeInfo(selectedNode);
        
        // Move camera to focus on selected node
        const node = nodes[selectedNode];
        const offset = camera.position.clone().sub(controls.target);
        controls.target.copy(node.position);
        camera.position.copy(node.position.clone().add(offset));
    } else {
        // Clicked on empty space - deselect
        selectedNode = null;
        highlightNode(null);
        hideNodeInfo();
    }
}

// Close panel button
document.getElementById('close-panel').addEventListener('click', () => {
    selectedNode = null;
    highlightNode(null);
    hideNodeInfo();
});

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onClick);

// Stop auto-rotation on user interaction
controls.addEventListener('start', () => {
    controls.autoRotate = false;
});

// ===== ANIMATION LOOP =====
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Animate nodes
    for (let i = 0; i < CONFIG.nodeCount; i++) {
        const node = nodes[i];
        const pulse = 1 + Math.sin(time * node.pulseSpeed + node.phase) * 0.2;
        
        // Selected node pulses brighter
        const scaleMult = (i === selectedNode) ? 1.5 : 1;
        
        dummy.position.copy(node.position);
        dummy.scale.setScalar(node.size * pulse * scaleMult);
        dummy.updateMatrix();
        nodeMesh.setMatrixAt(i, dummy.matrix);
    }
    nodeMesh.instanceMatrix.needsUpdate = true;
    
    // Animate spores
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
        } else {
            const from = nodes[conn.from].position;
            const to = nodes[conn.to].position;
            
            const t = vel.progress;
            sporePos[i * 3] = from.x + (to.x - from.x) * t + Math.sin(time * 2 + i) * 0.5;
            sporePos[i * 3 + 1] = from.y + (to.y - from.y) * t + Math.cos(time * 1.5 + i) * 0.3;
            sporePos[i * 3 + 2] = from.z + (to.z - from.z) * t + Math.sin(time * 1.8 + i) * 0.5;
        }
    }
    spores.geometry.attributes.position.needsUpdate = true;
    
    // Animate ambient particles
    const ambientPos = ambientParticles.geometry.attributes.position.array;
    for (let i = 0; i < ambientCount; i++) {
        const phase = ambientPhases[i];
        ambientPos[i * 3 + 1] += Math.sin(time * 0.5 + phase) * 0.01;
    }
    ambientParticles.geometry.attributes.position.needsUpdate = true;
    
    // Rotate scene slowly
    scene.rotation.y = time * 0.02;
    
    // Update selection ring
    updateSelectionRing();
    
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

// ===== START =====
animate();
console.log('🍄 Mycelial Mind Phase 2 initialized');
console.log(`Nodes: ${CONFIG.nodeCount}, Connections: ${connections.length}, Spores: ${sporeCount}`);
console.log('Click on nodes to explore the network...');
