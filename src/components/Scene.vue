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
import * as PCA from 'pca-js';
import * as math from 'mathjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
export default {
    props:{
        selectedFields: Array,
        selectedName: Array,
        json: Array,
    },
    data()  {
        return{
            new_json: [],
        }
    },
    mounted(){
        this.initialize()
    },
    methods:{
        initialize: function(){

let camera, scene, renderer, labelRenderer;
var spheres = [];
const SPHERE_RADIUS = 0.27;

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let sphere;


/////////////////Algorythm////////////////////

var temp_json = [
]
//optimize this later
this.json.forEach((key,item) => {
   var new_object = {
       name: "",
       fields: []
   };
   this.selectedFields.forEach((item) => {
       new_object.fields.push(key[item])
       new_object.name = key[this.selectedName[0]]
   })
   temp_json.push(new_object);
})

let mean = [];
let std = [];
var new_f = [];
temp_json.forEach(item => {
    mean.push(math.mean(item.fields));
    std.push(math.std(item.fields));
    var temp = [];
    for(let i = 0; i<this.selectedFields.length; i++){
        temp.push((item.fields[i]-math.mean(item.fields))/math.std(item.fields));
    }
    new_f.push(temp);
})
const arr2D = new_f.values('fields');
console.log(arr2D)
var covariance_matrix = [];

for(let i = 0;i < new_f.length;i++)
{
    covariance_matrix[i] = new Array(new_f.length);
    let imean = math.mean(new_f[i])
    for(let j = 0; j < new_f.length; j++){
        let temp = 0;
        let jmean = math.mean(new_f[j])
        for(let g = 0; g < this.selectedFields.length; g++){
            temp += (new_f[i][g] - imean) * (new_f[j][g] - jmean);
        }
        covariance_matrix[i][j] = temp/this.selectedFields.length;
    }
}
var temp = math.eigs(covariance_matrix);
temp = temp.vectors;
//console.log(new_f)

var data = [[40,50,60],[50,70,60],[80,70,90],[50,60,80]];
var vectors = PCA.getEigenVectors(data);
console.log(vectors)
var data = math.multiply(temp,new_f);

//console.log(data)
/////////////////Algorythm///////////////////

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


    //

    //Array(50).fill().forEach(createSphere)

    let counter = 0;
    data.forEach(item => {
        createSphere(item[0], item[1], item[2], counter)
        counter++;
    })
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
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.autoRotate = true;
    //

    window.addEventListener( 'resize', onWindowResize );
    
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight -80);

    labelRenderer.setSize( window.innerWidth, window.innerHeight -80);

}


function createSphere(x,y,z,index){
    //create new sphere
    const geometry = new THREE.SphereGeometry( 0.05, 10, 16);
    const material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
    sphere = new THREE.Mesh( geometry, material );
    //const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))
    sphere.position.set(x,y,z);
    scene.add(sphere)
    //text for Sphere
    const sphereDiv = document.createElement( 'div' );
    sphereDiv.className = 'label';
    sphereDiv.textContent = temp_json[index]['name'];
    sphereDiv.style.marginTop = '-1em';
    const sphereLabel = new CSS2DObject( sphereDiv );
    sphereLabel.position.set( 0, SPHERE_RADIUS-0.2, 0 );
    sphere.add( sphereLabel );
    spheres.push(sphere);
}


function animate() {

    requestAnimationFrame( animate );

    const elapsed = clock.getElapsedTime();

    // spheres.forEach(function(item, index, array) {
    //     item.position.y += 0.05
    // })
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