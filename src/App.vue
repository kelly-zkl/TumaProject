<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import 'babel-polyfill'

  export default {
    data() {
      return {}
    },
    methods: {},
    mounted() {
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
    margin: 0;
    padding: 0;
    -webkit-overflow-scrolling: touch; /*流畅滚动,ios7下会有滑一下滑不动的情况，所以需要写上*/
  }
</style>
