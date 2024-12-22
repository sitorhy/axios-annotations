import axios from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';
// @ts-ignore
axios.defaults.adapter = mpAdapter;

// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
  },
})