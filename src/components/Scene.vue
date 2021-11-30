<template>
    <div>
        <div id="canvas" >

        </div>
        <div class="footer footer-image" id="footer">
        <nav class="container-fluid" style="height:80px; z-index:3000;">
            <v-row>
                <v-col cols="auto">
                    <br>
                    <a class="navbar-brand" href="#">Day {{currentDay}}/{{max}}</a>
                </v-col>
                <v-col cols="cols-6">
                    <br>
                    <v-slider v-model="currentDay" class="align-center" :min="min" thumb-label v-bind:max="max"></v-slider>
                </v-col>
                <v-col cols="auto">
                    <br>
                    <v-dialog
                        transition="dialog-top-transition"
                        max-width="450"
                        >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                color="primary"
                                v-bind="attrs"
                                v-on="on"
                                small
                            >Menu</v-btn>
                        </template>
                        <template v-slot:default="dialog">
                            <v-card>
                                <v-toolbar
                                color="primary"
                                dark
                                >
                                <v-card-title>
                                    Menu
                                </v-card-title>
                                </v-toolbar>
                                <v-card-text>
                                    <v-row>
                                        <v-col>
                                            <v-list-item v-on:click.stop>
                                            <v-switch @change="changeLabels = !changeLabels"></v-switch>
                                            <v-list-item-title>Labels</v-list-item-title>
                                            </v-list-item>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="cols-2">
                                            <v-list-item v-on:click.stop>
                                            <v-switch v-model="autoPlay"></v-switch>
                                            <v-list-item-title>Auto Play</v-list-item-title>
                                            </v-list-item>
                                        </v-col>
                                        <v-col cols="cols-10">
                                            <br>
                                            <v-slider v-model="autoPlayInterval" class="align-center" :min="0.1" :step="0.1" thumb-label v-bind:max="3"></v-slider>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                                <v-card-actions class="justify-end">
                                <v-btn
                                    text
                                    @click="dialog.value = false"
                                >Close</v-btn>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </v-dialog>
                </v-col> 
                <v-col cols="auto">
                    <br>

                    <v-menu
                        top
                        offset-y
                        >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                            color="primary"
                            dark
                            v-bind="attrs"
                            v-on="on"
                            small
                            >
                            Parameters
                            </v-btn>
                        </template>

                        <v-list>
                            <v-list-item 
                            v-for="(item,index) in selectedFields"
                            :key="index"
                            v-on:click.stop
                            >
                                <v-switch
                                :label="item"
                                color="primary"
                                :input-value="selectedFieldsValues[index]"
                                :disabled="selectedFieldsValues[index] == true && selectedFieldsValuesTrueCount <= 3 ? true : false"
                                @change="handleParameterSwitch(index)"
                                ></v-switch>
                            </v-list-item>
                            <v-btn text>
                                Cancel
                            </v-btn>
                        </v-list>
                    </v-menu>
                </v-col>
            </v-row>
        </nav>
      </div>
    <div id="info" v-if="info_box">
        <v-card
        class="mx-auto"
        color="primary"
        dark
        max-width="400"
        
    >

        <v-row>
            <v-col align="end" style="padding-top:0;padding-bottom:0;">
                <v-btn @click="info_box = !info_box" x-small>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-col>
        </v-row>

        <v-card-text class="font-weight-bold" style="font-size:12px; padding-bottom:0; padding-left:0;">
        <v-col style="padding:0;">
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
import * as math from 'mathjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import OrientationGizmo from "../assets/OrientationGizmo.js";
export default {
    props:{
        selectedFields: Array,
        selectedName: Array,
        json: Array,
        original_json: Array
    },
    data()  {
        return{
            new_json: [],
            object_info: {
                
            },
            info_box: false,
            //max slider value
            max: 1,
            //min slider value
            min: 1,
            autoPlay: false,
            autoPlayInterval: 1,
            currentDay: 1,
            lastInfoIndex: 1,
            CheckForUpdate: false,
            xMenu: false,
            yMenu: false,
            zMenu: false,
            xAxis: 0,
            yAxis: 1,
            zAxis: 2,
            changeLabels: false,
            selectedFieldsValues: [true,true,true,false,false,false],
            selectedFieldsValuesTrueCount: 3,
            //Matrix that we get from initial algorythm that we later can reuse for recalculating coordinates when changing parameters
            new_f: [],
            //object coordinates
            coordinates: [],
        }
    },
    mounted(){
        this.initialize()
    },
    methods:{
        handleParameterSwitch: function(index){
            let newSelectedFields = [];
            this.selectedFieldsValues[index] = !this.selectedFieldsValues[index];
            let counter = 0;
            this.selectedFieldsValues.forEach((item,index) => {
                if(item == true){
                    counter++;
                    newSelectedFields.push(this.selectedFields[index]);
                }
            })
            this.selectedFieldsValuesTrueCount = counter;
            for (var object in this.coordinates) delete this.coordinates[object];
            this.json.forEach((item,index) => {
                this.coordinates[index] = this.algorythm(item,newSelectedFields)
            })
            //set the positions
            this.CheckForUpdate = true;

        },
        xAxisChange: function(parameter){
            this.xAxis = parameter;
            this.CheckForUpdate = true;
        },
        yAxisChange: function(parameter){
            this.yAxis = parameter;
            this.CheckForUpdate = true;
        },
        zAxisChange: function(parameter){
            this.zAxis = parameter;
            this.CheckForUpdate = true;
        },
        algorythm: function(json,selectedFields){
            var temp_json = [
            ]
            //optimize this later
            json.forEach((key,item) => {
                var new_object = {
                    name: "",
                    fields: []
                };
                selectedFields.forEach((item) => {
                    new_object.fields.push(key[item])
                    new_object.name = key[this.selectedName[0]]
                })
                temp_json.push(new_object);
            })
            //standartization
            let values = [];
            let mean = [];
            let std = [];
            //getting mean and std
            selectedFields.forEach((item, key) => {
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
                for(let i = 0; i<selectedFields.length; i++){
                    temp.push((item.fields[i]-mean[i])/std[i]);
                }
                new_f.push(temp);
            })
            this.new_f = new_f;
            return this.coverianceMatrix(new_f,selectedFields);
        },
        coverianceMatrix: function(new_f,selectedFields){
            let new_values= [];
                let new_mean = [];
                let new_std = [];
                //geting mean and std
                selectedFields.forEach((item, key) => {
                    new_values.push([])
                    new_f.forEach((obj, index) => {
                        new_values[key][index] = new_f[index][key];
                    })
                    new_mean[key] = math.mean(new_values[key]);
                    new_std[key] = math.std(new_values[key]);
                })
                //covariation
                var covariance_matrix = [];
                for(let i = 0;i < selectedFields.length;i++)
                {
                    covariance_matrix[i] = new Array(selectedFields.length);
                    for(let j = 0; j < selectedFields.length; j++){
                        let temp = 0;
                        for(let g = 0; g < new_f.length; g++){
                            temp += (new_f[g][i] - new_mean[i]) * (new_f[g][j] - new_mean[j]);
                        }
                        covariance_matrix[i][j] = temp/selectedFields.length;
                    }
                }
                //Eigenvectors
                var temp = math.eigs(covariance_matrix);
                temp = temp.vectors;
                var data = math.multiply(new_f, math.transpose(temp));
                console.log(covariance_matrix)
                return data;

        },
        initialize: function(){
            //Variables
            let camera, scene, renderer, labelRenderer, orientationGizmo, controls;
            let vue = this;
            let last_id, RequiredTimePassed = Date.now();
            var spheres = [];
            var json = this.json;
            const SPHERE_RADIUS = 0.27;
            let sphere;
            let previousDay = 1;
            let previousSphere;
            let lastLabels = false;
            let mouseUp = false;
            let autoPlayTime = 0;
            //==========================================================================
            const clock = new THREE.Clock();
            const textureLoader = new THREE.TextureLoader();
            const mouse = new THREE.Vector2();
            var quaternion = new THREE.Quaternion;

            //get selected fields
            let newSelectedFields = [];
            this.selectedFieldsValues.forEach((item,index) => {
                if(item == true)
                    newSelectedFields.push(this.selectedFields[index]);
            })
            this.json.forEach(Day => {
                this.coordinates.push(this.algorythm(Day,newSelectedFields))
            })
            //set range max length
            this.max = this.json.length;
            //setting first object for labels
            var jsonLabels = this.json[0];
            init();
            animate();

            function init() {
                let canvas = document.getElementById("canvas");
                camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 200 );
                camera.position.set( 10, 5, 20 );


                scene = new THREE.Scene();
                scene.background = new THREE.Color(0x323A44)
                

                //oriantation gizmo
                orientationGizmo = new OrientationGizmo(camera, { size: 100, padding: 8 });
                document.body.appendChild(orientationGizmo);

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
                vue.coordinates[0].forEach(item => {
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

                controls = new OrbitControls( camera, renderer.domElement );
                controls.minDistance = 1;
                controls.maxDistance = 50;
                controls.enablePan = false;
                controls.enableDamping = true;
				controls.dampingFactor = 0.5;

                const controls2 = new OrbitControls( camera, labelRenderer.domElement );
                controls2.minDistance = 1;
                controls2.maxDistance = 50;



                window.addEventListener( 'resize', onWindowResize );
                
            }


            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;

                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight);

                labelRenderer.setSize( window.innerWidth, window.innerHeight );

            }

            function mouseClick(event){
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight) * 2 + 1;
            }



            function setNewInfo(index){
                vue.object_info = vue.original_json[vue.currentDay-1][index]
            }


            function createSphere(x,y,z,index){
                //create new sphere
                const geometry = new THREE.SphereGeometry( 0.05, 15, 20);
                const material = new THREE.MeshPhongMaterial( { color: 0xFF6347 } );
                sphere = new THREE.Mesh( geometry, material );
                //const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100))
                sphere.position.set(x,y,z);
                sphere.receiveShadow = true;
                scene.add(sphere)
                //text for Sphere
                spheres.push(sphere);
            }

            function addLabel(sphere, index){
                //add color
                sphere.material.color.set( 0x7f0000 );
                //
                const sphereDiv = document.createElement( 'div' );
                sphereDiv.className = 'label';
                sphereDiv.textContent = jsonLabels[index]['Country_Region'];
                sphereDiv.style.marginTop = '-1em';
                const sphereLabel = new CSS2DObject( sphereDiv );
                sphereLabel.position.set( 0, SPHERE_RADIUS-0.2, 0 );
                sphere.add( sphereLabel);
            }

            function animate() {
                const d = new Date();
                if(vue.autoPlay == true && d.getTime()-autoPlayTime>vue.autoPlayInterval*1000){
                    if(vue.currentDay == vue.max)
                        vue.currentDay = 1;
                    else
                        vue.currentDay++;
                    autoPlayTime = d.getTime();
                }

                orientationGizmo.update();
                canvas.addEventListener( 'mouseup', function(){mouseUp = true})
                if(mouseUp){
                    canvas.addEventListener( 'click', mouseClick, false);
                    mouseUp = false;
                    //anti spam
                    let raycaster = new THREE.Raycaster()
                    raycaster.setFromCamera( mouse, camera );
                    var intersects = raycaster.intersectObjects( scene.children );    
                    //if any objects were clicked
                    if(intersects.length > 0){
                        vue.info_box = true;
                        //go through all spheres find the one that matches first hit target
                        spheres.forEach((object, key) => {
                            if(intersects[0].object == object)
                            {
                                if(!vue.changeLabels){
                                    if(previousSphere){
                                        previousSphere.remove(previousSphere.children[0])
                                        previousSphere.material.color.set( 0xFF6347 );
                                    }
                                    addLabel(object,key);
                                }
                                vue.lastInfoIndex = key;
                                //setting new info box
                                setNewInfo(key);
                                //add label to object

                                previousSphere = object;
                                RequiredTimePassed = Date.now();
                            }
                        })
                    }
                }
                

                if( vue.currentDay != previousDay || vue.CheckForUpdate == true){
                    changeDay(vue.currentDay)
                    previousDay = vue.currentDay;
                    vue.CheckForUpdate = false;
                }

                if(vue.changeLabels != lastLabels){
                    if(vue.changeLabels == true){
                        if(previousSphere){
                            //remove single clickable label if it exists
                            previousSphere.remove(previousSphere.children[0])
                            previousSphere.material.color.set( 0xFF6347 );
                        }
                        spheres.forEach((sphere,key,array) => {
                            const sphereDiv = document.createElement( 'div' );
                            sphereDiv.className = 'label';
                            sphereDiv.textContent = jsonLabels[key]['Country_Region'];
                            sphereDiv.style.marginTop = '-1em';
                            const sphereLabel = new CSS2DObject( sphereDiv );
                            sphereLabel.position.set( 0, SPHERE_RADIUS-0.2, 0 );
                            array[key].add(sphereLabel);
                        })
                        lastLabels = vue.changeLabels;
                    }
                    else{
                        spheres.forEach((sphere,key,array) => {
                            array[key].remove(array[key].children[0]);
                        })
                        if(previousSphere){
                            //remove single clickable label if it exists
                            previousSphere.remove(previousSphere.children[0])
                            previousSphere.material.color.set( 0xFF6347 );
                        }
                        lastLabels = vue.changeLabels;
                    }
                }
                renderer.render( scene, camera );
                labelRenderer.render( scene, camera );
                requestAnimationFrame( animate );

            }


            function changeDay(index){
                spheres.forEach((sphere,key,array) =>{
                    array[key].position.set(vue.coordinates[index-1][key][vue.xAxis],vue.coordinates[index-1][key][vue.yAxis],vue.coordinates[index-1][key][vue.zAxis])
                })
                setNewInfo(vue.lastInfoIndex)
            }
        }
    }
}

</script>

<style>
orientation-gizmo:hover {
    background: rgba(255, 255, 255, .2);
    border-radius: 100%;
    cursor: pointer;
}
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
    right:0;
}
.btn-primary{
    margin-left:5px;
}


</style>
