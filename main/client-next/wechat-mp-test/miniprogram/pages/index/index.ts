// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Component({
  data: {},
  methods: {
    toBasicInfoPage() {
      wx.navigateTo({
        url: "/pages/basic-info/index"
      })
    }
  },
})
