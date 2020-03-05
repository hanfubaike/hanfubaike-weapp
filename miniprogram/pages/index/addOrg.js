import Toast from '../../vant-weapp/toast/toast';
import Notify from '../../vant-weapp/notify/notify';

const app = getApp()

Page({
  data: {
    value: '',
    showMask:false,
    loading:false,
    formData:{},
    postType:'add',
    postFileList: [],
    logoFileList: [],
    postImageList:[],
    logoImageList:[],
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
    dbName:'baike',
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
    actions: [{
      name: '社会组织'
    },
    {
      name: '商业组织'
    },
    {
      name: '汉服商家'
    },
    {
      name: '大学组织'
    },
    {
      name: '高中组织'
    },
    {
      name: '初中组织'
    },
    ],
  },
  onClose() {
    this.setData({
      show: false
    });
  },
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
        console.log(res.data)
        self.setData(
          res.data
        )
      }
    })
    //setInterval(this.autoSave,10000)
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
                url: 'map'
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
      title: '正在检查',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection('baike').field({
      orgName: true
    }).where({
      orgName: this.data.formData.orgName
    }).get({
      success: res => { 
        if (res.data.length!=0){
          Notify("组织名称已存在，请重新输入")
        }else{
          func()
        }
        console.log('[数据库] [查询记录] 成功: ', res)
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

  showPopup() {
    this.setData({
      show: true
    });
  },
  onSelect(event) {
    this.setData({
      orgType: event.detail.name
    })
    console.log(event.detail);
  },
  orgClick() {
    this.setData({
      show: true
    });
  },
  loadimage(e) {
    console.log("图片加载完成", e.detail);
    wx.hideLoading();
    //重置图片角度、缩放、位置
    this.cropper.imgReset();
  },
  submit() {
    this.setData({
      showMask: false
    })
    this.cropper.getImg((obj) => {
     let imgSrc = obj.url;
     this.afterCropper(this.data.srcName,imgSrc)
    });
  },
  back(){
    this.setData({
      showMask:false
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
    this.setData({formData: formData})
    this.dbQuery(this.checkFormData)

  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  postForm:function(){
    
  },
  checkFormData(){
    let ignoreList = ['wxmp','locationInfo']
    let formData = this.data.formData
    let nameLabel = this.data.nameLabel
    if (this.data.logoFileList.length==0){
      Notify("请上传【LOGO】")
      return
    }
    if (this.data.postFileList.length == 0) {
      Notify("请上传【证明材料】")
      return
    }
    if (!this.data.latitude || !this.data.longitude){
      Notify("请选择位置")
      return
    }
    for (let x in formData){
      let value = formData[x]
      if (x in ignoreList){
        continue
      }
      if (!value){
        Notify("请填写【" + nameLabel[x] + "】")
        return
      }else{
        value = value.replace(/\s*/g, "")
        if (value.length == 0){
          Notify("请填写【" + nameLabel[x] + "】")
        return
        }
      }
    }
    this.uploadToCloud(this.data.postFileList, formData.orgName)
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
  afterRead(event) {
    const {
      file,
      name
    } = event.detail;
    //获取到image-cropper实例
    this.cropper = this.selectComponent("#image-cropper");
    console.log(file)
    if (name == 'logo'){
      //开始裁剪
      this.setData({
        showMask: true,
        src: file.path,
        srcName: name
      });
      wx.showLoading({
        title: '加载中'
      })
    }else{
      this.setData({
        postFileList: this.data.postFileList.concat({url:file.path})
      });
    }

  },
  afterCropper(srcName, filePath){
    let fileData = { url: filePath, name: srcName}
    if (srcName == "logo") {
      const logoFileList = this.data.logoFileList;
      this.setData({
        logoFileList: logoFileList.concat(fileData)
      });
    } else {
      const postFileList = this.data.postFileList;
      this.setData({
        postFileList: postFileList.concat(fileData)
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

  imageName(name, filePath, index, postFileList){
    let loc = postFileList.length == 1 ? '' : "-" + index
    const cloudPath = "orgReg/" + name + loc + filePath.match(/\.[^.]+?$/)[0]
    return this.uploadFilePromise(cloudPath, filePath)
  },

  uploadToCloud(postFileList, orgName,isLogo=false) {
    let tmpTxt = isLogo ? "logo" : "图片"
    //Notify({ type: 'primary', message:"正在上传" + tmpTxt + "..."})
    wx.showLoading({
      title: "正在上传" + tmpTxt + "...",
      mask:true
    })
    
    wx.cloud.init();
    let name=''
    if (isLogo == false) {
      name = orgName + "-apply"
    }else{
      name = orgName + "-logo"
    }
    
    const uploadTasks = postFileList.map((file, index) =>
      this.imageName(name, file.url, index, postFileList)
      );
    Promise.all(uploadTasks)
      .then(data=> {
        console.log(data)
        //wx.showToast({ title: '上传成功', icon: 'none' });
        const newFileList = data.map((v,k) => v.fileID);
        if (isLogo==false){
          this.setData({
            postImageList:newFileList
          })
          this.uploadToCloud(this.data.logoFileList, orgName, true)
        }else{
          this.setData({
            logoImageList: newFileList
          })
          let formData = this.data.formData
          formData['logoImageList'] = this.data.logoImageList
          formData['postImageList'] = this.data.postImageList
          formData['postType'] =  this.data.postType
          //注册状态，0：待审核，-1：审核未通过，1：审核通过
          formData['status'] = 0
          wx.showLoading({
            title: "正在提交数据",
            mask:true
          })
          this.dbAdd(formData)
          
        }
        
      })
      .catch(e => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' });
        console.log(e);
      });
  },

  uploadFilePromise(fileName, path) {

    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: path
    });
  }

});