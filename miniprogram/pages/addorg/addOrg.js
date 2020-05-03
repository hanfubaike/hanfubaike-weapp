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
    postType:'新增',
    sizeType:['compressed'],
    reasonFileList: [],
    logoFileList: [],
    orgImageFileList:[],
    show: false,
    orgName:"",
    orgType: "",
    locationName: '',
    locationAddress: '',
    latitude: '',
    longitude: '',
    status:0,
    src: '',
    openid: '',
    dbName:'org',
    longlatstr:'',
    srcName:'',
    autosize:{ maxHeight: 300, minHeight: 50 },
    width: 250,//宽度
    height: 250,//高度
    nameLabel:{
      orgName:"组织名称",
      orgType:"组织类型",
      longlatstr:"位置",
      locationAddress:"详细地址",
      orgDesc:"组织简介",
      contactName:"负责人",
      contactTel:"手机号",
      QQGroup:"QQ群",
      wxmp:"微信公众号",
      reason:"申请说明"
    },
   
  },
  lastSaveTime:0
  ,
  uploadTasks:[],
  formData:{logoList:[],reasonImageList:[],orgImageList:[]},
  orgTypeList: ['社会组织','商业组织','汉服商家','大学组织','高中组织','初中组织'],

  onLoad(option){
    const self = this
    app.checkLogin()
    let fs = wx.getFileSystemManager();
    wx.getStorage({
      key: 'formData',
      success(res) {
        let logoFileList = res.data.logoFileList || []
        let reasonFileList = res.data.reasonFileList || []
        let orgImageFileList = res.data.orgImageFileList || []
        let saveTime = res.data.saveTime || new Date()
        let fileList = logoFileList.concat(reasonFileList).concat(orgImageFileList)
        //如果超过7天，则不载入表单。
        //if (new Date() - saveTime > 1000*60*60*24*7){}
        wx.showModal({
          title: '提示',
          content: '是否载入上次的表单？',
          success (tipres) {
            if (tipres.confirm) {
              console.log('用户点击确定，载入表单')
              for (let x in fileList){
                let url = fileList[x].url
                try{
                  fs.accessSync(url)
                }
                catch (err){
                  //console.log(err)
                  console.log("文件已过期")
                  res.data.logoFileList = []
                  res.data.reasonFileList= []
                  res.data.orgImageFileList=[]
                  break
                }
              }
              self.setData(res.data)
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
    //setInterval(this.autoSave,10000)
  },
  onShow(option){
    if (app.cropperImg.url){
      let fileName = app.cropperImg.fileName
      this.setData({
        [`${fileName}`]:this.data[`${fileName}`].concat({url:app.cropperImg.url})
      },
      function(){
        app.cropperImg = {}
    },
      )
    }
  },
  autoSave(){
    this.formData['latitude'] = this.data.latitude
    this.formData['longitude'] = this.data.longitude
    this.formData['logoFileList'] = this.data.logoFileList
    this.formData['orgImageFileList'] = this.data.orgImageFileList
    this.formData['reasonFileList'] = this.data.reasonFileList
    this.formData['saveTime'] = new Date()
    wx.setStorage({
      key:'formData',
      data:this.formData
    })
  },
  dbAdd: async function (data) {
    const db = wx.cloud.database()
    let locationGeo = db.Geo.Point(this.data.longitude, this.data.latitude)
    data['longLatiute'] = locationGeo
    data['postTime'] = db.serverDate()
    let dbres = {}
    try{
       dbres = await db.collection(this.data.dbName).add({
        data: data,
      })
      console.log('[数据库] [新增记录] 成功，记录 _id: ', dbres._id)
      this.setData({
        counterId: dbres._id,
      })
      return true

    }catch(err){
      console.error('[数据库] [新增记录] 失败：', err)
      return false
    }

  },
  dbQuery:function () {
    console.log("正在查询数据库..")
    wx.showLoading({
      title: '正在检查',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    return db.collection(this.data.dbName).field({
        orgName: true
      }).where({
        orgName: this.formData.orgName
      }).get()
  },

  orgClick() {
    const self = this
    wx.showActionSheet({
      itemList: self.orgTypeList,
      success (res) {
        //console.log(res.tapIndex)
        self.setData({
          orgType:self.orgTypeList[res.tapIndex]
        })
        self.formData['orgType'] = self.orgTypeList[res.tapIndex]
        self.autoSave()
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let formData = e.detail.value
    let self = this
    formData["poster"] = app.globalData.userInfo.nickName
    this.formData = formData
    this.autoSave()
    if (!this.postForm()){
      console.error("提交失败")
      wx.showToast({
        icon: 'none',
        title: '提交失败！'
      })
    }

  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  postForm: async function(){
    let self = this
    let dbres = {}
    try{
      dbres = await this.dbQuery()
      console.log('[数据库] [查询记录] 成功: ', dbres)
    }catch (err) {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
      return
    }
    if (dbres.data.length!=0){
      app.showToast("组织名称已存在，请重新输入")
      return
    }
    if (!this.checkFormData()){
      return
    }
    let uploadRes = await this.uploadFiles(self.formData.orgName)
    if (!uploadRes){
      return
    }

    if (await self.dbAdd(self.formData)){
        //setTimeout(function () {
          //wx.hideLoading()
        //}, 2000)
        //在返回结果中会包含新创建的记录的 _id

        //app.showToast("提交成功","success")
        //setTimeout(function () {
          //wx.showLoading({
            //title: '正在向管理员发送通知...',
            //mask:true
          //})
        //}, 1500)
        app.showToast("提交成功","success")
        setTimeout(function(){
          wx.showLoading({
            title: '正在跳转...',
            mask:true
          })
        },1000)
        await this.sendEmailToAdmin()
        setTimeout(function(){
          wx.hideLoading()
          wx.navigateTo({
            url: '/pages/msg/msg_success?title=提交成功&msg=等待管理员审核。请点击下方的确定按钮订阅通知消息，审核通过后我们会第一时间通知你，如长时间没有审核，请通过邮件联系我们：&msgLink=hanfubaike@163.com&btText=确定&SubscribeMessage=true',
          })
        },2000)
        


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
    }
  },
  checkFormData(){
    console.log("开始检查数据")
    let ignoreList = ['wxmp','latitude','longitude','logoFileList','orgImageFileList','reasonFileList']
    let formData = this.formData
    let nameLabel = this.data.nameLabel
    if (this.data.logoFileList.length==0){
      //app.showToast("请上传【LOGO】")
      //return
    }
    if (this.data.orgImageFileList.length==0){
      //app.showToast("请上传【照片墙】")
      //return
    }
    
    if (this.data.reasonFileList.length == 0) {
      app.showToast("请上传【证明材料】")
      return false
    }
    if (!this.data.latitude || !this.data.longitude){
      app.showToast("请先点击按钮选取位置")
      return false
    }
    for (let x in formData){
      let value = formData[x]
      if (ignoreList.indexOf(x) > -1){
        continue
      }
      if (!value){
        app.showToast("请填写【" + nameLabel[x] + "】")
        return false
      }else{
        value = value.toString().replace(/\s*/g, "")
        if (value.length == 0){
          app.showToast("请填写【" + nameLabel[x] + "】")
          return false
        }
      }
    }
    return true
    
  },
  chooseLocation: function () {
    let self = this
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        self.setData({
          locationAddress: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          longlatstr:res.longitude + ' , ' + res.latitude
        })
        self.autoSave()
      }
    })
  },
  afterRead(event) {
    const {
      file,
      name
    } = event.detail;

    if (name == 'logo'){
      //getCurrentPages().slice(-1)
      wx.navigateTo({
        url: '../cropper/cropper?fileName=logoFileList&export_scale=1&url='+file.path,
      })
    }else if(name == 'orgImage'){
      //wx.navigateTo({
        //url: '../cropper/cropper?ratio=16.9&fileName=orgImageFileList&export_scale=2&url='+file.path,
      //})
      let orgImageFileList = []
      for(let x in file){
        orgImageFileList.push({url:file[x].path})
      }
      this.setData({
       orgImageFileList: orgImageFileList
      });
    }
    else{
      this.setData({
        reasonFileList: this.data.reasonFileList.concat({url:file.path})
      });
    }

  },

  delete(event) {
    const { index, name } = event.detail;
    let fileListName = 'reasonFileList'
    if (name == "logo"){
      fileListName = 'logoFileList'
    }else if(name == "orgImage"){
      fileListName = 'orgImageFileList'
    }
    const fileList = this.data[`${fileListName}`];
    fileList.splice(index, 1);
    this.setData({ [`${fileListName}`]: fileList });
  },

  imageName:function(name, filePath, index, fileList){
    let loc = fileList.length == 1 ? '' : "-" + index
    const cloudPath = "orgReg/" + name + loc + filePath.match(/\.[^.]+?$/)[0]
    return cloudPath
  },
  uploadfile(fileList,fileListName,fileName){
    const self = this
    let uploadTasks = []
    for (let x in fileList){
      let filePath = fileList[x].url
      let cloudPath = this.imageName(fileName, filePath, x, fileList)
      uploadTasks.push(new Promise(function (resolve, reject){
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath
        }).then(res => {
          //console.log(res.fileID)
          return resolve({url:res.fileID,fileName:fileListName});
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
  async uploadFiles(orgName){
    let logoFileList = this.data.logoFileList
    let reasonFileList = this.data.reasonFileList
    let orgImageFileList = this.data.orgImageFileList
    let uploadTasks = []
    const self = this
    let name = orgName + "-apply"
    let logoName = orgName + "-logo"
    let orgImageName = orgName + "-orgImage"
    console.log("正在上传图片")
    wx.showLoading({
      title: "正在上传图片...",
      mask:true
    })
    uploadTasks = uploadTasks.concat(self.uploadfile(logoFileList, "logoList",logoName))
    uploadTasks = uploadTasks.concat(self.uploadfile(reasonFileList, "reasonImageList",name))
    uploadTasks = uploadTasks.concat(self.uploadfile(orgImageFileList, "orgImageFileList",orgImageName))
    console.log(uploadTasks)
    let logoList =[]
    let orgImageList = []
    let reasonImageList = []
    try {
      const values = await Promise.all(uploadTasks);
      console.log('图片上传成功！', values);
      for (let x in values) {
        let fileName = values[x].fileName;
        let url = values[x].url;
        switch (fileName) {
          case "logoList":
            logoList.push(url);
            break;
          case "orgImageFileList":
            orgImageList.push(url);
            break;
          case "reasonImageList":
            reasonImageList.push(url);
            break;
        }
      }
      self.formData["logoList"] = logoList;
      self.formData["orgImageList"] = orgImageList;
      self.formData["reasonImageList"] = reasonImageList;
      self.formData['postType'] = self.data.postType;
      //注册状态，0：待审核，-1：审核未通过，1：审核通过 
      self.formData['status'] = 0;
      return true;
    }
    catch (reason) {
      console.log(reason);
      app.showToast("上传图片失败！");
      return false;
    }

  },

  postBt(e){
    //console.log(e)
  },
  sendEmail(from,title,to,cc,text){
    const self = this
    return wx.cloud.callFunction({
      // 云函数名称
      name: 'sendEmail',
      // 传给云函数的参数
      data: {
        from: from,
        title:title,
        to:to,
        cc:cc,
        text: text,
      },
    })
    .then(res => {
      console.log(res.result)
      console.log("发送邮件成功")
      //app.showToast("已向管理员发送通知！","success")
    })
    .catch(error =>{
      console.error(error)
      console.log("发送邮件失败")
      //app.showToast("向管理员发送通知失败！")
    })
    .finally(function(){
      
    })
  },
   async sendEmailToAdmin(){
    let orgName = this.formData.orgName
    let from = {
      name: "汉服百科",
      address: "hanfubaike@163.com"
      }
    let title = "新增组织『" + orgName +"』需要审核，请及时查看。"
    let to = [{
      name: "汉服百科管理组",
      address: "hanfubaike@qq.com"
      }]
    let cc = {
      name: "汉服百科",
      address: "hanfubaike@163.com"
      }
    let text = "新增组织『" + orgName +"』需要审核，申请人：" + this.formData["poster"] + "，请打开小程序进行查看！"
    
    const db = wx.cloud.database()
    const dbCommand = db.command
    let dbres = {}
    //查询当前用户所有的 counters

    function getAdmiEmail(){
      //email: dbCommand.exists(true),
      try{
         return db.collection('user').field({
          openid:false
        }).where({
          isAdmin:true
        }).get()
        
      }catch(err){
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      } 
    }
    dbres = await getAdmiEmail()
    if (!dbres){
      return
    }
    console.log('[数据库] [查询记录] 成功: ', dbres)
    if (dbres.data.length != 0){
      for (let x in dbres.data){
        if (!dbres.data[x].name || !dbres.data[x].email){
          continue
        }
        to.push(
          {name: dbres.data[x].name,
            address: dbres.data[x].email}
        )
      }
    }
    await this.sendEmail(from,title,to,cc,text)
    
  },
  inputChage(e){
    //console.log(e)
    let _id = e.currentTarget.id
    this.formData[_id] = e.detail
    //如果距离上次保存时间超过指定时间（微秒），则保存。
    if (new Date() - this.lastSaveTime > 10000){
      console.log(e)
      this.autoSave()
      if (this.lastSaveTime==0){
        Notify({ type: 'success', message: '已开启自动保存' });
      }
      this.lastSaveTime = new Date()
      console.log("表单已自动保存")

    }

  }

});