// pages/charge/charge.js
Page({
  data:{
    inputValue: 0
  },

  // 页面加载
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: 'Recharge Account'
    })
  },

  // 存储输入的充值金额
  bindInput: function(res){
    this.setData({
      inputValue: res.detail.value
    })  
  },

  // 充值
  recharge: function(){
    // 必须输入大于0的数字
    if(parseInt(this.data.inputValue) <= 0 || isNaN(this.data.inputValue)){
      wx.showModal({
        title: "Warning",
        content: "I need give you money ?",
        showCancel: false,
        confirmText: "NoNoNo",
        confirmColor: "#009922"
      })
    }
    else{
      wx.redirectTo({
        url: '../wallet/wallet',
        success: function(res){
          wx.showToast({
            title: "Recharge Successful",
            icon: "success",
            duration: 2000
          })
        }
      })
    }
  },

  // 页面销毁，更新本地金额，（累加）
  onUnload:function(){
    wx.getStorage({
      key: 'balance',
      success: (res) => {
        if(parseInt(this.data.inputValue) >= 0){
          wx.setStorage({
            key: 'balance',
            data: {
              balance: parseInt(this.data.inputValue) + parseInt(res.data.balance)
            }
          })
        }
      },
      // 如果没有本地金额，则设置本地金额
      fail: (res) => {
        if (parseInt(this.data.inputValue) >= 0){
          wx.setStorage({
            key: 'balance',
            data: {
              balance: parseInt(this.data.inputValue)
            },
          })
        }
      }
    }) 
  }
})