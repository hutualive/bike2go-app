// pages/user/user.js
Page({
  data:{
    // 用户信息
    userInfo: {
      avatarUrl: "",
      nickName: "Logoff"
    },
    bType: "primary",    // 按钮类型
    actionText: "Login",   // 按钮文字提示
    lock: false          //登录按钮状态，false表示未登录
  },

  // 页面加载
  onLoad:function(){
    // 设置本页导航标题
    wx.setNavigationBarTitle({
      title: 'User Account'
    })
    // 获取本地数据-用户信息
    wx.getStorage({
      key: 'userInfo',
      // 能获取到则显示用户信息，并保持登录状态，不能就什么也不做
      success: (res) => {
        wx.hideLoading();
        this.setData({
          userInfo: {
            avatarUrl: res.data.userInfo.avatarUrl,
            nickName: res.data.userInfo.nickName
          },
          bType: res.data.bType,
          actionText: res.data.actionText,
          lock: true
        })
      }
    });
  },

  // 登录或退出登录按钮点击事件
  bindAction: function(){
    this.data.lock = !this.data.lock
    // 如果没有登录，登录按钮操作
    if(this.data.lock){
      wx.showLoading({
        title: "Login"
      });
      wx.login({
        success: (res) => {
          wx.hideLoading();
          wx.getUserInfo({
            withCredentials: false,
            success: (res) => {
              this.setData({
                userInfo: {
                  avatarUrl: res.userInfo.avatarUrl,
                  nickName: res.userInfo.nickName
                },
                bType: "warn",
                actionText: "Logoff"
              });

              // 存储用户信息到本地
              wx.setStorage({
                key: 'userInfo',
                data: {
                  userInfo: {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  },
                  bType: "warn",
                  actionText: "Logoff"
                },
                success: function(res){
                  console.log("Stored Succeful")
                }
              })
            }     
          })
        }
      })     
    }
    // 如果已经登录，点击退出登录按钮的操作
    else{
      wx.showModal({
        title: "Confirm to logoff ?",
        content: "Can't use bike-sharing service after your logoff",
        success: (res) => {
          if(res.confirm){
            console.log("Confirm")
            // 退出登录则移除本地用户信息
            wx.removeStorageSync('userInfo')
            this.setData({
              userInfo: {
                avatarUrl: "",
                nickName: "Logoff"
              },
              bType: "primary",
              actionText: "Login"
            })
          }
          else {
            console.log("Cancel")
            this.setData({
              lock: true
            })
          }
        }
      })
    }   
  },

  // 跳转至钱包
  movetoWallet: function(){
    wx.navigateTo({
      url: '../wallet/wallet'
    })
  }
})