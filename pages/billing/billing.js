// pages/billing/billing.js
var app = getApp()

Page({
  data:{
    hours: 0,
    minutes: 0,
    seconds: 0,
    billing: "in riding",
    lock_key: '003319534400000000',
    buttonState: true
  },

  // 页面加载
  onLoad:function(options){
    // 获取车牌号，设置定时器
    this.setData({
      bike_id: options.bike_id,
      timer: this.timer
    })

    // 初始化计时器
    let s = 0;
    let m = 0;
    let h = 0;
    // 计时开始
    this.timer = setInterval(() => {
      this.setData({
        seconds: s++
      })

      if(s == 60){
        s = 0;
        m++;
        setTimeout(() => {         
          this.setData({
            minutes: m
          });
        },1000)   

        if(m == 60){
          m = 0;
          h++
          setTimeout(() => {         
            this.setData({
              hours: h
            });
          },1000)
        }
      };
    },1000)  
  },

  // 页面显示
  onShow: function (options) {

    var that = this
    app.globalData.bleEvents.on('locked', that.handleLockedEvent)
  },

  handleLockedEvent: function (parameters) {

    var that = this

    console.log('---event-emitter-successful---') 
    if (parameters == that.data.lock_key) {

      clearInterval(that.timer);
      that.timer = '';
      that.setData({
        billing: 'the trip duration is',
        buttonState: false
      })
    }
  },

  // 回到地图首页
  moveToIndex: function () {

    // 如果定时器为空
    if (this.timer == "") {
      // 关闭计费页回到地图首页
      wx.redirectTo({
        url: '../index/index'
      })
    }
  }
})