import Vue from 'vue';
import VueRouter from 'vue-router';
import Scene from '../views/CanvasScene.vue';
import Home from '../views/HomePage.vue';
Vue.use(VueRouter);

const routes = [
  {
    path: '/Scene',
    name: 'Scene',
    component: Scene,
  },
  {
    path: '/Home',
    name: 'Home',
    component: Home,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
