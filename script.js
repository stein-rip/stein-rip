// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Load OBJ Model
const objLoader = new THREE.OBJLoader();
const mtlLoader = new THREE.MTLLoader();

mtlLoader.load("assets/tamagotchi/materials.mtl.bak", function (materials) {
	materials.preload();
	objLoader.setMaterials(materials);
	objLoader.load("assets/tamagotchi/model.obj", function (object) {
		object.position.set(0, 0, 0);
		object.rotation.y = Math.PI + 1.7;
		object.rotation.x = Math.PI + 3.5;
		scene.add(object);
	});
});

// Create the rotating sphere
const textureLoader = new THREE.TextureLoader();
const sphereRadius = 0.06; // Adjust this value to change the size of the sphere
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({
	map: textureLoader.load("assets/planet-1.jpg"),
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

// Set initial position of the sphere
const orbitRadius = .4;
sphere.position.set(orbitRadius, .55, .55);
scene.add(sphere);

// Animation variables
let angle = 1;
const angularSpeed = 1;

// Camera position
camera.position.z = 2;

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Update the angle for rotation
	angle += angularSpeed * 0.006; // Adjust the multiplier for speed as needed

	// Update position for orbit
	sphere.position.x = orbitRadius * Math.cos(angle / 5.5);
	sphere.position.y = orbitRadius * Math.sin(angle / 3.5);
	sphere.position.z = orbitRadius * Math.sin(angle / 5.5);
	// Rotate the sphere itself
	sphere.rotation.y += 0.03;

	renderer.render(scene, camera);
}


animate();

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
