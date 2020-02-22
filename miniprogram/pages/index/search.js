// map.js
var WxSearch = require('../../wxSearchView/wxSearchView.js');
var util = require('../../utils/util.js');
var MakerCluster = require('../../utils/MakerCluster.js');
var orgClass = [{ name:"其它组织", img:"/images/collection.png" }, 
                { name: "社会组织", img:"/images/shehuizuzhi.png"}, 
                { name: "高校社团", img:"/images/gaoxiaoshetuan.png"}, 
                { name: "中学社团", img:"/images/zhongxueshetuan.png"}, 
                { name: "文化平台", img:"/images/wenhuapingtai.png"}, 
                { name: "汉服商家", img:"/images/hanfushangjia.png"}]


var app = getApp();
Page({
  data: {
    scale: 15,
    markers: [],
    ourMarkers: [],
    searchMarkers: [],
    circles: [],
    mapTextHidden: true,
    isWxSearch: false,
    isMap: true,
    map_container_style: "width: 100%;",
    map_style: "width: 100%; height: 100%;",
    map_text_hidden: true,
    //map_text_style: "width: 92%; height: 16%;",
  },
  allOrgList: [],
  orgList: [],
  touchePageX: 0,
  points: [],
  markersData: {},
  regionMarkers: [],
  isFirst: true,
  fromMarkertap: false,
  Updated:false,
  hotList:[],
  initSearch: function () {
    var that = this
    WxSearch.init(
      that,  // 本页面一个引用
      that.hotList, // 热点搜索推荐，[]表示不使用
      that.mySearchFunction, // 提供一个搜索回调函数,
      that.backwxSearchKeyTap,
      that.myGobackFunction //提供一个返回回调函数
    );
  },

  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    //this.mapCtx = wx.createMapContext('map')
  },

  onLoad: function (options) {
    let self = this


    //self.updataLogo()
  },
  onShow: function () {
    let self = this
    this.mapCtx = wx.createMapContext('map')
    self.initSearch()
    self.getAllOrgList()
    self.getLocation()
    self.initData()
  },

  moveToLocation: function () {
    let self = this
    this.mapCtx.moveToLocation()
    setTimeout(function () { self.loadingMark(true) }, 1000)
  },
  isEquals: function (a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  },
  isInside: function (markers) {
    var self = this
    var _data = []
    self.mapCtx.getRegion({
      success: function (res) {
        //console.log(res)
        //西南
        var southwest = res.southwest
        //东北
        var northeast = res.northeast
        //东南
        var southeast = { longitude: northeast.longitude, latitude: southwest.latitude }
        //西北
        var northwest = { longitude: southwest.longitude, latitude: northeast.latitude }
        var polist = [southwest, southeast, northeast, northwest]
        console.log("polist", polist)

        for (var x in markers) {

          let lat = markers[x].latitude
          let lng = markers[x].longitude
          if (util.IsPtInPoly(lng, lat, polist)) {
            console.log("在视野范围：", markers[x].organizationname)
            _data.push(markers[x])
          }
          else {
          }
        }
        return _data
      }
    })
    return _data
  }
  ,
  getAllOrgList: function () {
    //访问网络
    var self = this
    var url = app.WEBVIEWURL + '/hwh/zqsw/hwhOrganization/allOrgList'
    var allOrgList = []
    var orgList = []
    wx.request({
      url: url,
      //data: { name: "111", password: "123", id: "123" },
      header: {
        'content-type': 'application/json' // 默认值
      },
      // dataType:JSON,//该语句会将服务器端的数据自动转为string类型
      success: function (res) {
        if (res.data.status) {

          allOrgList = res.data.data
          self.allOrgList = allOrgList
          for (var x in allOrgList) {
            if (allOrgList[x].status != 1) {
              continue
            }
            orgList.push(allOrgList[x])
          }
          self.orgList = orgList
          self.hotList = util.getRandomArrayElements(orgList,30)
          console.log(self.hotList)
          self.initSearch()
          //self.setClusterMarkers(orgList)
          self.setMarkers(orgList)
          //self.setCircles(self.orgList)
        }
      },
      fail: function () {
        // fail
        console.log('获取数据失败，请稍后重试');
        wx.showModal({
          title: '数据加载失败',
          content: '请点击确定按钮进行重试',
          showCancel: false,
          //cancelColor: '#296fd0',
          //confirmColor: '#296fd0',
          confirmText: '确定',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              self.getAllOrgList()
            }
          },
          fail: function (res) {

          }
        })
      },
      complete: function () {
        // complete
        self.loadingMark(true)
        console.log('orgList', orgList);
        if (self.isEquals(orgList, self.orgList)) {
          //console.log('数据一致，不刷新')
          //return
        }
      }
    })

  },
  //地图渲染完成后调用
  mapUpdated: function (e) {

    let self = this
    self.Updated = true
    //console.log('mapUpdated', e)
    //setTimeout(function () {
      //wx.hideLoading();
    //}, 100);

  },

  initData: function (jsonData) {
    var self = this
    self.updataLogoIndex = 0
    wx.getSystemInfo({
      success: function (res) {
        console.log("screenHeight", res.screenHeight)
        self.setData({
          screenHeight: res.screenHeight,
          screenWidth: res.screenWidth,
          controls: [{
            id: 1,
            iconPath: '/resources/locationMe.png',
            position: {
              left: 20,
              top: (res.screenHeight - 20 - 100 - 90) / 1.3,
              width: 30,
              height: 30
            },
            clickable: true
          },
          {
            id: 2,
            iconPath: '/resources/plus.png',
            position: {
              left: res.screenWidth - 50,
              top: (res.screenHeight - 20 - 100 - 48 - 90) / 1.3,
              width: 40,
              height: 40
            },
            clickable: true
          },
          {
            id: 3,
            iconPath: '/resources/zoom.png',
            position: {
              left: res.screenWidth - 50,
              top: (res.screenHeight - 20 - 100 - 90) / 1.3,
              width: 40,
              height: 40
            },
            clickable: true
          }
          ],
        })
      }
    })

  },

  updataLogo: function () {
    let self = this
    let n = self.updataLogoIndex
    let url = self.jsonData[n].logopictureurlstr
    if (url == "/images/defaultLogo.png") {
      console.log("defaultLogo")
    }
    else {
      wx.downloadFile({
        url: url,
        success: function (res) {
          if (res.statusCode === 200) {
            let filePath = res.tempFilePath
            let param = {}
            let iconPath = "markers".concat("[", n, "].", "iconPath")
            let width = "markers".concat("[", n, "].", "width")
            let height = "markers".concat("[", n, "].", "height")
            let alpha = "markers".concat("[", n, "].", "alpha")
            param[iconPath] = filePath
            param[width] = 50
            param[height] = 50
            param[alpha] = 0.9
            self.setData(param)
            console.log("updataLogo success")
          }
        },
        fail: function () {
          // fail
          console.log('updataLogo submit fail ', url);
        },
        complete: function () {
          // complete
          console.log('updataLogo submit comlete');
        }
      })
    }
    if (self.updataLogoIndex + 1 < self.data.markers.length) {
      self.updataLogoIndex += 1
      //self.updataLogo()
    }
  },


  updataOneLogo: function () {
    let self = this
    let url = self.data.textData.logopictureurlstr
    if (url == "/images/defaultLogo.png") {
      self.setData({
        'textData.logopictureurlstr': "/images/defaultLogo.png"
      })
      console.log("defaultLogo")
    }
    else {
      wx.downloadFile({
        url: url,
        success: function (res) {
          if (res.statusCode === 200) {
            self.setData({
              'textData.logopictureurlstr': res.tempFilePath
            })

            console.log("updataLogo success")
          }
        },
        fail: function () {
          // fail
          self.setData({
            'textData.logopictureurlstr': "/images/defaultLogo.png"
          })
        },
        complete: function () {
          // complete
          console.log('updataLogo submit comlete');
        }
      })
    }
  },

  getLocation: function () {
    let self = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        self.setData({
          scale: 15,
          latitude: res.latitude,
          longitude: res.longitude,
        })
        self.loadingMark(true)
      },
      fail: function () {
        console.log("获取初始位置失败，使用默认位置")
        self.setData({
          latitude: 23.099994,
          longitude: 113.324520,
        })
      }
      ,
      complete: function () {
      }
    })
  },
  resetMarker:function(orgList){
    var markers = self.data.markers
    for(var x in markers){
      markers[x]
    }
  }
  ,

  setIndexMarkers: function (orgList, fromSearch = false) {
    //wx.showLoading({
    //title: '正在加载',
    //mask: true
    //})
    let self = this
    let data = orgList
    let markersData = {}
    let markers = []

    for (var x in data) {
      var index = self.data.markers.indexOf(data[x])
      index = index == -1 ? 0 : index

      //markersData["markers[" + index + "].width"] = (self.scale * self.scale) / 11
      //markersData["markers[" + index + "].height"] = (self.scale * self.scale) / 11

      if (self.scale > 10 || fromSearch) {
        if (self.scale > 18){
          self.scale = 18
        }
       markersData["markers["+index +"].width"]=(self.scale * self.scale) / 8
       markersData["markers["+index +"].height"]=(self.scale * self.scale) / 8
        markersData["markers[" + index + "].callout.fontSize"] = 12
        markersData["markers[" + index + "].callout.display"] = "ALWAYS"
      }
      else {
        markersData["markers[" + index + "].width"] = 10
        markersData["markers[" + index + "].height"] = 10
        markersData["markers[" + index + "].callout.display"] = "BYCLICK"

      }
    }
    markersData.map_text_hidden = true
    if (self.isEquals(markersData, self.markersData)) {
      console.log('数据一致，不刷新。')
      //return
    }
    else {
      self.markersData = markersData
      self.Updated = false
      self.setData(
        markersData
        ,
        function () {
          return
          var points = self.points
          var _points = []
          if (self.mapCtx) {
            if (self.points.length != 0) {
              setTimeout(function () {
                self.mapCtx.includePoints({
                  points: points,
                  padding: [50]
                })
              }, 100);

            }

          }
        })
    }
  },
  setClusterMarkers: function (orgList) {
    var mc = MakerCluster.mc.createNew()
    var self = this
    var dataList = []
    console.log("orgList", orgList)
    var _data = []
    self.mapCtx.getScale({
      success: function (rres) {
        var scale = rres.scale
        var isScaleEquals = false
        console.log("scale", scale)
        if (scale != self.scale) {
          isScaleEquals = true
        }
        self.scale = scale
        self.mapCtx.getRegion({
          success: function (res) {
            //console.log(res)
            //西南
            var southwest = res.southwest
            //东北
            var northeast = res.northeast

            var southeast = { longitude: northeast.longitude, latitude: southwest.latitude }
            //西北
            var northwest = { longitude: southwest.longitude, latitude: northeast.latitude }
            var polist = [southwest, southeast, northeast, northwest]
            console.log("polist", polist)

            for (var x in orgList) {
              let lat = orgList[x].latitude
              let lng = orgList[x].longitude
              if (util.IsPtInPoly(lng, lat, polist)) {
                console.log("在视野范围：", orgList[x].organizationname)
                _data.push(orgList[x])
              }
              else {
              }
            }
            var mcData = mc.initv2(northeast.longitude, southwest.longitude, northeast.latitude, southwest.latitude, { "data": _data })
            console.log("mcData", mcData)
            for (var x in mcData) {
              var dataJson = {}
              dataJson.longitude = mcData[x].center.lng
              dataJson.latitude = mcData[x].center.lat
              dataJson.organizationname = mcData[x].markers.length
              dataList.push(dataJson)
            }
            let markers = []

            for (var x in dataList) {
              let markeJson = {}

              markeJson.iconPath = "/resources/defaultMarker.png"
              markeJson.width = 20
              markeJson.height = 20
              markeJson.alpha = 0.8

              markeJson.id = "c" + x
              markeJson.latitude = dataList[x].latitude
              markeJson.longitude = dataList[x].longitude
              //markeJson.anchor = { x: -20, y: 3 }
              markeJson.organizationname = dataList[x].organizationname

              //markeJson.title = dataList[x].organizationname
              markeJson.callout = {
                content: dataList[x].organizationname,
                fontSize: 12,
                borderWidth: 4,
                color: "#000000",
                borderColor: "#ddeef8",
                borderRadius: 6,
                bgColor: "#fafafa",
                padding: 6,
                display: "ALWAYS"
              }
              markers.push(markeJson)
            }
            if (self.isEquals(markers, self.data.markers) || _data.length == 0 || self.isEquals(_data, self.regionMarkers)) {
              console.log("视野数据一致，不刷新")
            }
            else {
              self.regionMarkers = _data
              self.setData({
                markers: markers,
                map_text_hidden: true,
              })
            }
          }
        })
      }
    })


  }
  ,

  setMarkers: function (orgList) {
    let self = this
    //wx.showLoading({
    //title: '正在加载',
    //mask: true
    //})
    
    let data = orgList
    let markers = []

    for (var x in data) {
      let markeJson = {}
      var org_type = data[x].org_type > 5 ? 0 : data[x].org_type

      markeJson.iconPath = orgClass[org_type].img
      //markeJson.iconPath = "/resources/defaultMarker.png"
      markeJson.width = 10
      markeJson.height = 10
      markeJson.alpha = 0.8

      markeJson.id = x
      markeJson.latitude = data[x].latitude
      markeJson.longitude = data[x].longitude
      //markeJson.anchor = { x: -20, y: 3 }
      markeJson.organizationname = data[x].organizationname

      //markeJson.title = data[x].organizationname
      markeJson.callout = {
        content: data[x].organizationname,
        fontSize: 12,
        borderWidth: 4,
        color: "#000000",
        borderColor: "#ddeef8",
        borderRadius: 6,
        bgColor: "#fafafa",
        padding: 6,
        display: "BYCLICK"
      }
      markers.push(markeJson)
    }
    if (self.isEquals(markers, self.data.markers)) {
      console.log('数据一致，不刷新。')
      //return
    }
    else {
      self.setData({
        circles: [],
        markers: markers,
        map_text_hidden: true,
      }
        ,
        function () {

          return
          var points = self.points
          var _points = []
          if (self.mapCtx) {
            if (self.points.length != 0) {
              setTimeout(function () {
                self.mapCtx.includePoints({
                  points: points,
                  padding: [50]
                })
              }, 100);

            }

          }
        })
    }
  }
  ,
  setCircles: function (orgList) {
    //wx.showLoading({
    //title: '正在加载',
    //mask: true
    //})
    let self = this
    let data = orgList

    let circlesList = []
    for (var x in data) {
      let circles = {}
      //circles.color = "#FF0018DC"
      circles.fillColor = "#FF0018DC"
      circles.radius = 500
      //circles.strokeWidth = 1
      circles.latitude = data[x].latitude
      circles.longitude = data[x].longitude
      circlesList.push(circles)
    }
    self.setData({
      circles: circlesList,
      map_text_hidden: true,
      markers: []
    },
      function () {
        if (self.isFirst) {
          console.log("isFirst")
          //self.getLocation();
          self.isFirst = false
          return
        }
        var points = self.points
        var _points = []
        if (self.mapCtx) {
          if (self.points.length != 0) {
            setTimeout(function () {
              self.mapCtx.includePoints({
                points: points,
                padding: [50]
              })
            }, 100);

          }

        }
      })
  },

  //动态加载mark
  loadingMark: function (Force = false) {
    var self = this
    if (!self.Updated && !Force){
      console.log("地图未刷新完，不更新")
      return
    }
  
    
    var _data = []
    var markers = self.data.markers
    self.mapCtx.getScale({
      success: function (res) {
        var scale = res.scale
        var isScaleEquals = false
        console.log("scale", scale)
        if (scale != self.scale) {
          isScaleEquals = true
        }
        self.scale = scale
        if (scale > 10 || Force) {

          self.mapCtx.getRegion({
            success: function (res) {
              //console.log(res)
              //西南
              var southwest = res.southwest
              //东北
              var northeast = res.northeast
              //东南
              var southeast = { longitude: northeast.longitude, latitude: southwest.latitude }
              //西北
              var northwest = { longitude: southwest.longitude, latitude: northeast.latitude }
              var polist = [southwest, southeast, northeast, northwest]
              console.log("polist", polist)

              for (var x in markers) {

                let lat = markers[x].latitude
                let lng = markers[x].longitude
                if (util.IsPtInPoly(lng, lat, polist)) {
                  console.log("在视野范围：", markers[x].organizationname)
                  _data.push(markers[x])
                }
                else {
                }
              }
              console.log(_data)
              if ((_data.length != 0 && !self.isEquals(_data, self.regionMarkers)) || isScaleEquals || Force) {
                self.regionMarkers = _data
                
                self.setIndexMarkers(_data)
                
              }
              else {
                console.log("视野数据一致，不刷新")
              }
            }
          })
        }
        else if (scale <= 8) {
          self.setMarkers(self.orgList)
          
          //self.setData({
          //markers: []
          //})
          //self.setCircles(self.orgList)
          //self.setMarkers(self.orgList, false)
        }
      }
    })
  },

  regionchange: function (e) {
    let self = this
    console.log("regionchange", e)
    if (e.type == "end") {
      self.loadingMark()
    }
  },

  markertap(e) {
    let self = this
    let textData = {}
    var _markersData = {}
    if (e.markerId.indexOf("c") > -1) {
      console.log("聚合图标,不处理")
      return
    }
    var org_type = self.orgList[e.markerId].org_type > 5 ? 0 : self.orgList[e.markerId].org_type 
    //console.log(e.markerId, self.orgList)
    textData.location = self.orgList[e.markerId].location
    textData.organizationname = self.orgList[e.markerId].organizationname
    textData.qqgroupnum = self.orgList[e.markerId].qqgroupnum
    textData.wxgznum = self.orgList[e.markerId].wxgznum
    textData.wbnum = self.orgList[e.markerId].wbnum
    textData.status = self.orgList[e.markerId].status
    textData.organizationdesc = self.orgList[e.markerId].organizationdesc
    textData.logopictureurlstr = self.orgList[e.markerId].logopictureurlstr
    textData.organizationid = self.orgList[e.markerId].organizationid
    textData.orgClass = orgClass[org_type].name
    if (textData.logopictureurlstr == "images/defaultLogo.png" || textData.logopictureurlstr == "") {
      textData.logopictureurlstr = '/images/defaultLogo.png'
    }
    var webUrl = app.WEBVIEWURL + '/organization_detail.html?organizationid=' + textData.organizationid + "&rand=" + app.VERSION
    textData.webUrl = '/pages/webpage/webpage?url=' + encodeURIComponent(webUrl) + '&title=' + textData.organizationname;
    //textData.logopictureurlstr = "/images/".concat(self.orgList[e.markerId].organizationname, ".jpg")
    textData.latitude = self.orgList[e.markerId].latitude
    textData.longitude = self.orgList[e.markerId].longitude
    //textData.mode = "aspectFit"
    if (!self.data.markers[e.markerId].callout) {
      _markersData["markers[" + e.markerId + "].callout"] = {
        content: textData.organizationname,
        fontSize: 12,
        borderWidth: 2,
        color: "#000000",
        borderColor: "#DCDCDC",
        borderRadius: 6,
        bgColor: "#FFFFFF",
        padding: 6,
        display: "BYCLICK"
      }
      console.log("不存在callout，添加callout")
    }
    _markersData.textData = textData
    //_markersData.longitude = textData.longitude
    //_markersData.latitude = textData.latitude
    _markersData.map_text_hidden = false
    self.setData(
      _markersData
    )
    //self.updataOneLogo()
    console.log(self.orgList[e.markerId].organizationname)
  },

  // 获取容器高度，使页面滚动到容器底部
  pageScrollToBottom: function (duration = 10) {
    wx.createSelectorQuery().select('#map_container').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: rect.bottom,
        duration: duration
      })
    }).exec()
  },

  getScrollOffset: function (duration = 10) {
    let self = this
    wx.createSelectorQuery().selectViewport().scrollOffset(function (res) {
      res.id      // 节点的ID
      res.dataset // 节点的dataset
      res.scrollLeft // 节点的水平滚动位置
      res.scrollTop  // 节点的竖直滚动位置
      if (res.scrollTop < 10 && duration != 0) {
        self.pageScrollToBottom(duration)
      }
    }).exec()
  },

  mapTap(e) {
    this.setData({
      map_style: "width: 100%; height: 100%;",
      map_text_hidden: true,
      map_text_style: "",
    })
  },

  map_text_tap(e) {
    let self = this
    console.log(e)
    wx.navigateTo({
      url: e.currentTarget.dataset.item.webUrl,
    })
  }
  ,
  map_text_touchmove(e) {
    let self = this
    //console.log(touchePageX)
  }
  ,

  touchmove(e) {
    let self = this
    //console.log(e)
    //wx.pageScrollTo({
    //scrollTop: 0,
    //duration: 0
    //})
  },

  controltap(e) {
    let self = this
    if (e.controlId == 1) {
      self.getLocation()
      //self.moveToLocation()
      //self.setData({
        //scale: 15
      //})
    }
    else if (e.controlId == 2) {
      self.mapCtx.getCenterLocation({
        success: function (ress) {
          self.mapCtx.getScale({
            success: function (res) {
              var scale = res.scale
              if (scale <= 19) {
                self.setData({
                  scale: scale + 1,
                  latitude: ress.latitude,
                  longitude: ress.longitude
                })
              }
            }
          })

        }
      })
    }
    else if (e.controlId == 3) {
      // zoom
      self.mapCtx.getCenterLocation({
        success: function (ress) {
          self.mapCtx.getScale({
            success: function (res) {
              var scale = res.scale
              if (scale >= 4) {
                self.setData({
                  scale: scale - 1,
                  latitude: ress.latitude,
                  longitude: ress.longitude
                })
              }
            }
          })

        }
      })
    }
  },

  binderrorimg: function (e) {
    let self = this
    var errorImgIndex = e.target.dataset.errorimg //获取循环的下标
    this.setData({
      "textData.logopictureurlstr": "/images/defaultLogo.png"
    }) //修改数据源对应的数据
  },

  // 转发函数,固定部分
  wxSearchInput: WxSearch.wxSearchInput,  // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  // 点击提示或者关键字、历史记录时的操作
  wxSearchConfirm: WxSearch.wxSearchConfirm,  // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear,  // 清空函数
  imageError: function(e){
    if(e.type=="error"){
      var item = e.currentTarget.dataset.key
      var n = this.data.wxSearchData.hotKeys.indexOf(item)
      var tmpData = {}
      tmpData["wxSearchData.hotKeys[" + n + "].logopictureurlstr"] = "/images/collection.png"
      this.setData({
        tmpData
      })
      
    }
    console.log(e)
  },

  // 搜索回调函数  
  mySearchFunction: function (values) {
    // do your job here
    // 跳转
    var self = this
    var points = []
    if (!values.value) {
      console.log("搜索参数为空")
      return

    }
    console.log(values)
    var tipKeys = values.tipKeys
    var value = values.value
    var points = []
    //self.setIndexMarkers(tipKeys, true)
    for (var x in tipKeys) {
      var longitude = tipKeys[x].longitude
      var latitude = tipKeys[x].latitude
      points.push({ latitude: latitude, longitude: longitude })
    }
    if (points && tipKeys) {
      app.points = points
      app.tipKeys = tipKeys
      console.log("跳转搜索界面")
      wx.navigateTo({
        url: 'searchMap',
      })
    }

  },

  backwxSearchKeyTap: function (value) {

    let self = this
    var longitude = value.longitude
    var latitude = value.latitude
    var name = value.organizationname
    var _value = {}
    _value.value = name
    _value.tipKeys = [value]
    self.mySearchFunction(_value)
    //var points = []
    //console.log("points", { latitude: latitude, longitude: longitude })
    //self.mapCtx.includePoints({
    //points: [{ "latitude": latitude, "longitude": longitude }]
    //})

  }
  ,

  // 返回回调函数
  myGobackFunction: function () {
    // do your job here
    // 跳转
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '汉服地图',
      path: '/pages/index/index?page=map',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})