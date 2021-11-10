<template>
    <v-row >
        <v-col
        cols="12"
        sm="6"
        offset-sm="3"
        >
        <v-card height="200px" style="padding-bottom:10px;" v-if="!showFields"> 
            <v-card-title>
            <span class="text-h4">Menu</span>
                
            <v-spacer></v-spacer>

            <v-menu
                bottom
                left
            >
            </v-menu>
            </v-card-title>
            
            <v-card-text>
                <v-file-input
                    v-model="files"
                    accept="application/json"
                    truncate-length="15"
                    show-size
                    counter
                    chips
                    multiple
                    label="Select json files"
                    prepend-icon="mdi-paperclip"
                ></v-file-input>
                <v-btn
                class="ma-2"
                :loading="loading4"
                :disabled="loading4"
                color="info"
                v-on:click="handleNext()"
            >
                Next
                <template v-slot:loader>
                    <span class="custom-loader">
                        <v-icon light>mdi-cached</v-icon>
                    </span>
                </template>
            </v-btn>
            </v-card-text>
            
        </v-card>

        <v-card v-if="showFields">
           <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-combobox
          v-model="selectedFields"
          :items="jsonFields"
          label="Selected fields are for clustering algorythm"
          multiple
          outlined
          dense
        ></v-combobox>
        <v-combobox
          v-model="selectedName"
          :items="jsonFields"
          label="Selected field should identify a record (name)"
          multiple
          outlined
          dense
        >
        </v-combobox>
        <v-btn
                class="ma-2"
                :loading="loading4"
                :disabled="loading4"
                color="info"
                v-on:click="handleSubmit()"
            >
                Submit
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
        </v-card>
        </v-col>
        <Canvas v-if="showCanvas"
            :selectedFields="selectedFields"
            :selectedName="selectedName"
            :json="new_json"
        />
    </v-row>
</template>


<script>
import Canvas from './Scene.vue';

  export default {
    components:{
        Canvas
    },
    data () {
      return {
        selectedFields: [],
        selectedName: [],
        jsonFields: [],
        showFields: false,
        showCanvas: false,
        json: '',
        new_json: [],
        files: [],
        loader: null,
        loading4: false,
      }
    },
    methods:{
        handleNext() {
            var counter = 0;    
            //assigning vue component so i can use it in reader.onload (this is overriden)
            let vue = this;
            this.files.forEach(function(item){
                var reader = new FileReader();
                // Use the javascript reader object to load the contents
                // of the file in the v-model prop
                reader.onload = function(e) {
                    vue.json = e.target.result
                    var result = JSON.parse(vue.json)
                    var temp = Array();
                    for(var index in result[0]){
                        temp.push(index);
                    }
                    vue.jsonFields = [...temp];
                    vue.showFields = true;

                }
                reader.readAsText(item);
            })
        },
        filterByName(){
            this.temp_json = JSON.parse(this.json)
            var list = [];
            //Continents which have 0 covid data
            list.push("Kiribati");
            list.push("Palau");
            list.push("Summer Olympics 2020");
            this.temp_json.forEach(item => {
                if(!list.includes(item.Country_Region)){
                    list.push(item.Country_Region)
                    this.new_json.push(item)
                }
            })
        },
        handleSubmit(){
            //filtering json by name to get rid of duplicates (too many records)
            this.filterByName()
            this.showCanvas = true;
        }

    }
  }
</script>


<style>
  
</style>