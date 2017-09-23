// pages/billing/billing.js
var app = getApp()

Page({
  data:{
    hours: 0,
    minutes: 0,
    seconds: 0,
    billing: "in riding",
    buttonState: true,
    bikeStatus: ''
  },

  // 页面加载
  onLoad:function(options){
    // 获取车牌号，设置定时器
    this.setData({
      bike_id: options.bike_id,
      status: options.status,
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
     // app.globalData.seconds = that.data.seconds

      if(s == 60){
        s = 0;
        m++;
        setTimeout(() => {         
          this.setData({
            minutes: m
          });
        //  app.globalData.minutes = that.data.minutes
        },1000)   

        if(m == 60){
          m = 0;
          h++
          setTimeout(() => {         
            this.setData({
              hours: h
            });
          //  app.globalData.hours = that.data.hours
          },1000)
        }
      };
    },1000)  
  },

  // 页面显示
  onShow: function (options) {
    var that = this

    // //console.log('---get-current-pages---')
    // var pages = getCurrentPages()
    // var prePage = pages[pages.length -2];
    // console.log('---get-previous-page---', prePage)

    // that.setData({
    //   bikeStatus: prePage.data.statusFeedback
    // })

    // setTimeout(function(){
    //   that.setData({ bikeStatus: app.globalData.bikeStatus })
    //   console.log('billing-page-bikeStatus-is---', that.data.bikeStatus)

    //   if (that.data.bikeStatus == '0000000000') {
    //     clearInterval(that.timer);
    //     that.timer = "";
    //     that.setData({
    //       billing: "the trip duration is",
    //       buttonState: false
    //     })
    //   }
    // },5000)

    // if (app.globalData.bikeStatus == '0000000000') {
    //   clearInterval(that.timer);
    //   that.timer = '';
    //   that.setData({
    //     billing: 'the trio duration is',
    //     buttonState: false
    //   })
    // }

    app.globalData.bleEvents.on('lock', that.handleLockEvent)

    // if (that.data.status == '0000000000') {

    //   //var currentH = app.globalData.hours
    //   //var currentM = app.globaldata.minutes
    //   //var currentS = app.globaldata.seconds

    //   clearInterval(that.timer);
    //   that.timer = '';
    //   that.setData({
    //     billing: 'the trip duration is',
    //     buttonState: false
    //     //hours: currentH,
    //     //minutes: currentM,
    //     //seconds: currentS
    //   })
    //}

    // //that.setData({bikeStatus: app.globalData.bikeStatus})
    // console.log('billing-page-bikeStatus-is---', that.data.bikeStatus)
  },

  handleLockEvent: function (parameters) {

    var that = this

    console.log('---event-emitter-successful---')
    
    if (parameters == '0000000000') {

      //var currentH = app.globalData.hours
      //var currentM = app.globaldata.minutes
      //var currentS = app.globaldata.seconds

      clearInterval(that.timer);
      that.timer = '';
      that.setData({
        billing: 'the trip duration is',
        buttonState: false
        //hours: currentH,
        //minutes: currentM,
        //seconds: currentS
      })
    }
  },

  // 携带定时器内容回到地图
  moveToIndex: function () {

    // 如果定时器为空
    if (this.timer == "") {
      // 关闭计费页跳到地图
      wx.redirectTo({
        url: '../index/index'
      })
    }
  }
})