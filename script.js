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
		size: 0.4, // Adjusted size
		orbitRadiusX: 2.8, // Adjusted radius
		orbitRadiusZ: 4, // Adjusted radius
		tiltAngle: Math.PI / 8,
		spinSpeed: 0.01,
		url: "https://mem-portal.surge.sh",
	},
	{
		texture: "assets/star_8bit.jpg",
		size: 0.8, // Adjusted size
		orbitRadiusX: 2.75, // Adjusted radius
		orbitRadiusZ: 4, // Adjusted radius
		tiltAngle: Math.PI / 8,
		spinSpeed: 0.02,
		url: "https://finger-disco.surge.sh",
	},
	{
		texture: "assets/dnadesign.jpg",
		size: 0.3, // Adjusted size
		orbitRadiusX: 2.5, // Adjusted radius
		orbitRadiusZ: 4, // Adjusted radius
		tiltAngle: Math.PI / 8,
		spinSpeed: 0.01,
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
		url,
	} = data;

	// Create the actual moon mesh
	const moonGeometry = new THREE.SphereGeometry(size, 64, 64);
	const moonMaterial = new THREE.MeshStandardMaterial({
		map: new THREE.TextureLoader().load(texture),
	});
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);

	// Create a larger clickable mesh
	const clickableGeometry = new THREE.SphereGeometry(size * 2.5, 64, 64);
	const clickableMaterial = new THREE.MeshBasicMaterial({
		color: 0x00ff00, // Visible in debug mode
		transparent: true,
		opacity: 0.2, // Slightly visible for debugging
	});
	const clickableMesh = new THREE.Mesh(clickableGeometry, clickableMaterial);
	clickableMesh.userData = { clickable: true, url };

	moon.add(clickableMesh);

	moon.userData = {
		orbitRadiusX,
		orbitRadiusZ,
		tiltAngle,
		spinSpeed,
		clickable: true,
		url,
	};

	console.log(
		"Moon created with size:",
		size,
		"at position:",
		moon.position,
		"with userData:",
		moon.userData
	);
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

function onMouseClick(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);

	// Use scene.traverse to include all objects
	const intersects = raycaster.intersectObjects(scene.children, true);
	console.log("Intersects:", intersects);

	if (intersects.length > 0) {
		const object = intersects[0].object;
		console.log("Clicked Object:", object);

		// Check the parent object to get the userData
		let clickableObject = object;
		while (clickableObject && !clickableObject.userData.clickable) {
			clickableObject = clickableObject.parent;
		}

		if (clickableObject && clickableObject.userData.clickable) {
			console.log("Clickable object clicked:", clickableObject);
			const url = clickableObject.userData.url;
			if (url) {
				console.log("Opening URL:", url);
				window.open(url, "_blank");
			} else {
				console.log("No URL found for object:", clickableObject);
			}
		} else {
			console.log("Object is not clickable:", object);
		}
	} else {
		console.log("No object intersected");
	}
}
window.addEventListener("click", onMouseClick);

// Log all objects in the scene
function logSceneObjects() {
	scene.traverse((object) => {
		console.log("Object in scene:", object);
	});
}
logSceneObjects();
