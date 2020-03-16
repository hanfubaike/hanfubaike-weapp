const app = getApp();

Page({
  data: {
    src: '',
    width: 250,//宽度
    height: 250,//高度
    info: wx.getSystemInfoSync()
  },
  onLoad: function (options) {
    console.log(options)
    this.fileName = options.fileName
    const url = options.url
    const ratio = options.ratio
    let _data = {
      src: url,
    }
    if(ratio == "16.9"){
      _data.width = this.data.info.windowWidth
      _data.height = this.data.info.windowWidth/(16/9)
    }
    //获取到image-cropper实例
    this.cropper = this.selectComponent("#image-cropper");
    //开始裁剪
    this.setData(_data);
    //设置裁剪框居中
    this.cropper.setCutCenter();
    wx.showLoading({
      title: '加载中'
    })
  },
  cropperload(e) {
    console.log("cropper初始化完成");
  },
  loadimage(e) {
    console.log("图片加载完成", e.detail);
    wx.hideLoading();
    //重置图片角度、缩放、位置
    this.cropper.imgReset();

  },
  clickcut(e) {
    return
    console.log(e.detail);
    //点击裁剪框阅览图片
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  submit(){
    this.cropper.getImg((obj) => {
      let imgSrc = obj.url;
      app.cropperImg = {fileName:this.fileName,url:imgSrc}
      wx.navigateBack()
     });
  },
  back(){
    wx.navigateBack()
  }

})