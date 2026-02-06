// pages/basic-info/index.ts

import { localConfig } from '../../api/config';
import { DemoService } from '../../api/test';

const demoService = new DemoService();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    localConfig: {
      origin: localConfig.origin,
      baseURL: localConfig.baseURL
    },
    packageConfigText: '',
    packageGraphText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    demoService.getPackageConfig().then((response) => {
      this.setData({
        packageConfigText: JSON.stringify(response.data, null, 2)
      }, () => {
        console.log(this.data.packageConfigText);
      });
    });

    demoService.getPackageGraph().then((response) => {
      this.setData({
        packageGraphText: JSON.stringify(response.data, null, 2)
      }, () => {
        console.log(this.data.packageGraphText);
      });
    });

    demoService.getProductInfo().then((response) => {
      console.log(response.data);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})