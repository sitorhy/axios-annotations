<template>
  <div id="app">
    <p v-for="item in history">{{ item }}</p>
  </div>
</template>

<script>
import TestService from "@/test-unit";

export default {
  name: 'App',
  data() {
    return {
      history: []
    };
  },
  mounted() {
    const service = new TestService();
    service.hello("world").then(res => {
      this.history.push(res.data);
    });

    service.postMessage("hello world", "client").then(res => {
      this.history.push(res.data);
    });

    service.postJSON("hello world").then(res => {
      this.history.push(JSON.stringify(res.data));
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
