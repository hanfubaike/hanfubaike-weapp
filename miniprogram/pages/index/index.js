// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:"https://hanfu.wiki"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.reLaunch({
      //url: '/pages/map/map'
    //})
    wx.showLoading({
      title: '正在加载...',
      mask:true
    })
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
  
  onShareAppMessage: function(options) {
    let self = this;
    let url = ''
    let webViewUrl = options.webViewUrl;
    url = '/pages/webpage/webpage?url=' + encodeURIComponent(webViewUrl);
    console.log(url);
    return {
      title: self.data.title||"",
      //path: '/pages/map/map?path=' + encodeURIComponent(url),
      path: url,
      success: function(res) {
        // 转发成功
        console.log(url);
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onShareTimeline(){
    let self = this;
    let webViewUrl = options.webViewUrl;
    let url = '/pages/webpage/webpage?url=' + encodeURIComponent(webViewUrl);
    return {
      title: self.data.title||"",
      //path: '/pages/map/map?path=' + encodeURIComponent(url),
      success: function(res) {
        // 转发成功
        console.log(url);
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  webLoad(e){
    wx.showNavigationBarLoading()
    setTimeout(function(){
      wx.hideNavigationBarLoading()
      wx.hideLoading()},500)
  }
})