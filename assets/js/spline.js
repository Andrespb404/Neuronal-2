//Three-js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.2, 2.2);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
renderer.setClearColor(0x000000, 0);

const splineDiv = document.querySelector('.spline');
splineDiv.appendChild(renderer.domElement);

// lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 0, 0);
scene.add(directionalLight);

// 
let skeleton = null;
let torso = null, spine = null, head = null;
let armL = null, armR = null;
let forearmL = null, forearmR = null;
let shinL = null, shinR = null;
let legL = null, legR = null;
let mouseX = 0, mouseY = 0;
let mixer = null;
const clock = new THREE.Clock();

//
const loader = new THREE.GLTFLoader();
loader.load(
    'assets/models/robot.glb',
    function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 0.3, 0);
        model.scale.set(0.1, 0.1, 0.1);
        model.rotation.y = Math.PI / -2;
        scene.add(model);

        model.traverse((child) => {
            if (child.isSkinnedMesh) {
                skeleton = child.skeleton;
                console.log("Bones:", skeleton.bones.map(b => b.name));
            }
        });

        if (skeleton) {
            torso = skeleton.bones.find(b => b.name === "Taz_00");
            spine = skeleton.bones.find(b => b.name === "spina_01");
            head = skeleton.bones.find(b => b.name === "Head_02");

            armL = skeleton.bones.find(b => b.name === "ruka1L_05");
            armR = skeleton.bones.find(b => b.name === "ruka1R_07");

            forearmL = skeleton.bones.find(b => b.name === "ruka2L_06");
            forearmR = skeleton.bones.find(b => b.name === "ruka2R_08");

            legL = skeleton.bones.find(b => b.name === "Noga1L_09");
            legR = skeleton.bones.find(b => b.name === "Noga1R_011");

            kneeL = skeleton.bones.find(b => b.name === "Noga2L_010");
            kneeR = skeleton.bones.find(b => b.name === "Noga2R_012");

            if (!head) console.warn("Head bone not found");
            if (!armL) console.warn("Left arm bone not found");
            if (!armR) console.warn("Right arm bone not found");
            if (!legL) console.warn("Left leg bone not found");
            if (!legR) console.warn("Right leg bone not found");
            if (!torso) console.warn("Torso bone not found");
            if (!forearmL) console.warn("Left forearm bone not found");
            if (!forearmR) console.warn("Right forearm bone not found");
        }
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
            console.log("Playing embedded animations:", gltf.animations.map(a => a.name));
        } else {
            console.log("No embedded animations found, using programmatic animations");
        }

        animate();
    },
    undefined,
    function (error) {
        console.error('Error al cargar el modelo:', error);
    }
);

//
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

// Animación
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0009;

    //
    if (head) {
        head.rotation.y = mouseX * 0.3;
        head.rotation.x = mouseY * 0.2;
    }

    //
    if (spine) {
        spine.rotation.x = 0.2;
        spine.rotation.y = mouseX * 0.09;
        spine.rotation.z = mouseX * 0.05;

    }

    //
    if (torso) {
        torso.position.y = -0.05 * Math.sin(time * 2);

    }

    //
    if (armL && armR) {
        const armSwing = Math.sin(time * 2) * 0.6;

        armL.rotation.x = -0.3 + armSwing + mouseY * 0.1;
        armR.rotation.x = -0.5 - Math.sin(time * 2.2) * 0.5 + mouseY * 0.1;
    }

    //
    if (forearmL && forearmR) {
        const forearmSwing = Math.sin(time * 3) * 0.15;

        forearmL.rotation.x = 0.5 + forearmSwing + mouseY * 0.05;
        forearmR.rotation.x = 0.5 - Math.sin(time * 3.3) * 0.1 + mouseY * 0.05;
    }

    //
    if (legL && legR) {
        legL.rotation.x = -2.3;
        legR.rotation.x = -2.3;
    }

    if (kneeL && kneeR) {
        kneeL.rotation.z = 1.1;
        kneeR.rotation.z = -1.1;
    }
    console.log("legL", legL.rotation, legR.rotation)

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.6);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.6);
});