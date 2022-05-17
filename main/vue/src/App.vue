<template>
  <div id="app">
    <p v-for="item in history">{{ item }}</p>
  </div>
</template>

<script>
import test from "./core/test/test-unit";

export default {
  name: 'App',
  data() {
    return {
      history: []
    };
  },
  mounted() {
    test().then(results => {
      this.history = results;
    });
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
