// pages/wallet/index.js
Page({
  data:{
    balance: 0,
    deposit: 99
  },

  // 页面加载
  onLoad:function(options){
     wx.setNavigationBarTitle({
       title: 'My Wallet'
     })
  },

  // 页面加载完成，更新本地存储的balance
  onReady:function(){
     wx.getStorage({
      key: 'balance',
      success: (res) => {
        this.setData({
          balance: res.data.balance
        })
      }
    })
  },

  // 页面显示完成，获取本地存储的balance
  onShow:function(){
    wx.getStorage({
      key: 'balance',
      success: (res) => {
        this.setData({
          balance: res.data.balance
        })
      }
    }) 
  },

  // // 押金退还
  // refundDeposit: function () {
  //   wx.showModal({
  //     title: "sure to refund ?",
  //     content: "after refund，you can't use bike-sharing service",
  //     cancelText: "Continue to use",
  //     cancelColor: "#009933",
  //     confirmText: "Refund deposit",
  //     confirmColor: "#cc3300",
  //     success: (res) => {
  //       if (res.confirm) {

  //         this.setData({
  //           deposit: 0
  //         })

  //         wx.showToast({
  //           title: "Refund successful",
  //           icon: "success",
  //           duration: 2000
  //         })
  //       }
  //     }
  //   })
  // },

  // 跳转到充值页面
  movetoRecharge: function(){
    // 关闭当前页面，跳转到指定页面，返回时将不会回到当前页面
    wx.redirectTo({
      url: '../charge/charge'
    })
  }

})