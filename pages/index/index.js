//index.js
//获取应用实例
const app = getApp()

var temp = []
var connectedDeviceId
Page({
  data: {
    isbluetoothready: false,
    searchingstatus: false,
    receivedata: '',
    onreceiving: false,
    loading: false,
    deviceconnected: false,
    devices: []
  },
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  switchBlueTooth: function () {
    var that = this
    that.setData({
      isbluetoothready: !that.data.isbluetoothready
    })
    if (that.data.isbluetoothready) {
      wx.openBluetoothAdapter({//初始化适配器
        success: function (res) {
          console.log("初始化蓝牙适配器成功")
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log("蓝牙适配器状态变化", res)
            that.setData({
              isbluetoothready: res.available,
              searchingstatus: res.discovering
            })
          })
          wx.onBluetoothDeviceFound(function (devices) {
            var exist = false
            //Android
            if (devices.devices) {
              var i
              devices.devices[0].advertisData = that.buf2hex(devices.devices[0].advertisData)
              console.log(devices.devices[0].advertisData)
              if (devices.devices[0].advertisData == "") {
                devices.devices[0].advertisData = '空'
              }
              if (devices.devices[0].name == "") {
                devices.devices[0].name = '未知'
              }
              console.log("发现新蓝牙设备")
              console.log(devices.devices[0])
              console.log("设备ID：" + devices.devices[0].deviceId)
              console.log("设备名称：" + devices.devices[0].name)
              for (i = 0; i < temp.length; i++) {
                if (devices.devices[0].deviceId == temp[i].deviceId) {
                  exist = true
                }
              }
              if (!exist) {
                temp.push(devices.devices[0])
              }
              if (devices.devices[0].name == "HC-08"){
                that.autoConnectTo(devices.devices[0].deviceId)
              }
            }
            that.setData({
              devices: temp
            })
          })
        },
        fail: function (res) {
          console.log("初始化蓝牙适配器失败")
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false,
                searchingstatus: false
              })
            }
          })
        }
      })
    } else {
      temp = []
      wx.closeBLEConnection({
        deviceId: that.data.connectedDeviceId,
        complete: function (res) {
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: ""
          })
        }
      })
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log(res)
          that.setData({
            isbluetoothready: false,
            deviceconnected: false,
            devices: [],
            searchingstatus: false,
            receivedata: ""
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙和定位是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false
              })
            }
          })
        }
      })
    }

  },
  searchbluetooth: function () {
    temp = []
    var that = this
    if (!that.data.searchingstatus) {
      var that = this
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("开始搜索附近蓝牙设备")
          console.log(res)
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
  },
  connectTo: function(e) {
    var deviceId
    var that = this
    deviceId = e.currentTarget.id
    that.autoConnectTo(deviceId)
  },
  autoConnectTo: function (deviceId) {
    var that = this
    var name, advertisData
    console.log(deviceId)
    for (var i = 0; i < temp.length; i++) {
      if (deviceId == temp[i].deviceId) {
        name = temp[i].name
        advertisData = temp[i].advertisData
      }
    }

    if (that.data.deviceconnected) {
      wx.closeBLEConnection({
        deviceId: deviceId,
        complete: function (res) {
          console.log("断开设备")
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: "",
            receivedata: ""
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
          that.setData({
            searchingstatus: false
          })
        }
      })
      wx.showLoading({
        title: '连接蓝牙设备中...'
      })
      wx.createBLEConnection({
        deviceId: deviceId,
        success: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 1000
          })
          connectedDeviceId = deviceId
          console.log("连接设备成功")
          console.log(res)
          that.setData({
            deviceconnected: true,
            connectedDeviceId: deviceId
          })
          wx.navigateTo({
            url: '../bluetooth/bluetooth?connectedDeviceId=' + connectedDeviceId + '&name=' + name + '&advertisData=' + advertisData
          })
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接设备失败',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备失败")
          console.log(res)
          that.setData({
            deviceconnected: false
          })
        }
      })

    }
  },
})
