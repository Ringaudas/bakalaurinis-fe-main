<template>
    <v-row>
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
                @click="loading = true"
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
            :max_values="max_values"
            :min_values="min_values"
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
        max_values: [],
        min_values: [],
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
            this.json.push(require('../assets/2021-01-01.json'))
            this.json.push(require('../assets/2021-01-02.json'))
            this.json.push(require('../assets/2021-01-03.json'))
            this.json.push(require('../assets/2021-01-04.json'))
            this.json.push(require('../assets/2021-01-05.json'))
            this.json.push(require('../assets/2021-01-06.json'))
            this.json.push(require('../assets/2021-01-07.json'))
            this.json.push(require('../assets/2021-01-08.json'))
            this.json.push(require('../assets/2021-01-09.json'))
            this.json.push(require('../assets/2021-01-10.json'))
            this.json.push(require('../assets/2021-01-11.json'))
            this.json.push(require('../assets/2021-01-12.json'))
            this.json.push(require('../assets/2021-01-13.json'))
            this.json.push(require('../assets/2021-01-14.json'))
            this.json.push(require('../assets/2021-01-15.json'))
            this.json.push(require('../assets/2021-01-16.json'))
            this.json.push(require('../assets/2021-01-17.json'))
            this.json.push(require('../assets/2021-01-18.json'))
            this.json.push(require('../assets/2021-01-19.json'))
            this.json.push(require('../assets/2021-01-20.json'))
            this.json.push(require('../assets/2021-01-21.json'))
            this.json.push(require('../assets/2021-01-22.json'))
            this.json.push(require('../assets/2021-01-23.json'))
            this.json.push(require('../assets/2021-01-24.json'))
            this.json.push(require('../assets/2021-01-25.json'))
            this.json.push(require('../assets/2021-01-26.json'))
            this.json.push(require('../assets/2021-01-27.json'))
            this.json.push(require('../assets/2021-01-28.json'))
            this.json.push(require('../assets/2021-01-29.json'))
            this.json.push(require('../assets/2021-01-30.json'))
            this.json.push(require('../assets/2021-01-31.json'))
            //filter
            this.json.forEach(function(item,index,array) {
                array[index] = vue.filterData(item, index)
            })
            this.original_json = JSON.parse(JSON.stringify(this.json))
            this.originalJsonRework();
            //normalize
            this.json.forEach(function(item,index,array) {
                array[index] = vue.normalizeData(item,index)
            })

            //adding two new parameters which didnt need normalization
            this.selectedFields.push('Incident_Rate');
            this.selectedFields.push('Case_Fatality_Ratio');
            //activate Canvas

            this.showCanvas = true;
        },
        originalJsonRework(){
            //getting rid of unneccesary fields
            this.original_json.forEach((item,key,array) => {
                array[key].forEach((country,index,arr) => {
                    delete arr[index]['FIPS'];
                    delete arr[index]['Admin2'];
                    delete arr[index]['Province_State'];
                    delete arr[index]['Last_Update'];
                    delete arr[index]['Lat'];
                    delete arr[index]['Long_'];
                })
            })
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
        normalizeData(json,n){
            var pop_json = require('../assets/country-by-population.json')
            let vue = this;
            var f =  [];
            json.forEach((obj,key) => {
                f.push([]);
                for(let i = 0; i<this.selectedFields.length;i++){
                    pop_json.filter(country => {
                        if(obj['Country_Region'] == country.country){
                            f[key].push((obj[this.selectedFields[i]]/country.population)*100000);
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
            this.max_values[n] = new Array(6).fill(0);
            this.min_values[n] = new Array(6).fill(100);
            json.forEach(function(obj,key,array){
                vue.selectedFields.forEach((item,index) => {
                    array[key][item] = f[key][index];
                })
                //setting max values for normalization formula)
                if(obj.Confirmed > vue.max_values[n][0])
                    vue.max_values[n][0] = obj.Confirmed;
                if(obj.Deaths > vue.max_values[n][1])
                    vue.max_values[n][1] = obj.Deaths;
                if(obj.Recovered > vue.max_values[n][2])
                    vue.max_values[n][2] = obj.Recovered;
                if(obj.Active > vue.max_values[n][3])
                    vue.max_values[n][3] = obj.Active;
                if(obj.Incident_Rate > vue.max_values[n][4])
                    vue.max_values[n][4] = obj.Incident_Rate;
                if(obj.Case_Fatality_Ratio > vue.max_values[n][5])
                    vue.max_values[n][5] = obj.Case_Fatality_Ratio;
                //

                //setting min values for normalization formula
                if(obj.Confirmed < vue.min_values[n][0])
                    vue.min_values[n][0] = obj.Confirmed;
                if(obj.Deaths < vue.min_values[n][1])
                    vue.min_values[n][1] = obj.Deaths;
                if(obj.Recovered < vue.min_values[n][2])
                    vue.min_values[n][2] = obj.Recovered;
                if(obj.Active < vue.min_values[n][3])
                    vue.min_values[n][3] = obj.Active;
                if(obj.Incident_Rate < vue.min_values[n][4])
                    vue.min_values[n][4] = obj.Incident_Rate;
                if(obj.Case_Fatality_Ratio < vue.min_values[n][5])
                    vue.min_values[n][5] = obj.Case_Fatality_Ratio;
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
            list.push("Grand Princess");
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
            list.push("Micronesia")
            list.push("Unknown")
            let obj_amount = [];
            json.forEach((item,index,Array) => {
                if(!list.includes(item.Country_Region) && !list.includes(item.Province_State)){
                    let country_exists = false;
                    temp_json.forEach((country,key,array) => {
                        if(country.Country_Region === item.Country_Region) {       
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
        filterUploadedData(json){
            var new_json = [];
            json.forEach((item,index,array) => {
                var temp_obj = {};
                var correctObject = true;
                Object.keys(item).forEach((key,number) => {
                    if(!item[key] && this.selectedFields.includes(key)){
                        correctObject = false;
                        temp_obj[key] = 0;
                    }
                    else
                    {
                        if(item[key])
                            temp_obj[key] = item[key];
                    }
                })
                if(correctObject)
                    new_json.push(temp_obj);
                
            })
            return new_json;
        },
        handleSubmit(){
            //filtering json by name to get rid of duplicates (too many records)
            // var new_json = this.filterUploadedData(JSON.parse(this.json))
            // this.json = new_json;
            // this.showCanvas = true;
        }

    }
  }
</script>


<style>
  
</style>