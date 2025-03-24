import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Gestionnaire de chargement
const loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function () {
    const loadingBarContainer = document.getElementById('loadingBarContainer');
    const startMenu = document.getElementById('startMenu');
    loadingBarContainer.classList.add('hidden');
    setTimeout(() => {
        loadingBarContainer.style.display = 'none';
        startMenu.style.display = 'flex';
    }, 1000); // Correspond à la durée de l'animation fadeOut
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const percentage = (itemsLoaded / itemsTotal * 100).toFixed(0);
    loadingBar.style.width = percentage + '%';
    loadingPercentage.textContent = percentage + '%';
};

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 10);
camera.fov = 60;
camera.updateProjectionMatrix();

// Ajouter des lumières supplémentaires
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Ajouter un ciel bleu
const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Ajouter un soleil dans le ciel
const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-4, 120, -53);
scene.add(sun);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT ========================================================================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Charger le modèle 3D
const loader = new GLTFLoader(loadingManager);
const modelPath = './Musee3D.glb';
loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1);
    model.position.set(56.9, -4, -75);
    scene.add(model);
});

// COLLISION ========================================================================================================
let collisionbox = [];

const addCollisionBox = (position, scale) => {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const collisionBoxes = new THREE.Mesh(geometry, material);

    collisionBoxes.position.set(position.x, position.y, position.z);
    collisionBoxes.scale.set(scale.x, scale.y, scale.z);
    scene.add(collisionBoxes);

    let box = new THREE.Box3().setFromObject(collisionBoxes);
    collisionbox.push(box);
    collisionBoxes.visible = false;

    return collisionBoxes;
};
addCollisionBox(new THREE.Vector3(3.29, 5, 5.3), new THREE.Vector3(1, 20, 20));
addCollisionBox(new THREE.Vector3(-5.6, 5, 5.3), new THREE.Vector3(1, 20, 20));
addCollisionBox(new THREE.Vector3(-19.35, 5, -33), new THREE.Vector3(1, 20, 60));
addCollisionBox(new THREE.Vector3(16.35, 5, -33), new THREE.Vector3(1, 20, 60));
addCollisionBox(new THREE.Vector3(-1, 12, -24.5), new THREE.Vector3(40, 1, 80));
addCollisionBox(new THREE.Vector3(-2, 5, -62), new THREE.Vector3(37, 20, 1));
addCollisionBox(new THREE.Vector3(8.8, 5, -4.2), new THREE.Vector3(15, 20, 1));
addCollisionBox(new THREE.Vector3(-12.6, 5, -4.2), new THREE.Vector3(18, 20, 1));
addCollisionBox(new THREE.Vector3(-2, 5, 14.5), new THREE.Vector3(37, 20, 1));

addCollisionBox(new THREE.Vector3(-1, 1, -18), new THREE.Vector3(10, 4, 10));
addCollisionBox(new THREE.Vector3(-1, 1, -42.5), new THREE.Vector3(10, 4, 10));

// PointerLockControls (Permet de bouger la caméra avec la souris)
const controls = new PointerLockControls(camera, document.body);

const start = document.getElementById('start');
const page = document.getElementById('page');
const crosshair = document.getElementById('crosshair');
const langue = document.getElementById('language-buttons-container');

start.addEventListener('click', () => {
    setTimeout(() => {
        page.style.display = 'none';
        langue.style.display = 'none';
        controls.lock();
    }, 1000); // Correspond à la durée de l'animation fadeOut
});

controls.addEventListener('lock', function () {
    page.style.display = 'none';
    crosshair.style.display = 'block';
    start.style.display = 'none';
    infoDiv.style.display = 'none';
    wayvycompub.style.display = 'none';
});

//div pour les informations
const infoDivRed = document.getElementById('infoDivRed');
const infoDiv = document.getElementById('infoDiv');
const infoDivBlue = document.getElementById('infoDivBlue');
const infoDivViolet = document.getElementById('infoDivViolet');
const wayvycompub = document.getElementById('wayvycom');

controls.addEventListener('unlock', function () {
    page.style.display = 'block';
    crosshair.style.display = 'none';
    start.style.display = 'block';
    infoDiv.style.display = 'none';
    infoDivRed.style.display = 'none';
    infoDivBlue.style.display = 'none';
    infoDivViolet.style.display = 'none';
    langue.style.display = 'block';
    wayvycompub.style.display = 'block';

});

// Gestion des touches (Z, Q, S, D et flèches directionnelles)
const moveSpeed = 0.2;
const keyState = {};

document.addEventListener('keydown', (event) => {
    keyState[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keyState[event.code] = false;
});

// Bounding Box pour la caméra (simule le joueur)
const playerBox = new THREE.Box3();
const playerSize = new THREE.Vector3(1, 3, 1); // Largeur, Hauteur, Profondeur

// Vérification de collision
function checkCollision(newPosition) {
    let tempBox = new THREE.Box3().setFromCenterAndSize(newPosition, playerSize);

    for (let box of collisionbox) {
        if (tempBox.intersectsBox(box)) {
            return true; // Collision détectée
        }
    }
    return false; // Aucune collision
}

// Mise à jour de la position de la caméra
const updateCameraPosition = () => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // On évite les mouvements en hauteur
    const leftRight = new THREE.Vector3().crossVectors(camera.up, direction);

    let newPosition = camera.position.clone();

    if (keyState['KeyW'] || keyState['ArrowUp']) newPosition.addScaledVector(direction, moveSpeed),console.log(camera.position);
    if (keyState['KeyS'] || keyState['ArrowDown']) newPosition.addScaledVector(direction, -moveSpeed),console.log(camera.position);
    if (keyState['KeyA'] || keyState['ArrowLeft']) newPosition.addScaledVector(leftRight, moveSpeed),console.log(camera.position);
    if (keyState['KeyD'] || keyState['ArrowRight']) newPosition.addScaledVector(leftRight, -moveSpeed),console.log(camera.position);

    // Vérification de la collision avant de déplacer la caméra
    if (!checkCollision(newPosition)) {
        camera.position.copy(newPosition);
    }
};

// Boucle d'animation
const animate = () => {
    requestAnimationFrame(animate);

    // Met à jour la bounding box de la caméra (joueur)
    playerBox.setFromCenterAndSize(camera.position, playerSize);

    updateCameraPosition();
    renderer.render(scene, camera);
};

animate();

// permet l'interaction avec les objets 3D
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const greenBoxGeometry = new THREE.BoxGeometry(1.5, 1, 2.5);
const greenBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x0ff000 });
const greenBox = new THREE.Mesh(greenBoxGeometry, greenBoxMaterial);
greenBox.position.set(12, 0.5, -19);
scene.add(greenBox);
greenBox.visible = false;

const redBox = new THREE.Mesh(greenBoxGeometry, greenBoxMaterial);
redBox.position.set(12, 0.5, -43.5);
scene.add(redBox);
redBox.visible = false;

const blueBox = new THREE.Mesh(greenBoxGeometry, greenBoxMaterial);
blueBox.position.set(-16, 0.5, -19);
scene.add(blueBox);
blueBox.visible = false;

const violetBox = new THREE.Mesh(greenBoxGeometry, greenBoxMaterial);
violetBox.position.set(-16, 0.5, -45);
scene.add(violetBox);
violetBox.visible = false;


// Afficher ou masquer la div lorsque la boîte verte est cliquée
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object === greenBox && intersects[i].distance < 5) {
            if (infoDiv.style.display === 'block') {
                infoDiv.style.display = 'none';
            } else {
                infoDiv.style.display = 'block';
                infoDivRed.style.display = 'none';
                infoDivBlue.style.display = 'none';
                infoDivViolet.style.display = 'none';
            }
        } else if (intersects[i].object === redBox && intersects[i].distance < 5) {
            if (infoDivRed.style.display === 'block') {
                infoDivRed.style.display = 'none';
            } else {
                infoDivRed.style.display = 'block';
                infoDiv.style.display = 'none';
                infoDivBlue.style.display = 'none';
                infoDivViolet.style.display = 'none';
            }
        } else if (intersects[i].object === blueBox && intersects[i].distance < 5) {
            if (infoDivBlue.style.display === 'block') {
                infoDivBlue.style.display = 'none';
            } else {
                infoDivBlue.style.display = 'block';
                infoDiv.style.display = 'none';
                infoDivRed.style.display = 'none';
                infoDivViolet.style.display = 'none';
            }
        } else if (intersects[i].object === violetBox && intersects[i].distance < 5) {
            if (infoDivViolet.style.display === 'block') {
                infoDivViolet.style.display = 'none';
            } else {
                infoDivViolet.style.display = 'block';
                infoDiv.style.display = 'none';
                infoDivRed.style.display = 'none';
                infoDivBlue.style.display = 'none';
            }
        }
    }
});