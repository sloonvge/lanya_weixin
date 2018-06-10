// pages/bluetooth/bluetooth.js
const app = getApp()
var connectedDeviceId
var util = require('../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceconnected: false,
    name: '',
    advertisData: '',
    serviceId: '',
    connectedDeviceId: '',
    serviceIds: [],
    cdE1: '',
    characteristicsE1: null,
    result: ''
  },
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this

    util.loadWeatherData(function (data) {
      that.setData({
        city: data.data.HeWeather6[0].basic,
        now: data.data.HeWeather6[0].now,
        forecast: data.data.HeWeather6[0].daily_forecast,
        lifestyle: data.data.HeWeather6[0].lifestyle,
        update: data.data.HeWeather6[0].update.loc.split(" ")[1]
      });
    })
    that.setData({
      menu: [
        { 'index': 0, 'item': '浇水', 'value': 90, 'deg': 0, 'src':"../../images/xuanzhuan.png"},
        { 'index': 1, 'item': '旋转', 'value': 70, 'deg': 90, 'src': "../../images/xuanzhuan.png"},
        { 'index': 2, 'item': '施肥', 'value': 80, 'deg': 180, 'src': "../../images/xuanzhuan.png"},
        { 'index': 3, 'item': '旋转', 'value': 70, 'deg': 270, 'src': "../../images/xuanzhuan.png"}
      ]
    })
    connectedDeviceId = options.connectedDeviceId
    console.log('connectedDeviceId: ' + options.connectedDeviceId)
    console.log('name: ' + options.name)
    console.log('advertisData: ' + options.advertisData)
    that.setData({
      deviceconnected: true,
      connectedDeviceId: options.connectedDeviceId,
      name: options.name,
      advertisData: options.advertisData
    })
      wx.getBLEDeviceServices({
        deviceId: connectedDeviceId,
        success: function (res) {
          console.log('device services:', res.services)
          that.setData({ serviceIds: res.services })
          for (var i = 0; i < that.data.serviceIds.length; i++){
            if (that.data.serviceIds[i].uuid.indexOf("FFE0") != -1) {
              that.setData({ serviceId: that.data.serviceIds[i].uuid })
            }
          }
          console.log('--------------------------------------')
          console.log('device设备的id:', that.data.connectedDeviceId)
          console.log('device设备的服务id:', that.data.serviceId)
          setTimeout(function () {
          wx.getBLEDeviceCharacteristics({
            deviceId: that.data.connectedDeviceId,
            serviceId: that.data.serviceId,
            success: function (res) {
              console.log('device getBLEDeviceCharacteristics:', res.characteristics)
              if (res.characteristics[0].uuid.indexOf("FFE1") != -1) {
                that.setData({
                  cdE1: res.characteristics[0].uuid,
                  characteristicsE1: res.characteristics[0]
                })
              }
              /**
              */
              console.log('cdE1=', that.data.cdE1)
              //console.log('cd01= ' + that.data.cd01 + 'cd02= ' + that.data.cd02 + 'cd03= ' + that.data.cd03 + 'cd04= ' + that.data.cd04 + 'cdE1= ' + that.data.cdE1)
              /**
               * 回调获取 设备发过来的数据
               */
              wx.onBLECharacteristicValueChange(function (characteristic) {
                console.log('characteristic value comed:', characteristic)
                //{value: ArrayBuffer, deviceId: "3C:A3:08:95:D0:4B", serviceId: "0000FFE0-0000-1000-8000-00805F9B34FB", characteristicId: "0000FFE1-0000-1000-8000-00805F9B34FB"}
                /**
                }
                */
                if (characteristic.characteristicId.indexOf("FFE1") != -1) {
                  const result = characteristic.value
                  const hex = that.buf2hex(result)
                  console.log(hex)
                  that.setData({ result: hex })
                }
              })
              /**
               * 顺序开发设备特征notifiy
               */
              wx.notifyBLECharacteristicValueChange({
                // 启用 notify 功能
                // 这里的 deviceId 需要在上面的 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
                deviceId: that.data.connectedDeviceId,
                serviceId: that.data.serviceId,
                characteristicId: that.data.cdE1,
                state: true,
                success: function (res) {
                  // success
                  console.log('notifyBLECharacteristicValueChanged success', res)
                },
                fail: function (res) {
                  // fail
                },
                complete: function (res) {
                  // complete
                }
              })
              /**
              */
            },
            fail: function (res) {
              console.log(res)
            }
          })
        }, 1500);
      }
    })
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res)
      if (!res.available) {
        wx.closeBLEConnection({
          deviceId: that.data.connectedDeviceId,
          success: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  formSubmit: function (e) {
    //console.log('form发生了submit事件，携带数据为：', e.detail.value.senddata)
    console.log('发送数据：', e.currentTarget.dataset.id);
    //var senddata = e.detail.value.senddata
    var senddata = e.currentTarget.dataset.id
    var that = this
    let buffer = new ArrayBuffer(senddata.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < senddata.length; i++) {
      dataView.setUint8(i, senddata.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.cdE1,
      value: buffer,
      success: function (res) {
        console.log(res)
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail: function (res) {
        //fail
        console.log(res)
      },
      complete: function (res) {
        //complete
      }
    })
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
