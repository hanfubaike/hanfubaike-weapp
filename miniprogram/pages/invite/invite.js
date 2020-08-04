// miniprogram/pages/invite/invite.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
    const self = this
    app.checkLogin(self)
    this.inviteUser()
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let name = app.globalData.userInfo.name
      let nickName = app.globalData.userInfo.nickName
      name = name?`『${name}』` : nickName ?`『${nickName}』`:''
      console.log(res.target)
      return {
        title: name+'邀请你加入汉服百科第一期计划',
        path: `/pages/regUser/regUser?inviter=${name}&inviteCode=${this.inviteCode}`,
        imageUrl:"/res/map.jpg"
      }
    }
  },
  inviteUser(){
    wx.showNavigationBarLoading()
    let self = this
    //var alluserList = []
    wx.showLoading({
      title: '正在生成邀请码...',
      mask:true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'inviteUser',
      // 传给云函数的参数
      data: {
      },
    })
    .then(res => {
      wx.hideLoading()
      console.log(res.result)
      let inviteCode = res.result['_id']
      self.inviteCode = inviteCode
      console.log("成功生成邀请码 ",inviteCode)
      self.setData({
        inviteShow:true
      })
    })
    .catch(error =>{
      console.error(error)
      console.log("生成邀请码失败！")
      //app.showToast("向管理员发送通知失败！")
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},500)
    })
    
  },
})