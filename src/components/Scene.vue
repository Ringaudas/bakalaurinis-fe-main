<template>
    <div>
        <div id="canvas" >

        </div>
        <div class="footer footer-image" id="footer">
        <nav class="container-fluid" style="height:80px;">
            <div class="row">
                <div class="col">
                    <br>
                    <a class="navbar-brand" href="#">Navigation Bar</a>
                </div>
                <div class="col-5">
                    <label for="customRange2 " class="form-label">Example range</label>
                    <input type="range" class="form-range" min="0" max="5" id="customRange2">
                </div>
                <div class="col">
                    <br>
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-import-modal-lg">Menu</button>
                    
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-subject-modal-lg" style="margin-left:5px;">Subjects</button>  
                </div>
            </div>
        </nav>
      </div>
    </div>
</template>


<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
export default {
    data()  {
        return{
        }
    },
    mounted(){
        this.initialize()
    },
    methods:{
        initialize: function(){
            let camera, scene, renderer, labelRenderer;
var spheres = [];
const TORUS_RADIUS = 12;
const SPHERE_RADIUS = 0.27;

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let sphere,torus;

init();
animate();

function init() {
    let canvas = document.getElementById("canvas");
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
    camera.position.set( 10, 5, 20 );

    scene = new THREE.Scene();

    //lightning
    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(0,40,0);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    const lightHelper = new THREE.PointLightHelper(pointLight)
    const gridHelper = new THREE.GridHelper(200,50);
    scene.add(lightHelper, gridHelper);

    //sceneBackground = new THREE.TextureLoader().load('test2.jpg');
    //scene.background = sceneBackground;
    //donut
    const geometry2 = new THREE.TorusGeometry(10,3,16,100)
    const material2 = new THREE.MeshStandardMaterial( { color: 0xFF6347});
    torus = new THREE.Mesh (geometry2, material2);
    scene.add(torus)
    //test for donut
    const torusDiv = document.createElement( 'div' );
    torusDiv.className = 'label';
    torusDiv.textContent = 'Torus';
    torusDiv.style.marginTop = '-1em';
    const torusLabel = new CSS2DObject( torusDiv );
    torusLabel.position.set( 5, TORUS_RADIUS, 0 );
    torus.add( torusLabel );
    //

    Array(10).fill().forEach(createSphere)

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight-80);
    document.getElementById('canvas').appendChild( renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight-80);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.getElementById('canvas').appendChild( labelRenderer.domElement );


    const controls = new OrbitControls( camera, labelRenderer.domElement );
    controls.minDistance = 5;
    controls.maxDistance = 100;

    //

    window.addEventListener( 'resize', onWindowResize );
    
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight -80);

    labelRenderer.setSize( window.innerWidth, window.innerHeight -80);

}

function createSphere(){
    //create new sphere
    const geometry = new THREE.SphereGeometry( 0.5, 20, 24);
    const material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
    sphere = new THREE.Mesh( geometry, material );
    const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    sphere.position.set(x,y,z);
    scene.add(sphere)
    //text for Sphere
    const sphereDiv = document.createElement( 'div' );
    sphereDiv.className = 'label';
    sphereDiv.textContent = 'Sphere';
    sphereDiv.style.marginTop = '-1em';
    const sphereLabel = new CSS2DObject( sphereDiv );
    sphereLabel.position.set( 0, SPHERE_RADIUS, 0 );
    sphere.add( sphereLabel );
    spheres.push(sphere);
}


function animate() {

    requestAnimationFrame( animate );

    const elapsed = clock.getElapsedTime();

    // spheres.forEach(function(item, index, array) {
    //     item.position.y += 0.05
    // })

    torus.rotation.x += 0.01;
    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );

}
        }
    }
}

</script>

<style>
canvas{
    position: fixed;
    top: 0;
    left: 0;
}

.label {
    color: #FFF;
    font-family: sans-serif;
    padding: 2px;
    background: rgba( 0, 0, 0, .6 );
}

#container {
    position: relative;
  }
  #container canvas, #overlay {
    position: absolute;
  }
  canvas {
    border: 1px solid black;
  }

.footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #212121;
    color: white;
    text-align: center;
}


</style>