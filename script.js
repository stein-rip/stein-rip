const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 1;

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
mtlLoader.load(
	"assets/tamagotchi/materials.mtl.bak",
	(materials) => {
		materials.preload();
		const objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load(
			"assets/tamagotchi/model.obj",
			(object) => {
				object.rotation.y = Math.PI + 2.2;
				object.rotation.x = Math.PI + 3;
				object.rotation.z = -0.001;
				tamagotchi = object;
				scene.add(object);
				// Add to clickable objects
				clickableObjects.push(object);
			},
			undefined,
			(error) => {
				console.error("An error happened while loading the object:", error);
			}
		);
	},
	undefined,
	(error) => {
		console.error("An error happened while loading the materials:", error);
	}
);

// Orbit controls
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.25;
orbitControls.enableZoom = true;

// Raycaster for detecting clicks/taps and dragging
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [];

let selectedObject = null;
let offset = new THREE.Vector3();

function onMouseDown(event) {
	event.preventDefault();

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(clickableObjects);

	if (intersects.length > 0) {
		selectedObject = intersects[0].object;
		const intersectsPlane = raycaster.ray.intersectPlane(
			new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
		);
		offset.copy(intersectsPlane).sub(selectedObject.position);
	}
}

function onMouseMove(event) {
	if (selectedObject) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		const intersectsPlane = raycaster.ray.intersectPlane(
			new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
		);

		if (intersectsPlane) {
			selectedObject.position.copy(intersectsPlane.sub(offset));
		}
	}
}

function onMouseUp() {
	selectedObject = null;
}

window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseup", onMouseUp);

// Animation loop
function animate() {
	requestAnimationFrame(animate);
	orbitControls.update();
	renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
