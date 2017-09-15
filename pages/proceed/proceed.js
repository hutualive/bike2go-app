// pages/proceed/proceed.js
Page({
  data:{
    time: 9
  },

  // 页面加载
  onLoad:function(options){
    // 获取Bike_ID
    this.setData({
      bike_id: options.bike_id
    })

    // 设置初始计时秒数
    let time = 9;
    // 开始定时器
    this.timer = setInterval(() => {
      this.setData({
        time: -- time
      });

      // 读完秒后携带单车号码跳转到计费页
      if(time < 0){
        clearInterval(this.timer)
        wx.redirectTo({
          url: '../billing/billing?bike_id=' + options.bike_id
        })
      }
    },1000)
  },

  // // 点击报障
  // moveToError: function(){
  //   clearInterval(this.timer)
  //   wx.redirectTo({
  //     url: '../index/index'
  //   })
  // }
})