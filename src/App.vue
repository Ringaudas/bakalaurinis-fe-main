<template>
    <v-app>
        <div id="backgroundBlock" >
            <Home />
        </div>
    </v-app>
</template>

<script>
import Home from './components/Home.vue';
export default {
  name: 'App',
  components:{
      Home
  },
  data: () => ({
    //
  }),
};
</script>


<style>

html, body {
    height: 100%;
    margin: 0;
    overflow: hidden;
}

#backgroundBlock{
    background-color: #a4a6a6;
    height:100%;
}

</style>
