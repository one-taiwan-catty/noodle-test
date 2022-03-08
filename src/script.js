import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import CANNON from 'cannon' 
import TweenMax from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Material
 */

/**
 * Model
 */
let beefNoodle1;
let beefNoodle2;
let beefNoodle3;
let group;

gltfLoader.load(
    'beefNoodle1.glb',
    (gltf) =>
    {
        // console.log(gltf.scene.children)
        // scene.add(gltf.scene)

        beefNoodle1 = gltf.scene.children.find((child) => child.name === 'noodle')
        beefNoodle1.rotation.y = - Math.PI * 0.5

        if (beefNoodle1) beefNoodle2 = beefNoodle1.clone()
        beefNoodle2.position.z = 0.7

        if (beefNoodle1) beefNoodle3 = beefNoodle1.clone()
        beefNoodle3.position.z = - 0.7

        group = new THREE.Group()
        group.add(beefNoodle1);
        group.add(beefNoodle2);
        group.add(beefNoodle3);

        scene.add(group);
    }
)



/**
 * Physics
 */
// World
const world = new CANNON.World()
// world.gravity.set(Vec3) - 9.82 = gravity on earth
world.gravity.set(0, - 9.82, 0)

//Sphere
const sphereShape = new CANNON.Sphere(0.4)

const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape
})

world.addBody(sphereBody)


// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody)


/**
 * Interaction
 */


/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshStandardMaterial({
        color: '#000000',
        metalness: 0.3,
        roughness: 0.4,
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, .1, 100)
camera.position.x = 3
camera.position.y = 2
camera.position.z = 0
// const aspectRatio = sizes.width / sizes.height
// const camera = new THREE.OrthographicCamera(- 1 * aspectRatio, 1 * aspectRatio, 1, - 1, .1, 100)
// camera.position.x = 3
// camera.position.y = 0
// camera.position.z = 0
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const environment = new RoomEnvironment();
const pmremGenerator = new THREE.PMREMGenerator( renderer );

// scene.background = new THREE.Color( 0x000000 );
scene.environment = pmremGenerator.fromScene(environment).texture;

// debugObject.clearColor = '#FF0000'
// gui.addColor(debugObject, 'clearColor')

/**
 * Post processing
 */
// const effectComposer = new EffectComposer(renderer)
// effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// effectComposer.setSize(sizes.width, sizes.height)

// const renderPass = new RenderPass(scene, camera)
// effectComposer.addPass(renderPass)

// const unrealBloomPass = new UnrealBloomPass()
// effectComposer.addPass(unrealBloomPass)

// unrealBloomPass.strength = 0
// unrealBloomPass.radius = 1
// unrealBloomPass.threshold = 0.6

// gui.add(unrealBloomPass, 'enabled')
// gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
// gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
// gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)




/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0
let movementSpeed, dirs;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics world
    world.step(1 / 60, deltaTime, 3)
    beefNoodle1.position.copy(sphereBody.position)
    
    if(beefNoodle1) beefNoodle1.position.x = 1;



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    // effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick();