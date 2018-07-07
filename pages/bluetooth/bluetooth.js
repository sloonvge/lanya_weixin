// pages/bluetooth/bluetooth.js
const app = getApp()
var deviceId
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
    deviceId: '',
    serviceIds: [],
    chaId: '',
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
    console.log('connectedDeviceId: ' + options.connectedDeviceId)
    console.log('name: ' + options.name)
    console.log('advertisData: ' + options.advertisData)
    that.setData({
      deviceconnected: true,
      deviceId: options.connectedDeviceId,
      name: options.name,
      advertisData: options.advertisData
    })
    wx.getBLEDeviceServices({
      deviceId: that.data.deviceId,
      success: function (res) {
        console.log('All device serviceIds:', res.services)
        that.setData({ serviceIds: res.services })
        for (var i = 0; i < that.data.serviceIds.length; i++) {
          if (that.data.serviceIds[i].uuid.indexOf("FFE0") != -1) {
            that.setData({ serviceId: that.data.serviceIds[i].uuid })
          }
        }
        console.log('--------------------------------------')
        console.log('设备的id:', that.data.deviceId)
        console.log('设备的serviceId:', that.data.serviceId)
        setTimeout(function () {
          wx.getBLEDeviceCharacteristics({
            deviceId: that.data.deviceId,
            serviceId: that.data.serviceId,
            success: function (res) {
              console.log('All device characteristics:', res.characteristics)
              for (var i = 0; i < res.characteristics.length; i++){
                if (res.characteristics[i].uuid.indexOf("FFE1") != -1) {
                  console.log('设备的characteristicsID: ' + res.characteristics[i].uuid)
                  that.setData({
                    chaId: res.characteristics[i].uuid
                  })
                }
              }
              wx.notifyBLECharacteristicValueChange({
                deviceId: that.data.deviceId,
                serviceId: that.data.serviceId,
                characteristicId: that.data.chaId,
                state: true,
                success: function (res) {
                  console.log('notifyBLECharacteristicValueChanged success', res)
                },
                fail: function (res) {
                  // fail
                },
                complete: function (res) {
                }
              })
            },
            fail: function (res) {
              console.log(res)
            }
          })
        }, 1500)
        /**
         * 获取设备发过来的数据
         */
        wx.onBLECharacteristicValueChange(function (characteristic) {
          console.log('硬件设备的属性: ', characteristic)
          /**
           * {value: ArrayBuffer, 
           * deviceId: "3C:A3:08:95:D0:4B", 
           * serviceId: "0000FFE0-0000-1000-8000-00805F9B34FB", 
           * characteristicId: "0000FFE1-0000-1000-8000-00805F9B34FB"}
           */
          if (characteristic.characteristicId.indexOf("FFE1") != -1) {
            const result = characteristic.value
            const hex = that.buf2hex(result)
            console.log('硬件发过来的数据: ' + hex)
            that.setData({ result: hex })
          }
        })
      }
    })
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res)
      if (!res.available) {
        wx.closeBLEConnection({
          deviceId: that.data.deviceId,
          success: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  formSubmit: function (e) {
    console.log('发送数据：', e.currentTarget.dataset.id);
    var sendData = e.currentTarget.dataset.id
    var that = this
    let buffer = new ArrayBuffer(sendData.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < sendData.length; i++) {
      dataView.setUint8(i, sendData.charAt(i).charCodeAt())
    }
      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.chaId,
        value: buffer,
        success: function (res) {
          console.log('writeBLECharacteristicValue success', res.errMsg)
        },
        fail: function (res) {
          console.log(res)
        }
      })
  },
  formSubmit1: function (e) {
    console.log('发送数据：', e.currentTarget.dataset.id);
    var sendData = e.currentTarget.dataset.id
    var that = this
    let buffer = new ArrayBuffer(sendData.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < sendData.length; i++) {
      dataView.setUint8(i, sendData.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.chaId,
      value: buffer,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  formSubmit2: function (e) {
    console.log('发送数据：', e.currentTarget.dataset.id);
    var sendData = e.currentTarget.dataset.id
    var that = this
    let buffer = new ArrayBuffer(sendData.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < sendData.length; i++) {
      dataView.setUint8(i, sendData.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.chaId,
      value: buffer,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  formSubmit3: function (e) {
    console.log('发送数据：', e.currentTarget.dataset.id);
    var sendData = e.currentTarget.dataset.id
    var that = this
    let buffer = new ArrayBuffer(sendData.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < sendData.length; i++) {
      dataView.setUint8(i, sendData.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.chaId,
      value: buffer,
      success: function (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  formReset: function () {
    console.log('form发生了reset事件')
  }
})
