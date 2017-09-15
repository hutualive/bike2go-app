// pages/ble/ble.js

Page({

  data: {
    device_buffer: {},
    scanning: false,
    device_list: [],
    tipinfo: ''
  },

  onLoad: function () {

    var that = this

    app.getUserInfo(function (userInfo) {
      that.setData({ userInfo: userInfo })
    })

    wx.onBluetoothAdapterStateChange(function (res) {
      //console.log("BLE state changed, now is", res)
    })

    that.resetBLE_Devices()

    wx.onBluetoothDeviceFound(function (res) {
      //console.log('------------------------------')
      //console.log('new BLE device founded')
      //console.log(res)

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
        for (var i in res)
        { that.updateBLE_Devices(res[i]) }
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
  },

  onUnload: function () {
    this.toggleBLE_Scan(turnOn = false)
  },

  scanBLE: function () {
    var that = this
    that.toggleBLE_Scan()
  },

  toggleBLE_Scan: function (turnOn = null) {

    var that = this

    if (turnOn == null) {
      that.data.scanning ? turnOffBLE_Scan() : turnOnBLE_Scan()
    } else {
      turnOn ? turnOnBLE_Scan() : turnOffBLE_Scan()
    }

    function turnOnBLE_Scan() {

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
    }

    function turnOffBLE_Scan() {
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
  },

  resetBLE_Devices: function () {

    for (var k in this.data.device_buffer) delete this.data.device_buffer[k];

    this.setData({
      device_list: []
    })
  },

  updateBLE_Devices: function (dev) {

    var ble_dev = this.data.device_buffer
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

    this.setData({ device_buffer: ble_dev })
  }
})
