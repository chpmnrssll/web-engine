<template>
  <div id="app">
    <WebEngine />
  </div>
</template>

<script>
import WebEngine from './components/WebEngine.vue';

export default {
  name: 'App',
  components: {
    WebEngine,
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  margin: 0;
}
</style>
