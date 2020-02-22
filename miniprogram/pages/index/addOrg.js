import Toast from '../../vant-weapp/toast/toast';
import Notify from '../../vant-weapp/notify/notify';
Page({
  data: {
    value: '',
    fileList: [],
    logoFileList: [],
    imageList:[],
    logoImageList:[],
    show: false,
    orgClass: "",
    locationName: '',
    address: '',
    latitude: '',
    longitude: '',
    nameLabel:{
      orgName:"组织名称",
      orgClass:"组织类型",
      locationName:"地址",
      orgInfo:"组织简介",
      adminName:"负责人",
      adminNum:"手机号",
      QQGroup:"QQ群",
      wxmp:"微信群",
      applyInfo:"申请说明"
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
  showPopup() {
    this.setData({
      show: true
    });
  },
  onSelect(event) {
    this.setData({
      orgClass: event.detail.name
    })
    console.log(event.detail);
  },
  orgClick() {
    this.setData({
      show: true
    });
  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let formData = e.detail.value
    this.setData({formData: formData})
    let orgName = formData.orgName
    this.checkFormData()

  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  postForm:function(){
    
  },
  checkFormData(){
    let formData = this.data.formData
    let nameLabel = this.data.nameLabel
    if (this.data.logoFileList.length==0){
      Notify("请上传【LOGO】")
      return
    }
    if (this.data.fileList.length == 0) {
      Notify("请上传【证明材料】")
      return
    }
    for (let x in formData){
      let value = formData[x]
      if (x == "wxmp"){
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
    this.uploadToCloud(this.data.fileList, formData.orgName)
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
    if (name == "logo") {
      const logoFileList = this.data.logoFileList;
      this.setData({
        logoFileList: logoFileList.concat(file)
      });
    } else {
      const fileList = this.data.fileList;
      this.setData({
        fileList: fileList.concat(file)
      });
    }

  },
  delete(event) {
    const { index, name } = event.detail;
    let fileListName = 'fileList'
    if (name == "logo"){
      fileListName = 'logoFileList'
    }
    const fileList = this.data[`${fileListName}`];
    fileList.splice(index, 1);
    this.setData({ [`${fileListName}`]: fileList });
  },

  imageName(name, file, index, fileList){
    let filepath = file.path
    let loc = fileList.length == 1 ? '' : "-" + index
    const cloudPath = "orgReg/" + name + loc + filepath.match(/\.[^.]+?$/)[0]
    return this.uploadFilePromise(cloudPath, filepath)
  },

  uploadToCloud(fileList, orgName,isLogo=false) {
    wx.cloud.init();
    let name=''
    if (isLogo == false) {
      name = orgName + "-apply"
    }else{
      name = orgName + "-logo"
    }
    
    const uploadTasks = fileList.map((file, index) =>
      this.imageName(name, file, index, fileList)
      );
    Promise.all(uploadTasks)
      .then(data=> {
        console.log(data)
        wx.showToast({ title: '上传成功', icon: 'none' });
        const newFileList = data.map((v,k) => v.fileID);
        
        if (isLogo==false){
          this.setData({
            imageList:newFileList
          })
          this.uploadToCloud(this.data.logoFileList, orgName, true)
        }else{
          this.setData({
            logoImageList: newFileList
          })
          
        }
        
      })
      .catch(e => {
        wx.showToast({ title: '上传失败', icon: 'none' });
        console.log(e);
      });
    console.log("test")
  },

  uploadFilePromise(fileName, path) {

    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: path
    });
  }

});