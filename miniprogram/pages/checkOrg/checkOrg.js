import Toast from '../../vant-weapp/toast/toast';
import Notify from '../../vant-weapp/notify/notify';

const app = getApp()

Page({
  data: {
    value: '',
    reasonImageList: [],
    logoList:[],
    show: false,
    txtLenght:0,
    orgName:"",
    orgType: "",
    locationName: '',
    address: '',
    latitude: '',
    longitude: '',
    status:0,
    src: '',
    openid: '',
    dbName:'org',
    locationAddress:'',
    srcName:'',
    readonly:false,
    checker:''
 
  },
  title:"通知",
  checkText:"",
  tips:"",
  onClose() {
    this.setData({
      show: false
    });
  },
  onLoad(option){
    const self = this
    console.log(app.globalData)
    if (!app.checkAdmin()){
      return
    }
    this.option = option
    console.log(option)
    if (option.readonly == "true") {
      this.setData({
        readonly:true
      })
    }
    const id = this.option.id
    if (id){
      this.dbQuery(id,this.update)
    }

  },
  onShow(option){

    
  },

  dbAdd: function (data) {
    const db = wx.cloud.database()

    data['updateTime'] = db.serverDate()
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
  dbQuery: function (id,func) {
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    let field = {
      postTime:false
    }
    if (!this.data.readonly){
      field.status = false
    }
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection(this.data.dbName).doc(id).field(field).get({
      success: res => { 
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data){
          func(res.data)
        }else{
          
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
  },
  getUserName: function(openid){
    console.log(openid)
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    return db.collection('user').field({
        name: true
      }).where({
        openid: openid
      }).get()
  },
  dbUpdate(id,status,value=""){
    const self = this
    wx.showLoading({
      title: '提交中...',
      mask:true
    })

    wx.cloud.callFunction({
      // 云函数名称
      name: 'checkOrg',
      // 传给云函数的参数
      data: {
        id,
        status,
        value
      },
    })
    .then(res => {
      console.log(res)
      let thisTime = app.formatTime(new Date())
      if(res.result.ischeck){
        wx.showLoading({
          title: '正在发送审核通知...',
          mask:true
        })
        self.sendMsg("汉服百科管理员",self.title,thisTime,self.tips)
      }else{
        setTimeout(function () {
          wx.hideLoading()
        }, 200)
        wx.showModal({
          showCancel:false,
          title: '提示',
          content: res.result.msg,
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
        console.error('[数据库] [更新记录] 失败：', error)
      }

    })
    .catch(error =>{
      console.error(error)
      setTimeout(function () {
        wx.hideLoading()
      }, 200)
      wx.showModal({
        showCancel:false,
        title: '提示',
        content: "审核失败：未知错误"
      })
      console.error('[数据库] [更新记录] 失败：', error)
    })
    .finally(function(){
    })
  },
  async update(dataList){
    const data = dataList
    //console.log(data)
    let listData = []
    let listData2 = []
    let listData3 = []
    for (let x in data.logoList){
      listData.push({url:data.logoList[x]})
    }
    data.logoList = listData
    
    
    for (let x in data.reasonImageList){
      listData2.push({url:data.reasonImageList[x]})
    }
    data.reasonImageList = listData2

    for (let x in data.orgImageList){
      listData3.push({url:data.orgImageList[x]})
    }
    data.orgImageList = listData3
    if (this.data.readonly){
      let result = await this.getUserName(data.checkOpenid)
      if (result.data.length > 0){
        let userName = result.data[0].name
        data.checker = userName
      }
      data.checkStatus = data.status
    }

    delete data.status
    this.setData(
      data
    )
  },
  passed(checkText){
    const self = this
    this.title = "【"+ this.data.orgName.slice(0,13) +"】审核通过！"
    this.tips = "恭喜，你又为汉服百科添了一块砖啦!"
    wx.showModal({
      title: '审核确认',
      content: '确认【通过】吗？',
      success(res) {
        if (res.confirm) {
          self.dbUpdate(self.data._id, 1,checkText)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  getCheckText(){
  },
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e)
    if (e.type == "reset"){
      this.passed()
    }else{
      let value = e.detail.value.checkText
      value = value.replace(/\s*/g, "")
      if (!value || (value && value.length==0)){
        app.showToast("请填写审核说明")
        return
      }else if(value && value.length>20){
        app.showToast("审核说明不能超过20字")
      }
      else{
        this.noPassed(value)
      }
      
    }

  },
  noPassed(checkText){
    const self = this
    let value = checkText
    this.title = "【"+ this.data.orgName.slice(0,12) +"】审核未通过！"
    this.tips = value
    wx.showModal({
      title: '审核确认',
      content: '确认【拒绝】吗？',
      success(res) {
        if (res.confirm) {
          self.dbUpdate(self.data._id, -1,value)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  sendMsg(name,title,time,tips){
    const self = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'sendMsg',
      // 传给云函数的参数
      data: {
        openid: self.data._openid,
        page: "/pages/map/map",
        templateId:app.templateId,
        miniprogram_state:app.envVersion,
        lang: 'zh_CN',
        data:{
          name1: {
            value: name
          },
          thing2: {
            value: title
          },
          time3: {
            value: time
          },
          thing7: {
            value: tips
          }
        }
      },
    })
    .then(res => {
      console.log(res.result)
      if (res.result.errCode==0){
        app.showToast("已发送通知！","success")
      }else{
        app.showToast("通知发送失败！")
      }
    })
    .catch(error =>{
      console.error(error)
      app.showToast("通知发送失败！")
    })
    .finally(function(){
      
      setTimeout(function(){
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '审核成功，点击确定按钮返回上一页',
          success(res) {
            if (res.confirm) {
              wx.navigateBack()
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      },2000)
 
      
    })
  },
  txtInput(e){
    console.log(e)
    this.setData({
      txtLenght:e.detail.cursor
    })
  }

});