//index.js
var util = require('../../utils/util.js');
var app = getApp();
var nowTime = new Date().getTime()

Page({
  data: {
    readLogs: [],
    logged: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tab: '1',
    showerror: "none",
    shownodata: "none",
    subscription: "",
    userInfo: app.globalData.userInfo,
    isLoginPopup: false,
    showCheck:false
  },


  onLoad: function (options) {
    var self = this;
    

  },
  addOrg(){
    navigateTo({
      url:"../../index/addOrg"
    })
  },
  agreeGetUser: function (e) {
    var userInfo = e.detail.userInfo;
    var self = this;
    console.log(userInfo)
    if (userInfo) {
      app.getUserInfo(null, self);
      self.setData({ 
        userInfo: userInfo,
        logged: true
      });

      wx.navigateBack({
        
      })
     // wx.reLaunch({
        //url: url + "?" + query,
      //})
      setTimeout(function () {
        self.setData({ isLoginPopup: false })
      }, 1200);
    }
  }
  ,
  getUserInfo(){
    if (app.globalData.userInfo.openid && app.globalData.userInfo.nickName){
      return
    }
    const self = this
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo)
              app.globalData.userInfo = res.userInfo
              self.setData({
                userInfo: app.globalData.userInfo,
                logged:true
              })
              wx.setStorageSync('globalData', app.globalData)
              self.getOpenid()
            }
          })
        }
      }
    })
  }  
  ,
  getOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        let openid = res.result.openid
        app.globalData.userInfo.openid = openid
        this.setData({
          "userInfo.openid":openid
        })
        this.isAdmin()
        wx.setStorageSync('globalData', app.globalData)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  isAdmin(){
    
    if (app.isAdmin()){
      this.setData({showCheck:true})
    }
  },
  onShow: function () {
    //console.log('onShow')
    var self = this;
    if (app.globalData.userInfo.openid && app.globalData.userInfo.nickName) {
      self.setData({
        userInfo: app.globalData.userInfo,
        logged: true
      })
      this.isAdmin()
    }
    else {
      self.setData({
        showLogin:true
      })
      self.getUserInfo()
    }
    
  },

  onUnload: function () {
    console.log('onUnload')
    //this.onLoad()
  },


  myOrg(e) {
    //var url = '../webpage/webpage';
    //wx.navigateTo({
     // url: url + '?url=' + app.WEBVIEWURL + '/publish_activity.html'
    //})
    //this.getmyOrgList()
    var self = this
    if (!self.data.logged){
      console.log('没有登陆,跳转登陆');
      wx.navigateTo({
        url: "openAuth?openWeb=true&backPage=" + encodeURIComponent(self.route)
      })
    }
    wx.navigateTo({
      url: 'myOrg'
    })
  },
  tongzhi:function(){
    wx.navigateTo({
      url: 'web?url=' + encodeURIComponent(app.WEBVIEWURL + '/lists.html?type=notice'),
    })
  },
  modify_personinfo: function (e) {
    var url = '/modify_personinfo.html?backurl=auth.html&rand=' + app.VERSION
    if (!this.data.logged){
      url = '/auth.html?rand=' + app.VERSION
    }
    wx.navigateTo({
      url: 'web?url=' + encodeURIComponent(app.WEBVIEWURL + url)
     })
   },
  previewImg: function () {
    wx.previewImage({
      current: this.data.imgUrl,
      urls: [this.data.imgUrl]
    })
  },
  onShareAppMessage: function () {
    return {
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  addOrg(e){
    wx.navigateTo({
      url: '/pages/index/addOrg',
    })
  }
})
