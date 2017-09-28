//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    scale: 18,
    // ST Shenzhen ／ TCL大厦坐标
    latitude: 22.539087,
    longitude: 113.952255,

    device_buffer: {},
    scanning: false,
    device_list: [],

    deviceId: '',
    name: '',
    serviceId: '',
    services: [],
    charId: '',
    chars: [],
    writeResponseFlag: false,
    statusFeedback: ''
  },

// 页面加载
  onLoad: function (options) {

    var that = this

    // 0.获取定时器，用于判断是否已经在计费
    that.timer = options.timer;

    // 1.清空蓝牙设备列表
    that.resetBLE_Devices();    

    // 2.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      }
    });

    // 3.设置地图控件的位置及大小，通过设备宽高定位
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

    // 4.请求服务器，显示附近的单车，用bike标记
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
    });

    // 5. 打开蓝牙扫描附近的单车
    that.toggleBLE_Scan();

  }, //页面加载结束

  // 页面显示
  onShow: function(){

    var that = this

    // 0.创建地图上下文，移动当前位置到地图中心
    that.mapCtx = wx.createMapContext("bike2goMap");
    that.movetoPosition();

    // 1. 监听蓝牙状态
    wx.onBluetoothAdapterStateChange(function (res) {
    })

    // 2. 把扫描到的单车加入到设备列表
    wx.onBluetoothDeviceFound(function (res) {

      // on Andriod: 'res' is an object with one device
      if (app.getPlatform() == "android") {
        that.updateBLE_Devices(res)
      }

      // on iOS: 'res' is an object with a key "devices", who is an array
      else if (app.getPlatform() == "ios") {
        for (var i in res["devices"])
        { that.updateBLE_Devices(res["devices"][i]) }
      }

      // on Mac devtools: 'res' is an array
      else if (app.getPlatform() == "devtools") {
        var device_array = res["devices"][0]
        var device = device_array[0]
        that.updateBLE_Devices(device)
      }

      //sort for UI display
      var dev_list = []

      for (var k in that.data.device_buffer) {
        dev_list.push(that.data.device_buffer[k])
      }

      dev_list.sort(function (a, b) {
        if (a["name"] > b["name"]) return 1
        if (a["name"] < b["name"]) return -1
        return 0
      })

      that.setData({ device_list: dev_list })
      console.log('---scanned-device-list---')
      console.log(that.data.device_list)
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
        // 停止扫描单车
        that.toggleBLE_Scan(false);

        wx.scanCode({
          success: (res) => {
            // 正在解锁通知
            wx.showLoading({
              title: 'unlocking',
              mask: true
            })

            var bike_id = res.result
            var device_list = that.data.device_list
            var scannedBike = that.getBikeByName(device_list, bike_id)

            that.setData({ deviceId: scannedBike.deviceId, name: scannedBike.name });

            // 监听设备的连接状态
            wx.onBLEConnectionStateChanged(function (res) {
              console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
            })

            // 连接设备
            wx.createBLEConnection({
              deviceId: that.data.deviceId,
              success: function (res) {
                /**
                 * 连接成功，后开始获取设备的服务列表
                 */
                wx.getBLEDeviceServices({
                  deviceId: that.data.deviceId,
                  success: function (res) {

                    that.setData({ services: res.services });
                    console.log('device services:', res.services)

                    that.setData({ serviceId: that.data.services[0].uuid });
                    console.log('device serviceId:', that.data.services[0].uuid);

                    /**
                     * 延迟10秒，增强demo演示效果，然后根据服务UUID获取特征 
                     */
                    setTimeout(function () {
                      wx.getBLEDeviceCharacteristics({
                        deviceId: that.data.deviceId,
                        serviceId: that.data.serviceId,

                        success: function (res) {
                          that.setData({ chars: res.characteristics });
                          console.log('device chars:', res.characteristics);

                          that.setData({ charId: that.data.chars[0].uuid });
                          console.log('device charId:', that.data.charId);

                          /**
                           * 使能设备特征值的notification
                           */
                          wx.notifyBLECharacteristicValueChanged({
                            deviceId: that.data.deviceId,
                            serviceId: that.data.serviceId,
                            characteristicId: that.data.charId,
                            state: true,
                            success: function (res) {
                              // success
                              console.log('---notification-enabled---: ', res);
                            },
                            fail: function (res) {
                              // fail
                            },
                            complete: function (res) {
                              // complete
                            }
                          })

                          /**
                           * 监听蓝牙设备发过来的数据
                           */
                          wx.onBLECharacteristicValueChange(function (res) {

                            var statusFeedback = that.hex2buf(res.value);

                            if (that.data.writeResponseFlag == true) {
                              console.log('---write-response-notification-received---');
                              that.setData({ writeResponseFlag: false });
                            } else {
                              console.log('charId is:', res.characteristicId, 'status code is :', statusFeedback);
                              that.setData({ statusFeedback: statusFeedback})

                              app.globalData.bleEvents.emit('locked', that.data.statusFeedback)
                            }
                          })

                          // 请求服务器解锁密钥
                          wx.request({
                            url: 'https://easy-mock.com/mock/59151e659aba4141cf220b1a/api/key/',
                            data: { name: bike_id },
                            method: 'GET',
                            success: function (res) {

                              console.log('---retrieve-unlock-key-successful---')
                              var unlock_key = res.data.bike.unlock_key

                              // 请求密钥成功隐藏等待框
                              wx.hideLoading();

                              // 发送解锁指令
                              that.sendCommand(unlock_key);

                              // 携带车号跳转到计费页
                              wx.redirectTo({
                                url: '../proceed/proceed?bike_id=' + bike_id,
                                success: function (res) {

                                  wx.showToast({
                                    title: 'success',
                                    duration: 3000
                                  })
                                }
                              })
                            }
                          })
                        },
                        fail: function (res) {

                        }
                      })
                    }, 3000);
                  }
                })
              },
              fail: function (res) {
                // fail
              },
              complete: function (res) {
                // complete
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

  // start of BLE library
  resetBLE_Devices: function () {

    for (var k in this.data.device_buffer) delete this.data.device_buffer[k];

    this.setData({
      device_list: []
    })
  },

  toggleBLE_Scan: function (option) {

    var that = this

    if (option == null) {
      that.data.scanning ? turnOffBLE_Scan() : turnOnBLE_Scan()
    } else {
      option ? turnOnBLE_Scan() : turnOffBLE_Scan()
    }

    function turnOnBLE_Scan() {

      wx.openBluetoothAdapter({
        success: function (res) {
          startDiscovering()
        },
        fail: function (res) {
        }
      })

      function startDiscovering() {

        that.setData({ scanning: true })
        wx.startBluetoothDevicesDiscovery({
          success: function (res) {
            console.log("---ble-in-scanning--")
          },
          fail: function (res) {
          }
        })
      }
    }

    function turnOffBLE_Scan() {

      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("---ble-scan-stopped---")
          that.setData({ scanning: false })
        },
        fail: function (res) {
        }
      })
    }
  },

  updateBLE_Devices: function (dev) {

    var ble_dev = this.data.device_buffer
    var devId = dev["deviceId"]

    // find new devices
    if (!ble_dev[devId]) {
      // create a new device object in ble_dev
      ble_dev[devId] = {}

      ble_dev[devId]["deviceId"] = dev["deviceId"]
      ble_dev[devId]["name"] = dev["name"]
      ble_dev[devId]["RSSI"] = dev["RSSI"]
      ble_dev[devId]["advertisData"] = dev["advertisData"]

      ble_dev[devId]["counter"] = 1
    }
    else {
      ble_dev[devId]["counter"] += 1
      console.log("---device already in the list---")
    }

    ble_dev[devId]["timestamp"] = Date.now()

    this.setData({ device_buffer: ble_dev })
  },

  connectBLE: function (e) {

    var that = this;

    // stop ble scan
    that.toggleBLE_Scan(false);

    var title = e.currentTarget.dataset.title;
    var name = e.currentTarget.dataset.name;

    wx.redirectTo({
      //url: '../conn/conn?deviceId=' + title + '&name=' + name,
      success: function (res) {
        // success
        console.log("---connect-to-target-device---")
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  }, // end of BLE library 

  // start of application logic
  // retrieve target bike from device list
  getBikeByName: function(array, value) {
    var result = array.filter(obj => obj.name == value);
    return result? result[0]: null; // or undefined
  },

  // 发送数据到设备中
  sendCommand: function (unlock_key) {

    var that = this;
    // var sessionCounter = app.globalData.unlockSessionCounter;
    // app.globalData.unlockSessionCounter++;
    // var counter = that.padZero(sessionCounter, 8);
    // var charString = command + counter;
    var charString = unlock_key;
    console.log('---charString-is--- ', charString);
    var typedArray = new Uint8Array(charString.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }))
    var arrayBuffer = typedArray.buffer
    // disable write response notification
    //that.setData({ writeResponseFlag: true });

    console.log('---send-unlock-command---');
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.charId,
      value: arrayBuffer,
      success: function (res) {
        // success
        console.log("---sent-unlock-command-successful---");
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },

  padZero: function (num, size) {
    var s = num + "";
    while(s.length < size) s = "0" + s;
    return s;
  },

  hex2buf: function (hex) {
    return Array.prototype.map.call(new Uint8Array(hex), x => ('00' + x.toString(16)).slice(-2)).join('');
  } // end of application logic
})
