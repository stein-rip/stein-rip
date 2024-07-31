// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75, // Field of view
	window.innerWidth / window.innerHeight, // Aspect ratio
	0.1, // Near clipping plane
	1000 // Far clipping plane
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0x404040));
const directionalLight = new THREE.DirectionalLight(0xffffcc, 0.5);
scene.add(directionalLight);

// Moon data
const moonData = [
	{
		texture: "assets/notebook_8bit.jpg",
		size: 0.4,
		orbitRadiusX: 2.8,
		orbitRadiusZ: 4,
		tiltAngle: Math.PI / 8,
		spinSpeed: 0.01,
		clickableMeshSize: 1.0, // Customizable size for clickable mesh
		url: "https://mem-portal.surge.sh",
	},
	{
		texture: "assets/star_8bit.jpg",
		size: 0.8,
		orbitRadiusX: 2.75,
		orbitRadiusZ: 4,
		tiltAngle: Math.PI / 8,
		spinSpeed: 0.02,
		clickableMeshSize: 1.0, // Customizable size for clickable mesh
		url: "https://finger-disco.surge.sh",
	},
	{
		texture: "assets/dnadesign.jpg",
		size: 0.3,
		orbitRadiusX: 2.5,
		orbitRadiusZ: 4,
		tiltAngle: Math.PI / 8,
		spinSpeed: 0.01,
		clickableMeshSize: 1.0, // Customizable size for clickable mesh
		url: "https://zonked-event.surge.sh",
	},
];

// Load main object
const mtlLoader = new THREE.MTLLoader();
mtlLoader.load("assets/tamagotchi/materials.mtl.bak", (materials) => {
	materials.preload();
	const objLoader = new THREE.OBJLoader();
	objLoader.setMaterials(materials);
	objLoader.load("assets/tamagotchi/model.obj", (object) => {
		object.scale.set(10, 10, 10); // Adjusted scale for better visibility
		object.rotation.y = Math.PI + 2.5;
		object.userData.clickable = true;
		scene.add(object);
		createMoons(object);
		console.log("Model loaded and added to scene");
	});
});

// Create moon function
function createMoon(data) {
	const {
		texture,
		size,
		orbitRadiusX,
		orbitRadiusZ,
		tiltAngle,
		spinSpeed,
		clickableMeshSize,
		url,
	} = data;
	const moonGeometry = new THREE.SphereGeometry(size, 64, 64);
	const moonMaterial = new THREE.MeshStandardMaterial({
		map: new THREE.TextureLoader().load(texture),
	});
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.userData = {
		orbitRadiusX,
		orbitRadiusZ,
		tiltAngle,
		spinSpeed,
		clickable: true,
		url,
	};

	// Create a larger clickable mesh around the moon
	const clickableGeometry = new THREE.SphereGeometry(clickableMeshSize, 32, 32);
	const clickableMaterial = new THREE.MeshBasicMaterial({
		color: 0xff0000,
		wireframe: true,
		transparent: true,
		opacity: 0.5,
	});
	const clickableMesh = new THREE.Mesh(clickableGeometry, clickableMaterial);
	clickableMesh.userData = {
		url,
		clickable: true,
	};

	moon.add(clickableMesh);
	clickableMesh.position.set(0, 0, 0);

	return moon;
}

// Create moons and animate them
function createMoons(planet) {
	const moons = moonData.map(createMoon);
	moons.forEach((moon) => {
		scene.add(moon);
		console.log("Moon added to scene:", moon);
	});
	animateMoons(moons, planet);
}

function animateMoons(moons, planet) {
	let angle = 0;
	function animateMoonsInner() {
		requestAnimationFrame(animateMoonsInner);
		angle += 0.004;
		moons.forEach((moon, index) => {
			const adjustedAngle = angle + (Math.PI / 1.3) * index;
			updateMoonPosition(moon, adjustedAngle, planet);
			moon.rotation.y += moon.userData.spinSpeed;
		});
	}
	animateMoonsInner();
}

function updateMoonPosition(moon, angle, planet) {
	const { orbitRadiusX, orbitRadiusZ, tiltAngle } = moon.userData;
	moon.position.set(
		planet.position.x + Math.cos(angle) * orbitRadiusX,
		planet.position.y + Math.sin(angle) * Math.sin(tiltAngle) * orbitRadiusZ,
		planet.position.z + Math.sin(angle) * Math.cos(tiltAngle) * orbitRadiusZ
	);
}

// Orbit controls for camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.enableZoom = true;

// Animation loop
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();

// Raycaster for clickable objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseOrTouch(event) {
	// Handle mouse and touch events
	let x, y;
	if (event.type === "touchstart") {
		// Use the first touch point
		x = event.touches[0].clientX;
		y = event.touches[0].clientY;
	} else {
		// Use the mouse position
		x = event.clientX;
		y = event.clientY;
	}

	mouse.x = (x / window.innerWidth) * 2 - 1;
	mouse.y = -(y / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, true);
	if (intersects.length > 0) {
		const object = intersects[0].object;
		if (object.userData.clickable) {
			const url = object.userData.url;
			if (url) {
				window.open(url, "_blank");
			}
		}
	}
}

// Add event listeners for both mouse and touch events
window.addEventListener("click", onMouseOrTouch);
window.addEventListener("touchstart", onMouseOrTouch);

// Log all objects in the scene
function logSceneObjects() {
	scene.traverse((object) => {
		console.log("Object in scene:", object);
	});
}
logSceneObjects();
