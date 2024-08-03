// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// Load main object (Tamagotchi)
let tamagotchi;
const mtlLoader = new THREE.MTLLoader();
mtlLoader.load("assets/tamagotchi/materials.mtl.bak", (materials) => {
	materials.preload();
	const objLoader = new THREE.OBJLoader();
	objLoader.setMaterials(materials);
	objLoader.load("assets/tamagotchi/model.obj", (object) => {
		object.scale.set(10, 10, 10);
		object.rotation.y = Math.PI;
		tamagotchi = object;
		scene.add(object);
		createMoons(object);
		setupDragControls([object]);
	});
});

// Create moons
function createMoons(planet) {
	const moonData = [
		{ size: 0.5, distance: 2, speed: 0.02, color: 0xff0000 },
		{ size: 0.5, distance: 3, speed: 0.02, color: 0x00ff00 },
		{ size: 0.5, distance: 4, speed: 0.02, color: 0x0000ff },
	];

	moonData.forEach((data) => {
		const moonGeometry = new THREE.SphereGeometry(data.size, 32, 32);
		const moonMaterial = new THREE.MeshBasicMaterial({ color: data.color });
		const moon = new THREE.Mesh(moonGeometry, moonMaterial);

		moon.userData = {
			distance: data.distance,
			speed: data.speed,
			angle: 0,
			clickable: true,
		};
		scene.add(moon);

		animateMoons.push(() => {
			moon.userData.angle += data.speed;
			moon.position.set(
				planet.position.x + Math.cos(moon.userData.angle) * data.distance,
				planet.position.y,
				planet.position.z + Math.sin(moon.userData.angle) * data.distance
			);
		});

		clickableObjects.push(moon);
	});
}

// Raycaster for detecting clicks/taps
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];

function onMouseOrTouch(event) {
	let x, y;
	if (event.type === "touchstart") {
		x = event.touches[0].clientX;
		y = event.touches[0].clientY;
	} else {
		x = event.clientX;
		y = event.clientY;
	}

	mouse.x = (x / window.innerWidth) * 2 - 1;
	mouse.y = -(y / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(clickableObjects);

	if (intersects.length > 0) {
		const object = intersects[0].object;
		if (object.userData.clickable) {
			console.log("Moon clicked/tapped!");
			// Add your URL handling here
		}
	}
}

window.addEventListener("click", onMouseOrTouch);
window.addEventListener("touchstart", onMouseOrTouch);

// Animation loop
const animateMoons = [];

function animate() {
	requestAnimationFrame(animate);
	animateMoons.forEach((fn) => fn());
	renderer.render(scene, camera);
}

animate();

// Drag controls
function setupDragControls(objects) {
	const controls = new THREE.DragControls(objects, camera, renderer.domElement);
	controls.addEventListener("dragstart", function (event) {
		event.object.material.emissive.set(0xaaaaaa);
	});
	controls.addEventListener("dragend", function (event) {
		event.object.material.emissive.set(0x000000);
	});
}
