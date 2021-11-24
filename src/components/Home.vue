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
                <v-row>
                    <v-col cols="4" >
                        <v-btn
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
                    </v-col>

                    <v-col cols="8" align="end">
                        <v-btn elevation="2" v-on:click="handleDemo()">
                            Demo version
                        </v-btn>
                    </v-col>

                </v-row>



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
            :json="json"
            :original_json="original_json"
        />
    </v-row>
</template>


<script>
import * as math from 'mathjs'
import Canvas from './Scene.vue';
import { forEach } from 'mathjs';

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
        json: [],
        original_json: [],
        files: [],
        loader: null,
        loading4: false,
      }
    },
    methods:{
        handleDemo(){
            //adding parameters
            this.selectedFields.push('Confirmed');
            this.selectedFields.push('Active');
            this.selectedFields.push('Deaths');
            this.selectedFields.push('Recovered');

            //add a name parameter
            this.selectedName.push('Country_Region');

            let vue = this;
            this.json.push(require('../assets/corona1.json'))
            this.json.push(require('../assets/corona2.json'))
            this.json.push(require('../assets/corona3.json'))
            //filter
            this.json.forEach(function(item,index,array) {
                array[index] = vue.filterData(item)
            })
            this.original_json = JSON.parse(JSON.stringify(this.json))
            //normalize
            this.json.forEach(function(item,index,array) {
                array[index] = vue.normalizeData(item)
            })

            //adding two new parameters which didnt need normalization
            this.selectedFields.push('Incident_Rate');
            this.selectedFields.push('Case_Fatality_Ratio');
            //activate Canvas
            this.showCanvas = true;
        },
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
        normalizeData(json){
            var pop_json = require('../assets/country-by-population.json')
            var f =  [];
            let vue = this;
            json.forEach((obj,key) => {
                f.push([]);
                for(let i = 0; i<this.selectedFields.length;i++){
                    pop_json.filter(country => {
                        if(obj['Country_Region'] == country.country){
                            f[key].push(obj[this.selectedFields[i]]/country.population);
                        }
                    })
                }
            })
            //Normalize data
            //min range
            //let a = 0
            //max range
            //let b = 1
            //get populations of all countries
            // for(let i = 0; i<this.selectedFields.length;i++){
            //     let max = math.max(values[i][this.selectedFields[i]])
            //     let min = math.min(values[i][this.selectedFields[i]])
            //     values[i][this.selectedFields[i]].forEach(function(value, key, array){
            //         array[key] = a+(((value-min)*(b-a))/(max-min))
            // })
            // }
            json.forEach(function(obj,key,array){
                vue.selectedFields.forEach((item,index) => {
                    array[key][item] = f[key][index];
                })
            })
            return json;
        },
        filterData(json){
            var temp_json = [];
            var list = [];
            //Continents which have 0 covid data or are incompatible with country population json file
            list.push("Kiribati");
            list.push("Palau");
            list.push("Summer Olympics 2020");
            list.push("Burma");
            list.push("Cabo Verde");
            list.push("Congo (Brazzaville)");
            list.push("Congo (Kinshasa)");
            list.push("Cote d'Ivoire");
            list.push("Czechia");
            list.push("Diamond Princess");
            list.push("Eswatini");
            list.push("Fiji");
            list.push("Holy See");
            list.push("Korea, South");
            list.push("Kosovo");
            list.push("Libya");
            list.push("MS Zaandam");
            list.push("Taiwan*");
            list.push("Timor-Leste");
            list.push("West Bank and Gaza");
            list.push("Tonga")

            let obj_amount = [];
            json.forEach((item,index,Array) => {
                if(!list.includes(item.Country_Region) && !list.includes(item.Province_State)){
                    let country_exists = false;
                    temp_json.forEach((country,key,array) => {
                        if(country.Country_Region == item.Country_Region) {                     
                            array[key]['Confirmed'] += item.Confirmed;
                            array[key]['Deaths'] += item.Deaths;
                            array[key]['Recovered'] += item.Recovered;
                            array[key]['Active'] += item.Active;
                            array[key]['Incident_Rate'] += math.round(item.Incident_Rate);
                            array[key]['Case_Fatality_Ratio'] += math.round(item.Case_Fatality_Ratio);
                            obj_amount.forEach((obj,key,array) => {
                                if(obj.Country_Region == country.Country_Region){
                                    array[key]['Amount']++;
                                }
                                    
                            })
                            country_exists = true;
                        }
                    })
                    if(!country_exists){
                        temp_json.push(item)
                        obj_amount.push({
                            Country_Region: item.Country_Region,
                            Amount: 1
                        })
                    }

                    //temp_json.push(item)
                }
            })

            temp_json.forEach((obj,key,array) => {
                obj_amount.forEach(item => {
                    if(item.Country_Region == obj.Country_Region){
                        array[key]['Incident_Rate'] /= item.Amount;
                        array[key]['Case_Fatality_Ratio'] /= item.Amount;
                    }
                                    
                })
            })

            return temp_json;
        },
        handleSubmit(){
            //filtering json by name to get rid of duplicates (too many records)
            //this.showCanvas = true;
        }

    }
  }
</script>


<style>
  
</style>