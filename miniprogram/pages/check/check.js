// miniprogram/pages/person/check.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData:[
    ],
    dbName:'org'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    app.checkLogin()
    this.setData({
      listData:[]
    })
    this.dbQuery(this.update)
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
  update(data){
    let listData = []
    for (let x in data){
      let thisData = data[x]
      if (thisData.postTime){
        thisData.postTime = app.formatTime(thisData.postTime)
      }
      
      listData.push(thisData)
    }
    this.setData({
      listData:listData
    })
  },
  dbAdd: function (data) {
    const db = wx.cloud.database()
    let locationGeo = db.Geo.Point(this.data.longitude, this.data.latitude)
    data['longLatiute'] = locationGeo
    data['postTime'] = db.serverDate()
    db.collection(this.data.dbName).add({
      data: data,
      success: res => {
        wx.hideLoading()
        //在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1
        })
        wx.showModal({
          title: '提示',
          content: '提交成功，请等待管理员审核，点击确定按钮返回首页',
          success(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/map/map'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '提交失败！'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  dbQuery: function (func) {
    wx.showLoading({
      title: '正在读取',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection(this.data.dbName).field({
      orgName: true,
      poster:true,
      postTime:true,
    }).where({
      status: 0
    }).get({
      success: res => { 
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data.length!=0){
          func(res.data)
        }else{
          
          Notify("没有需要审核的组织")
        }
        
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      },
      complete:res => {
        setTimeout(function () {
          wx.hideLoading()
        }, 1000)
      }
    })
  }

})