// miniprogram/pages/me/inviteUser/inviteUser.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  name:"",

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let inviter = options.inviter
    let inviteCode = options.inviteCode
    this.setData({
      inviter
    })
    this.inviteCode = inviteCode
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  agreeGetUser: function (e) {
    if(!this.name){
      wx.showToast({
        title:"雅号不能为空！",
        icon:"none"
      })
      this.setData({
        error:true
      })
      return
    }
    let userInfo = e.detail.userInfo;
    userInfo.inviteCode = this.inviteCode
    if (!userInfo.inviteCode){
      wx.showModal({
        showCancel:false,
        title: '提示',
        content: '邀请码不能为空！',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '/pages/map/map',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    let self = this;
    console.log(userInfo)
    if (userInfo) {
      setTimeout(function () {
        self.setData({ isLoginPopup: false })
      }, 1000);
      app.setUserInfo(userInfo,self)
      self.addUser(userInfo)
    }
  },
  addUser: function (userInfo) {
    //访问网络
    let tips = ""
    let nameExists = false
    userInfo.name = this.name
    wx.showNavigationBarLoading()
    let self = this
    //var alluserList = []
    wx.showLoading({
      title: '正在提交...',
      mask:true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'addUser',
      // 传给云函数的参数
      data: {userInfo:userInfo
      },
    })
    .then(res => {
      console.log(res.result)
      if(res.result.status==true){
        tips = res.result.msg
        console.log(tips)
      }else{
        if(res.result.exists){
          nameExists = true
        }
        tips = "注册失败！错误："+ res.result.msg
        console.error(tips)
      }
    })
    .catch(error =>{
      tips = "注册失败！错误："+error
      console.error(tips)
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},10)
      wx.showModal({
        showCancel:false,
        title: '提示',
        content: tips,
        success (res) {
          if (res.confirm && !nameExists) {
            console.log('用户点击确定')
            wx.reLaunch({
              url: '/pages/map/map',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })   
    })
  },
  inputChage(e){
    console.log(e)
    if(this.data.error){
      this.setData({
        error:false
      })
    }
    let value = e.detail
    this.name = value
  }
})