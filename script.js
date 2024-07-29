const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	4,
	window.innerWidth / window.innerHeight
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffcc, 0.5);
scene.add(directionalLight);

const mtlLoader = new THREE.MTLLoader();
mtlLoader.load("assets/tamagotchi/materials.mtl.bak", (materials) => {
	materials.preload();
	const objLoader = new THREE.OBJLoader();
	objLoader.setMaterials(materials);
	objLoader.load("assets/tamagotchi/model.obj", (object) => {
		object.scale.set(0.5, 0.5, 0.5);
		object.rotation.y = Math.PI + 2.5;
		scene.add(object);
		createMoons(object); // Create and animate moons
	});
});

camera.position.z = 10;

// Function to create multiple moons
function createMoons(planet) {
	const moonData = [
		{
			texture: "assets/notebook_8bit.jpg",
			size: 0.03,
			orbitRadiusX: 0.145,
			orbitRadiusZ: 0.14,
			tiltAngle: Math.PI / 8,
		},
		{
			texture: "assets/star_8bit.jpg",
			size: 0.02,
			orbitRadiusX: 0.145,
			orbitRadiusZ: 0.14,
			tiltAngle: Math.PI / 8,
		},
		{
			texture: "assets/dnadesign.jpg",
			size: 0.02,
			orbitRadiusX: 0.145,
			orbitRadiusZ: 0.14,
			tiltAngle: Math.PI / 8,
		},
	];

	const moons = moonData.map((data) =>
		createMoon(
			data.texture,
			data.size,
			data.orbitRadiusX,
			data.orbitRadiusZ,
			data.tiltAngle
		)
	);
	moons.forEach((moon) => scene.add(moon));
	animateMoons(moons, planet); // Start animation
}

// Helper function to create a single moon
function createMoon(texturePath, size, orbitRadiusX, orbitRadiusZ, tiltAngle) {
	const moonGeometry = new THREE.SphereGeometry(size, 32, 32);
	const moonMaterial = new THREE.MeshStandardMaterial({
		map: new THREE.TextureLoader().load(texturePath),
	});
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.userData = { orbitRadiusX, orbitRadiusZ, tiltAngle };
	return moon;
}

// Function to animate moons
function animateMoons(moons, planet) {
	let angle = 0;

	function animateMoonsInner() {
		requestAnimationFrame(animateMoonsInner);
		angle += 0.004;

		moons.forEach((moon, index) => {
			const adjustedAngle = angle + (Math.PI / 2) * index;
			updateMoonPosition(moon, adjustedAngle, planet);
			moon.rotation.y += 0.02; // Spin around their own axis
		});
	}

	animateMoonsInner();
}

// Helper function to update moon position based on orbit parameters
function updateMoonPosition(moon, angle, planet) {
	const { orbitRadiusX, orbitRadiusZ, tiltAngle } = moon.userData;
	moon.position.x = planet.position.x + Math.cos(angle) * orbitRadiusX;
	moon.position.y =
		planet.position.y + Math.sin(angle) * Math.sin(tiltAngle) * orbitRadiusZ;
	moon.position.z =
		planet.position.z + Math.sin(angle) * Math.cos(tiltAngle) * orbitRadiusZ;
}

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional: For smooth controls
controls.dampingFactor = 0.5; // Adjust this value as needed
controls.enableZoom = true; // Allow zooming

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
});
