// index.ts
import ApiCommon from "../../api/ApiCommon";

Page({
    data() {
        return {
            result: "",
            base64: ""
        };
    },
    async onTestClick() {
        const info =  wx.getAccountInfoSync();
        const envVersion = info.miniProgram.envVersion;
        console.log(envVersion);

        const res = await ApiCommon.basic.postMessage(`this ${envVersion} env`, "wechat mini program");
        // @ts-ignore
        console.log(res?.data);
        this.setData({
            // @ts-ignore
            result: JSON.stringify(res?.data, null, 2)
        });
    },
    async onTestClick2() {
        const res = await ApiCommon.pic.getPic();
        // @ts-ignore
        const base64 = res.data as string;
        this.setData({
            base64
        });
    }
})