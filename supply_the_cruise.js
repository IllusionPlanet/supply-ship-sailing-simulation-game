import * as THREE from "three";

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Water} from "three/examples/jsm/objects/Water.js";
import {Sky} from "three/examples/jsm/objects/Sky.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let camera, scene, renderer;
let water, sun, sky;
let ship, supplyShip, cruiseShip, cargoShip, smallCargoShip;
let pmremGenerator, renderTarget;
let forward = false, back = false, leftRotate = false, rightRotate = false;
let angle = 0;
let isOver = false;
let infoText = '', infoColor = '';
const forwardSpeed = 1, backSpeed = 0.7, rotateSpeed = 0.01;
const distance = 100, height = 35;
const safeDistance = 40;

initRenderer();
initCamera();
initScene();
initMeshes();
initLight();
// initAxesHelper();
// enableControls();

animate();

window.addEventListener("resize", onWindowResize);

window.addEventListener(
    "keydown",
    (ev) => {
        switch (ev.code){
            case "KeyW":
                forward = !isOver;
                break;
            case "KeyS":
                back = !isOver;
                break;
            case "KeyA":
                leftRotate = !isOver;
                break;
            case "KeyD":
                rightRotate = !isOver;
                break;
        }
    }
)

window.addEventListener(
    "keyup",
    (ev) => {
        switch (ev.code){
            case "KeyW":
                forward = false;
                break;
            case "KeyS":
                back = false;
                break;
            case "KeyA":
                leftRotate = false;
                break;
            case "KeyD":
                rightRotate = false;
                break;
        }
    }
)

function initRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);
    pmremGenerator = new THREE.PMREMGenerator(renderer);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(
        55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(-distance, height, 0);
}

function initScene() {
    scene = new THREE.Scene();

}

function initMeshes() {
    sun = new THREE.Vector3(100,2,0);
    water = new Water( //bufferGeometry, ShaderMaterial.
        new THREE.PlaneGeometry(100000,100000),
        {
            waterNormals: new THREE.TextureLoader().load(
                // "D:\\IntelliJ IDEA项目\\HeartOfOcean\\src\\assets\\textures\\waternormals.jpg",
                "https://s2.loli.net/2022/11/03/NSVb3y6m9Dxe4YZ.jpg",
                function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }
            ),
            sunDirection: sun,
            sunColor: 0xffffff,
            waterColor: 0x001e0f
        }
    );
    water.rotation.x = -Math.PI/2;
    scene.add(water);

    sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    sky.material.uniforms["sunPosition"].value.copy(sun);

    if(renderTarget !== undefined){
        renderTarget.dispose();
    }
    renderTarget = pmremGenerator.fromScene(sky);
    scene.environment = renderTarget.texture;

    const loader = new GLTFLoader();
    loader.load('public/supply_ship/scene.gltf', function (gltf) {
        ship = gltf.scene;
        ship.scale.set(0.006,0.006,0.006);
        ship.position.set(0,0,0);
        ship.rotation.y += -Math.PI/2;
        scene.add(ship);
    });

    loader.load('public/supply_ship/scene.gltf', function (gltf) {
        supplyShip = gltf.scene;
        supplyShip.scale.set(0.006,0.006,0.006);
        supplyShip.position.set(200,0,200);
        scene.add(supplyShip);
    })

    loader.load('public/cruise_ship/scene.gltf', function (gltf) {
        cruiseShip = gltf.scene;
        cruiseShip.scale.set(0.006,0.006,0.006);
        cruiseShip.position.set(150,0,-50);
        cruiseShip.rotation.y += -Math.PI/2;
        scene.add(cruiseShip);
    })

    loader.load('public/cargo_ship/scene.gltf', function (gltf) {
        cargoShip = gltf.scene;
        cargoShip.scale.set(0.5,0.5,0.5);
        cargoShip.position.set(1000,0,400);
        cargoShip.rotation.y += -5*(Math.PI/4);
        scene.add(cargoShip);
    })

    loader.load('public/small_cargo_ship/scene.gltf', function (gltf) {
        smallCargoShip = gltf.scene;
        smallCargoShip.scale.set(35,35,35);
        smallCargoShip.position.set(1200,0,-1000);
        smallCargoShip.rotation.y += -3*(Math.PI/2);
        scene.add(smallCargoShip);
    })
}

function initLight() {
    const shipDirLight = new THREE.DirectionalLight(0xffffff);
    const supplyShipDirLight = new THREE.DirectionalLight(0xffffff);
    const cruiseShipDirLight = new THREE.DirectionalLight(0xffffff);
    const cargoShipDirLight = new THREE.DirectionalLight(0xffffff);
    const smallCargoShipDirLight = new THREE.DirectionalLight(0xffffff);
    if(ship){
        shipDirLight.position.set(ship.position);
    }
    if(supplyShip){
        supplyShipDirLight.position.set(supplyShip.position);
    }
    if(cruiseShip){
        cruiseShipDirLight.position.set(cruiseShip.position);
    }
    if(cargoShip){
        cargoShipDirLight.position.set(cargoShip.position);
    }
    if(smallCargoShip){
        smallCargoShipDirLight.position.set(smallCargoShip.position);
    }
    scene.add(shipDirLight);
    scene.add(supplyShipDirLight);
    scene.add(cruiseShipDirLight);
    scene.add(cargoShipDirLight);
    scene.add(smallCargoShipDirLight);
}

function initAxesHelper() {
    scene.add(new THREE.AxesHelper(10));
}

function enableControls() {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0,10,0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    const time = window.performance.now() * 0.001;
    water.material.uniforms["time"].value += 1/60;
    if(ship){
        ship.position.y = Math.sin(time) * 3 + 1;
        camera.lookAt(ship.position);
        if(forward){
            ship.position.x += forwardSpeed * Math.cos(angle);
            ship.position.z += forwardSpeed * Math.sin(angle);
            camera.position.x += forwardSpeed * Math.cos(angle);
            camera.position.z += forwardSpeed * Math.sin(angle);
        }
        if(back){
            ship.position.x -= backSpeed * Math.cos(angle);
            ship.position.z -= backSpeed * Math.sin(angle);
            camera.position.x -= backSpeed * Math.cos(angle);
            camera.position.z -= backSpeed * Math.sin(angle);
        }
        if(leftRotate){
            ship.rotation.y += rotateSpeed;
            angle -= rotateSpeed;
            camera.position.x -= distance * (Math.cos(angle) - Math.cos(rotateSpeed+angle));
            camera.position.z += distance * (Math.sin(rotateSpeed+angle) - Math.sin(angle));
        }
        if(rightRotate){
            ship.rotation.y -= rotateSpeed;
            angle += rotateSpeed;
            camera.position.x += distance * (Math.cos(angle) - Math.cos(rotateSpeed+angle));
            camera.position.z -= distance * (Math.sin(rotateSpeed+angle) - Math.sin(angle));
        }

        if(!isOver && cruiseShip && ship.position.x >= cruiseShip.position.x &&
                Math.abs(ship.position.z-cruiseShip.position.z) < 60){
            infoText = "游轮已收到供给，任务完成！";
            infoColor = "#008000";
            showInfo();
        }

        if(!isOver && supplyShip && cargoShip && smallCargoShip && (
                (Math.abs(supplyShip.position.x - ship.position.x) < safeDistance &&
                    Math.abs(supplyShip.position.z - ship.position.z) < safeDistance) ||
                (Math.abs(cargoShip.position.x - ship.position.x) < safeDistance &&
                    Math.abs(cargoShip.position.z - ship.position.z) < safeDistance) ||
                (Math.abs(smallCargoShip.position.x - ship.position.x) < safeDistance &&
                    Math.abs(smallCargoShip.position.z - ship.position.z) < safeDistance))){
            infoText = "发生碰撞事故，任务失败！";
            infoColor = "#FF0000";
            showInfo();
        }
    }
    if(supplyShip){
        supplyShip.position.y = Math.sin(time) * 3 + 1.5;
        supplyShip.position.z -= 0.5;
    }
    if(cruiseShip){
        cruiseShip.position.y = Math.sin(time) * 3 + 1.5;
        cruiseShip.position.x += 0.7;
    }
    if(cargoShip){
        cargoShip.position.y = Math.sin(time) * 2 - 15;
        cargoShip.position.z -= 0.4;
        cargoShip.position.x -= 0.4;
    }
    if(smallCargoShip){
        smallCargoShip.position.y = Math.sin(time) * 2 + 10;
        smallCargoShip.position.z += 0.4;
    }
    renderer.render(scene, camera);
}


function showInfo() {
    isOver = true;
    forward = false;
    back = false;
    leftRotate = false;
    rightRotate = false;
    var canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 64;
    var c = canvas.getContext('2d');
    c.fillStyle = "#aaaaff";
    c.fillRect(0, 0, 512, 64);
    // 文字
    c.beginPath();
    c.translate(256, 32);
    c.fillStyle = infoColor; //文本填充颜色
    c.font = "bold 28px 黑体"; //字体样式设置
    c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(infoText, 0, 0);

    var cubeGeometry = new THREE.BoxGeometry(40,0.1,20);
    let canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.wrapS = THREE.RepeatWrapping;
    var material = new THREE.MeshPhongMaterial({
        map: canvasTexture, // 设置纹理贴图
    });
    var cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.set(-8000,20,0);
    cube.rotation.y += -Math.PI/2;
    scene.add(cube);
    camera.position.set(-8060,40,0);
    camera.lookAt(cube);
}
