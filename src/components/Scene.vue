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
                    <input v-model="currentDay" type="range" class="form-range" min="1" v-bind:max="max"  id="customRange2" @change="changeDay">
                </div>
                <div class="col">
                    <br>
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-import-modal-lg" style="background: transparent;">Menu</button>
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target=".bd-subject-modal-lg" style="background: transparent;">Subjects</button>  
                </div>
            </div>
        </nav>
      </div>
    <div id="info" v-if="info_box">
        <v-card
        class="mx-auto"
        color="#000a12"
        dark
        max-width="400"
        
    >
        <v-card-title>
        <v-row>
            <v-col align="end">
                <v-btn @click="info_box = !info_box">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        </v-card-title>

        <v-card-text class="font-weight-bold" style="font-size:12px;">
        <v-col>
            <ul id="example-1">
                <li v-for="(item, index) in object_info" :key="item['Conmbined_Key']">
                    {{ index }}: {{item}}
                </li>
            </ul>
        </v-col>
        </v-card-text>

    </v-card>
        </div>
    </div>
</template>


<script>
import * as TWEEN from '@tweenjs/tween.js';
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
            object_info: {
                
            },
            info_box: false,
            max: '',
            currentDay: 1,
        }
    },
    mounted(){
        this.initialize()
    },
    methods:{
        changeDay: function(){
            console.log(this.currentDay);
        },
        initialize: function(){
            let camera, scene, renderer, labelRenderer;
            let vue = this;
            let last_id, RequiredTimePassed = 0;
            var spheres = [];
            var json = this.json;
            const SPHERE_RADIUS = 0.27;
            const clock = new THREE.Clock();
            const textureLoader = new THREE.TextureLoader();
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            let sphere;
            let previousDay = 1;

            var coordinates = [];
            this.json.forEach(item => {
                coordinates.push(algorythm(item))
            })
            //set range max length
            this.max = this.json.length;
            //setting first object for labels
            var jsonLabels = this.json[0];
            /////////////////Algorythm////////////////////
            function algorythm(json){
                var temp_json = [
                ]
                //optimize this later
                json.forEach((key,item) => {
                    var new_object = {
                        name: "",
                        fields: []
                    };
                        vue.selectedFields.forEach((item) => {
                            new_object.fields.push(key[item])
                            new_object.name = key[vue.selectedName[0]]
                        })
                    temp_json.push(new_object);
                })
                //standartization
                let values = [];
                let mean = [];
                let std = [];
                //getting mean and std
                vue.selectedFields.forEach((item, key) => {
                    values.push([])
                    temp_json.forEach((obj, index) => {
                        values[key][index] = temp_json[index]['fields'][key];
                    })
                    mean[key] = math.mean(values[key]);
                    std[key] = math.std(values[key]);
                })

                var new_f = [];
                temp_json.forEach(item => {
                    var temp = [];
                    for(let i = 0; i<vue.selectedFields.length; i++){
                        temp.push((item.fields[i]-mean[i])/std[i]);
                    }
                    new_f.push(temp);
                })
                let new_values= [];
                let new_mean = [];
                let new_std = [];
                //geting mean and std
                vue.selectedFields.forEach((item, key) => {
                    new_values.push([])
                    new_f.forEach((obj, index) => {
                        new_values[key][index] = new_f[index][key];
                    })
                    new_mean[key] = math.mean(new_values[key]);
                    new_std[key] = math.std(new_values[key]);
                })
                //covariation
                var covariance_matrix = [];
                for(let i = 0;i < vue.selectedFields.length;i++)
                {
                    covariance_matrix[i] = new Array(vue.selectedFields.length);
                    for(let j = 0; j < vue.selectedFields.length; j++){
                        let temp = 0;
                        for(let g = 0; g < new_f.length; g++){
                            temp += (new_f[g][i] - new_mean[i]) * (new_f[g][j] - new_mean[j]);
                        }
                        covariance_matrix[i][j] = temp/vue.selectedFields.length;
                    }
                }
                var temp = math.eigs(covariance_matrix);
                temp = temp.vectors;
                var data = math.multiply(new_f, math.transpose(temp));
                return data;
            }
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
                scene.add(lightHelper);


                //


                //Array(50).fill().forEach(createSphere)

                let counter = 0;
                coordinates[0].forEach(item => {
                    createSphere(item[0], item[1], item[2], counter)
                    counter++;
                })
                renderer = new THREE.WebGLRenderer();
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight);
                document.getElementById('canvas').appendChild( renderer.domElement);

                labelRenderer = new CSS2DRenderer();
                labelRenderer.setSize( window.innerWidth, window.innerHeight);
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

                renderer.setSize( window.innerWidth, window.innerHeight);

                labelRenderer.setSize( window.innerWidth, window.innerHeight );

            }

            function onMouseMove( event ) {

                // calculate mouse position in normalized device coordinates
                // (-1 to +1) for both components

                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight) * 2 + 1;

            }

            function setNewInfo(index){
                vue.object_info = vue.json[0][index]
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
                sphereDiv.textContent = jsonLabels[index]['Country_Region'];
                sphereDiv.style.marginTop = '-1em';
                const sphereLabel = new CSS2DObject( sphereDiv );
                sphereLabel.position.set( 0, SPHERE_RADIUS-0.2, 0 );
                sphere.add( sphereLabel );
                spheres.push(sphere);
            }


            function animate() {
                const elapsed = clock.getElapsedTime();
                raycaster.setFromCamera( mouse, camera );
                // calculate objects intersecting the picking ray
                const intersects = raycaster.intersectObjects( scene.children );
                if(intersects.length > 0){
                        intersects[ 0 ].object.material.color.set( 0xd5eb34 );
                        vue.info_box = true;
                        let keys_list = [];
                        spheres.forEach((object, key) => {
                            let tempTime =  (new Date().getTime() / 1000) - RequiredTimePassed;
                            
                            if(intersects[0].object == object && last_id != key && !keys_list.includes(key) && tempTime >= 1)
                            {
                                setNewInfo(key);
                                last_id = key;
                                keys_list.push(key);
                                RequiredTimePassed = new Date().getTime() / 1000;
                            }
                        })
                }


                requestAnimationFrame( animate );
                window.addEventListener( 'click', onMouseMove, true);

                if( vue.currentDay != previousDay){
                    changeDay(vue.currentDay)
                    previousDay = vue.currentDay;
                }

                // spheres.forEach(function(item, index, array) {
                //     item.position.y += 0.05
                // })
                renderer.render( scene, camera );
                labelRenderer.render( scene, camera );

            }

            function changeDay(index){
                spheres.forEach((sphere,key,array) =>{
                    array[key].position.set(coordinates[index-1][key][0],coordinates[index-1][key][1],coordinates[index-1][key][2])
;
                })
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
    z-index: 2000;
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
    background: transparent;
    color: white;
    text-align: center;
}

#info{
    z-index: 3000;
    color: white;
    position:absolute;
    top:0;
}
.btn-primary{
    margin-left:5px;
}


</style>