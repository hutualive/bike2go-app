//app.js
var EventEmitter = require('./libraries/events');

App({

  onLaunch: function () {

    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    this.globalData.sysinfo = wx.getSystemInfoSync()
  },

  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  getPlatform: function () {
    return this.globalData.sysinfo["platform"]
  },

  globalData: {
    userInfo: null,
    sysinfo: {},
    hours: 0,
    minutes: 0,
    seconds: 0,
    unlockSessionCounter: 0,
    lockSessionCounter: 0,
    bleEvents: new EventEmitter()
  }
})