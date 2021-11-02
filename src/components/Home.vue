<template>
    <v-row >
        <v-col
        cols="12"
        sm="6"
        offset-sm="3"
        >
        <v-card height="200px" style="padding-bottom:10px;">
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
                @click="loader = 'loading4'"
                v-on:click="handleSubmit()"
            >
                Submit
                <template v-slot:loader>
                    <span class="custom-loader">
                        <v-icon light>mdi-cached</v-icon>
                    </span>
                </template>
            </v-btn>
            </v-card-text>
            
        </v-card>
        </v-col>
    </v-row>
</template>


<script>
  export default {
    data () {
      return {
        test: '',
        files: [],
        loading4: false,
      }
    },
    watch: {
      loader () {
        const l = this.loader
        this[l] = !this[l]

        setTimeout(() => (this[l] = false), 3000)

        this.loader = null
      },
    },
    methods:{
        handleSubmit(){
            var counter = 0;
            this.files.forEach(function(item){
                var reader = new FileReader();
                // Use the javascript reader object to load the contents
                // of the file in the v-model prop
                reader.onload = function(e) {
                    this.test = e.target.result
                }
                reader.readAsText(item);
            })
        }
    }
  }
</script>


<style>
  .custom-loader {
    animation: loader 1s infinite;
    display: flex;
  }
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>