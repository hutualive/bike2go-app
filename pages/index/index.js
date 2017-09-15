//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    scale: 18,
    latitude: 22.539087,
    longitude: 113.952255,

    device_buffer: {},
    scanning: false,
    device_list: [],
    bleConnected: false,
    tipinfo: ''
  },

// 页面加载
  onLoad: function (options) {

    var that = this

    // 0.获取定时器，用于判断是否已经在计费
    that.timer = options.timer;

    // 1.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      }
    });

    // 2.设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({

      success: (res) => {

        that.setData({
          controls:
          [
            //点击定位图标 - id 1
            {
              id: 1,
              iconPath: '/images/location.png',
              position: {
                left: 10,
                top: res.windowHeight - 75,
                width: 50,
                height: 50
              },
              clickable: true
            },

            //立即用车图标 - id 2
            {
              id: 2,
              iconPath: '/images/scan.png',
              position: {
                left: res.windowWidth / 2 - 65,
                top: res.windowHeight - 90,
                width: 130,
                height: 60
              },
              clickable: true
            },

            //账户图标 - id 3
            {
              id: 3,
              iconPath: '/images/user.png',
              position: {
                left: res.windowWidth - 60,
                top: res.windowHeight - 80,
                width: 50,
                height: 50
              },
              clickable: true
            },

            //地图中心 - id 4
            {
              id: 4,
              iconPath: '/images/center.png',
              position: {
                left: res.windowWidth / 2 - 10,
                top: res.windowHeight / 2 - 40,
                width: 20,
                height: 40
              },
              clickable: false
            }
          ]
        })
      }
    });

    // 3.请求服务器，显示附近的单车，用bike标记
    wx.request({
      url: 'https://easy-mock.com/mock/59151e659aba4141cf220b1a/api/location',
      //data: {},
      method: 'GET',
      //header: {},
      success: (res) => {
          that.setData({
            markers: res.data.location
          })
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  }, //页面加载结束

  // 页面显示
  onShow: function(){

    var that = this

    // 0.创建地图上下文，移动当前位置到地图中心
    that.mapCtx = wx.createMapContext("bike2goMap");
    that.movetoPosition()

    // 1. 获取蓝牙状态，扫描周围的单车
    that.resetBLE_List()

    that.scanBLE()

    wx.onBluetoothAdapterStateChange((res) => {
      //console.log("BLE state changed, now is", res)
    })

    wx.onBluetoothDeviceFound(function (res) {
      //console.log('------------------------------')
      //console.log('new BLE device founded')
      //console.log(res)

      // on Andriod: 'res' is an object with one device
      if (app.getPlatform() == "android") {
        that.updateBLE_List(res)
      }

      // on iOS: 'res' is an object with a key "devices", who is an array
      else if (app.getPlatform() == "ios") {
        for (var i in res["devices"])
        { that.updateBLE_List(res["devices"][i]) }
      }

      // on Mac devtools: 'res' is an array
      else if (app.getPlatform() == "devtools") {
        for (var i in res)
        { that.updateBLE_List(res[i]) }
      }

      //sort for UI display
      var dev_list = []

      for (var k in that.data.device_buffer) {
        dev_list.push(that.data.device_buffer[k])
        //console.log('--------------------------')
        //console.log(dev_list)
      }

      dev_list.sort(function (a, b) {
        if (a["name"] > b["name"]) return -1
        if (a["name"] < b["name"]) return 1
        return 0
      })

      that.setData({ device_list: dev_list })

    })

    // 2.监控蓝牙连接状态
    wx.onBluetoothAdapterStateChange(function (res) {
      //console.log("BLE state changed, now is", res)
    })
  }, // 页面显示结束

  // 定位函数，移动位置到地图中心
  movetoPosition: function () {

    var that = this

    that.mapCtx.moveToLocation();
  },

  // 地图视野改变事件
  bindregionchange: function(e){

    var that = this

    // 拖动地图，获取附近单车位置
    if(e.type == "begin"){
      wx.request({
        url: 'https://easy-mock.com/mock/59151e659aba4141cf220b1a/api/location', 
        data: {},
        method: 'GET', 
        success: (res) => {
          that.setData({
            _markers: res.data.data
          })
        }
      })
    }
    // 停止拖动，显示单车位置
    else if(e.type == "end"){
        that.setData({
          markers: that.data._markers
        })
    }
  },

  // 地图控件点击事件
  bindcontroltap: function (e) {

    var that = this

    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第2步设置的id
    switch (e.controlId) {
      // 点击定位控件
      case 1: that.movetoPosition();
        break;

      // 点击立即用车，判断当前是否正在计费
      case 2: if (that.timer === "" || that.timer === undefined) {
        // 没有在计费就扫码
        wx.scanCode({
          success: (res) => {
            // 正在解锁通知
            wx.showLoading({
              title: 'unlock',
              mask: true
            })

            // console.log('scanned QR code: ', res.result)

            var bike_id = res.result

            // // 利用扫码得到的Bike_ID，通过蓝牙与目标单车建立连接
            // wx.createBLEConnection({
            //    deviceId: bike_id,
            //    success: function(res) {
            //      // 探索单车的Service&Characteristics
            //      // 点亮单车的LED灯示意单车连接成功
            //    },
            // })

            // 请求服务器解锁密钥
            wx.request({
              url: 'https://easy-mock.com/mock/59151e659aba4141cf220b1a/api/key/',
              data: {bike_id: bike_id},
              method: 'GET',
              success: function (res) {

                console.log(res.data.bike.unlock_key)
                var unlock_key = res.data.bike.unlock_key

                // 请求密钥成功隐藏等待框
                wx.hideLoading();

                // 通过蓝牙转发密钥到单车进行解锁
                // 单车的LED灯关闭示意解锁成功  

                // 携带车号跳转到计费页
                wx.redirectTo({                  
                  url: '../proceed/proceed?bike_id=' + bike_id,
                  success: function (res) {
                    wx.showToast({
                      title: 'done',
                      duration: 2000
                    })
                  }
                })
              }
            })
          }
        })
      }
      // 当前已经在计费就回退到计费页
      else {
        wx.navigateBack({
          delta: 1
        })
      }
        break;

      // 点击头像控件，跳转到个人中心
      case 3: wx.navigateTo({
        url: '../user/user'
      });
        break;

      default: break;
    }
  },

  // BLE library
  resetBLE_List: function () {

    var that = this

    for (var k in that.data.device_buffer) delete that.data.device_buffer[k];

    that.setData({
      device_list: []
    })
  },

  scanBLE: function () {

    var that = this

    wx.openBluetoothAdapter({
      success: function (res) {
        //console.log("open ble adapter : success", res)
        startDiscovering()
      },
      fail: function (res) {
        //console.log("open ble adapter : fail", res)
        that.setData({ tipinfo: res["errMsg"] })
      }
    })

    function startDiscovering() {

      var that = this

      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          //console.log("start ble scan : success : ", res)

          that.setData({ scanning: true, tipinfo: '' })
        },
        fail: function (res) {
          //console.log("start ble scan : fai l: ", res)
          that.setData({ tipinfo: res["errMsg"] })
        }
      })
    }
  },

  updateBLE_List: function (dev) {

    var that = this

    var ble_dev = that.data.device_buffer
    var devId = dev["deviceId"]

    // find new devices
    if (!ble_dev[devId]) {
      // create a new device object in ble_dev
      ble_dev[devId] = {}

      ble_dev[devId]["deviceId"] = devId
      ble_dev[devId]["name"] = dev["name"]
      ble_dev[devId]["RSSI"] = dev["RSSI"]
      ble_dev[devId]["advertisData"] = dev["advertisData"]

      ble_dev[devId]["counter"] = 1
    }
    else {
      ble_dev[devId]["counter"] += 1
      console.log("--- device existing", ble_dev[devId]["counter"])
    }

    //ble_dev[devId]["timestamp"] = Date.now()

    that.setData({ device_buffer: ble_dev })
  },

  stopBLE: function () {

    var that = this

    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        //console.log("stop ble scan : success", res)

        wx.closeBluetoothAdapter({
          success: function (res) {
            //console.log("close ble adapter : success:", res)
            that.setData({ scanning: false, tipinfo: '' })
          },
          fail: function (res) {
            //console.log("close ble adapter : fail:", res)
            that.setData({ tipinfo: res["errMsg"] })
          }
        })
      },
      fail: function (res) {
        //console.log("stop ble scan : fail : ", res)
        that.setData({ tipinfo: res["errMsg"] })
      }
    })
  }
})
