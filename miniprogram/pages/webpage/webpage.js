
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: null,
    title: "",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var title = ""
    var self = this;
    //console.log(options);
    if (options.url != null) {
      wx.showLoading({
        title: '正在加载...',
        mask:true
      })
      wx.showNavigationBarLoading()
      var url = decodeURIComponent(options.url);
      var url = decodeURIComponent(url);
      console.log(url);
      if (options.title != null) {
        title = decodeURIComponent(options.title)
      }
      self.setData({
          url: url,
          title: title
        },
        function() {
          setTimeout(function(){
            wx.hideNavigationBarLoading()
            wx.hideLoading()},1500)
        })


    } else {
    }

  },

  recvMessage: function(e) {
    console.log('收到网页消息', e)
    if (e.detail.data[0].type == "title") {
      this.setData({
        title: e.detail.data[0].data
      })
    } else {
      var cookieStr = ''
      for (var x in e.detail.data[0].data) {
        var item = x + '=' + encodeURIComponent(e.detail.data[0].data[x])
        cookieStr += item + ';'
      }
      var userInfo = e.detail.data[0].data
      app.globalData.userInfo = util.mergeJsonObject(app.globalData.userInfo, userInfo)
      if (userInfo.logourlstr && userInfo.username) {
        app.globalData.userInfo.avatarUrl = decodeURIComponent(userInfo.logourlstr).replace("\n", "")
        app.globalData.userInfo.nickName = decodeURIComponent(userInfo.username)

      }
      wx.setStorageSync('globalData', app.globalData)
      console.log('cookies', cookieStr)
      app.cookieStore.setCookies('hanfuditu.com', cookieStr)
      app.updateUserInfo()
    }

  },

  onShareAppMessage: function(options) {
    var self = this;
    var url = ''
    var webViewUrl = options.webViewUrl;
    url = '/pages/webpage/webpage?url=' + encodeURIComponent(webViewUrl);
    console.log(url);
    return {
      title: self.data.title,
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
  }
})