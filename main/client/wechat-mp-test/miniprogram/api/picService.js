import {
    Service,
    Config,
    RequestConfig,
    AxiosStaticInstanceProvider,
    GetMapping,
    Expect,
} from "axios-annotations";

import mpAxios from 'axios-miniprogram';

class ThirdAxiosStaticInstanceProvider extends AxiosStaticInstanceProvider {
    async provide() {
        console.log("第三方实现");
        return mpAxios;
    }
}

new Config({
    protocol: "http",
    host: "localhost",
    port: 8888,
    axiosProvider: new ThirdAxiosStaticInstanceProvider()
}).register("picConfig");

@RequestConfig(Config.forName("picConfig"))
export default class PicTestService extends Service {

    @GetMapping("/get-image")
    async getPic() {
        return Expect({});
    }
}