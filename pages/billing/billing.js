// pages/billing/billing.js
Page({
  data:{
    hours: 0,
    minutes: 0,
    seconds: 0,
    billing: "in Using"
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

  // 结束骑行，清除定时器
  endRide: function(){
    clearInterval(this.timer);
    this.timer = "";
    this.setData({
      billing: "the trip duration is",
      disabled: true
    })
  },

  // 携带定时器内容回到地图
  moveToIndex: function(){
    // 如果定时器为空
    if(this.timer == ""){
      // 关闭计费页跳到地图
      wx.redirectTo({
        url: '../index/index'
      })
    }
    // 保留计费页跳到地图
    else{
      wx.navigateTo({
        url: '../index/index?timer=' + this.timer
      })
    }
  }
})