import {Config, AxiosStaticInstanceProvider} from "axios-annotations";
import mpAxios from './axios-miniprogram/dist/axios-miniprogram.cjs';

class ThirdAxiosStaticInstanceProvider extends AxiosStaticInstanceProvider {
  async provide() {
      return mpAxios;
  }
}

export const localConfig = new Config({
    protocol: 'http',
    host: 'localhost',
    port: 5173,
    axiosProvider: new ThirdAxiosStaticInstanceProvider()
});