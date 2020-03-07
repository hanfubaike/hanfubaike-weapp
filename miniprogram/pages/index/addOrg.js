import Toast from '../../vant-weapp/toast/toast';
import Notify from '../../vant-weapp/notify/notify';
var wxApi = require('../../utils/wxApi.js')
const wxRequest = require('../../utils/wxRequest.js');
const app = getApp()

Page({
  data: {
    value: '',
    showMask:false,
    loading:false,
    postType:'add',
    postFileList: [],
    logoFileList: [],
    show: false,
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
    locationInfo:'',
    srcName:'',
    width: 250,//宽度
    height: 250,//高度
    nameLabel:{
      orgName:"组织名称",
      orgType:"组织类型",
      locationName:"位置",
      locationInfo:"详细地址",
      orgInfo:"组织简介",
      contactName:"负责人",
      contactTel:"手机号",
      QQGroup:"QQ群",
      wxmp:"微信群",
      reason:"申请说明"
    },
   
  },
  uploadTasks:[],
  formData:{logoImageList:[],postImageList:[]},
  orgTypeList: ['社会组织','商业组织','汉服商家','大学组织','高中组织','初中组织'],

  onLoad(option){
    const self = this
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
    wx.getStorage({
      key: 'postData',
      success(res) {
        self.setData(
          res.data
        )
      }
    })
    //setInterval(this.autoSave,10000)
  },
  onShow(option){

    if (app.cropperImgUrl){
      this.setData({
        logoFileList:this.data.logoFileList.concat({url:app.cropperImgUrl})
      },
      function(){
        app.cropperImgUrl = ""
    },
      )
    }
  },
  autoSave(){
    wx.setStorageSync()
  },
  dbAdd: function (data) {
    const db = wx.cloud.database()
    let locationGeo = db.Geo.Point(this.data.longitude, this.data.latitude)
    data['longLatiute'] = locationGeo
    data['postTime'] = db.serverDate()
    db.collection(this.data.dbName).add({
      data: data,
      success: res => {
        //setTimeout(function () {
          //wx.hideLoading()
        //}, 2000)
        //在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
        })
        //app.showToast("提交成功","success")
        wx.showLoading({
          title: '提交成功，正在跳转...',
          mask:true
        })
        wx.navigateTo({
          url: '/pages/msg/msg_success?title=提交成功&msg=等待管理员审核。请点击下方的确定按钮订阅通知消息，审核通过后我们会第一时间通知你。&btText=确定&SubscribeMessage=true',
        })
        //wx.showModal({
          //title: '提示',
          //content: '提交成功，请等待管理员审核，点击确定按钮返回首页',
          //success(res) {
            //if (res.confirm) {
             // wx.redirectTo({
               // url: 'map'
             // })
           // } else if (res.cancel) {
              //console.log('用户点击取消')
            //}
          //}
        //})
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
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
      title: '正在检查',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection(this.data.dbName).field({
      orgName: true
    }).where({
      orgName: this.formData.orgName
    }).get({
      success: res => { 
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data.length!=0){
          app.showToast("组织名称已存在，请重新输入")
        }else{
          func()
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
        ////setTimeout(function () {
          //wx.hideLoading()
       // }, 1)
      }
    })
  },

  orgClick() {
    const self = this
    wx.showActionSheet({
      itemList: self.orgTypeList,
      success (res) {
        console.log(res.tapIndex)
        self.setData({
          orgType:self.orgTypeList[res.tapIndex]
        })
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let postData = {}
    let formData = e.detail.value
    postData = Object.assign(postData,formData)
    postData['latitude'] = this.data.latitude
    postData['longitude'] = this.data.longitude
    postData['logoFileList'] = this.data.logoFileList
    postData['postFileList'] = this.data.postFileList
    //postData['postType'] =  this.data.postType
    wx.setStorageSync('postData', postData)
    this.formData = formData
    this.dbQuery(this.checkFormData)

  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  postForm:function(){
    
  },
  checkFormData(){
    let ignoreList = ['wxmp','locationInfo']
    let formData = this.formData
    let nameLabel = this.data.nameLabel
    if (this.data.logoFileList.length==0){
      app.showToast("请上传【LOGO】")
      return
    }
    if (this.data.postFileList.length == 0) {
      app.showToast("请上传【证明材料】")
      return
    }
    if (!this.data.latitude || !this.data.longitude){
      app.showToast("请选择位置")
      return
    }
    for (let x in formData){
      let value = formData[x]
      if (x in ignoreList){
        continue
      }
      if (!value){
        app.showToast("请填写【" + nameLabel[x] + "】")
        return
      }else{
        value = value.replace(/\s*/g, "")
        if (value.length == 0){
          app.showToast("请填写【" + nameLabel[x] + "】")
        return
        }
      }
    }
    this.uploadFiles(formData.orgName)
  },
  chooseLocation: function () {
    let self = this
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        self.setData({
          locationName: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        })

      }
    })
  },
  beforeRead(event) {
    const {
      file,
      name
    } = event.detail;

    if (name == 'logo'){
      //getCurrentPages().slice(-1)
      wx.navigateTo({
        url: '../cropper/cropper?name=logo&url='+file.path,
      })
    }else{
      this.setData({
        postFileList: this.data.postFileList.concat({url:file.path})
      });
    }

  },

  delete(event) {
    const { index, name } = event.detail;
    let fileListName = 'postFileList'
    if (name == "logo"){
      fileListName = 'logoFileList'
    }
    const postFileList = this.data[`${fileListName}`];
    postFileList.splice(index, 1);
    this.setData({ [`${fileListName}`]: postFileList });
  },

  imageName:function(name, filePath, index, postFileList){
    let loc = postFileList.length == 1 ? '' : "-" + index
    const cloudPath = "orgReg/" + name + loc + filePath.match(/\.[^.]+?$/)[0]
    return cloudPath
  },
  uploadfile(fileList,fileListName,filename){
    const self = this
    let uploadTasks = []
    for (let x in fileList){
      let filePath = fileList[x].url
      let cloudPath = this.imageName(filename, filePath, x, fileList)
      uploadTasks.push(new Promise(function (resolve, reject){
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath
        }).then(res => {
          console.log(res.fileID)
          return resolve(res.fileID);
          //wx.showToast({ title: '上传成功', icon: 'none' });
        }).catch(error => {
          setTimeout(function () {
            wx.hideLoading()
          }, 1000)
          wx.showToast({ title: '上传失败', icon: 'none' });
          return error;
        })
      }))
    }
    return uploadTasks
  },
  uploadFiles(orgName){
    let logoFileList = this.data.logoFileList
    let postFileList = this.data.postFileList
    const self = this
    let name = orgName + "-apply"
    let logoName = orgName + "-logo"
    wx.showLoading({
      title: "正在上传LOGO...",
      mask:true
    })
    let uploadTasks = this.uploadfile(logoFileList, "logoImageList",logoName)
    Promise.all(uploadTasks).then(function (values) {
      console.log(values);
      let newFileList = values.map((v,k) => v.fileID)
      self.formData["logoImageList"] = newFileList
      wx.showLoading({
        title: "正在上传图片...",
        mask:true
      })
      self.uploadTasks = []
      let uploadTasks = self.uploadfile(postFileList, "postImageList",name)
      Promise.all(uploadTasks).then(function (values) {
        console.log(values);
        let newFileList = values.map((v,k) => v.fileID)
        self.formData["postImageList"] = newFileList
        self.formData['postType'] =  self.data.postType
        //注册状态，0：待审核，-1：审核未通过，1：审核通过
        self.formData['status'] = 0
        wx.showLoading({
          title: "正在提交数据",
          mask:true
        })
        self.dbAdd(self.formData)
      }).catch(reason => {
        console.log(reason)
      });
    }).catch(reason => {
      console.log(reason)
    });
   

    
    

  },

  postBt(e){
    //console.log(e)
  }

});