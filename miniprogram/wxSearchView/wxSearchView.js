/***
 * // 定义数据格式
 * "wxSearchData":{
 *  configconfig:{
 *    style: "wxSearchNormal"
 *  },
 *  view:{
 *    hidden: true,
 *    searchbarHeght: 20
 *  }
 *  hotKeys:[],//自定义热门搜索
 *  his:[]//历史搜索关键字
 *  value
 * }
 */

// 提示集合
var __tipKeys = [];
// 搜索回调函数 
var __searchFunction = null;
// 返回函数 
var __goBackFunction = null;
var __wxSearchKeyTap = null;
// 应用变量
var __that = null;

// 初始化函数
function init(that, hotKeys, searchFunction, backwxSearchKeyTap, goBackFunction) {

  __that = that;
  __tipKeys = that.orgList;
  __searchFunction = searchFunction;
  __goBackFunction = goBackFunction;
  __wxSearchKeyTap = backwxSearchKeyTap

  var temData = {};
  temData.hotKeys = hotKeys;
  __that.setData({
    wxSearchData: temData,
    inputText:"",
    bottonText:"搜索"
  });
}

// 搜索框输入时候操作
function wxSearchInput(e) {
  var inputValue = e.detail.value;
  console.log("wxSearchInput",e)
  // 页面数据
  var temData = __that.data.wxSearchData;
  var __data = {}
  // 寻找提示值 
  var tipKeys = [];
  if (inputValue && inputValue.length > 0) {
    if (!__that.data.isWxSearch){
      __that.setData({
        isWxSearch: true,
        isMap:false
      });
    }
    __data.bottonText = "搜索"
    __that.isSearch = false
    for (var i = 0; i < __tipKeys.length; i++) {
      var mindKey = __tipKeys[i].orgName;
      // 包含字符串
      if (mindKey.indexOf(inputValue) != -1) {
        if (__tipKeys[i].logoList == 'res/defaultLogo.png'){
          __tipKeys[i].logoList = '/res/defaultLogo.png'
        }
        tipKeys.push(__tipKeys[i]);
        if (tipKeys.length > 20) {
          break
        }
      }
    }
    console.log(tipKeys)
  }
  else if (!(e.detail.keyCode == 8)){
    __data.isWxSearch = false,
    __data.isMap = true
  }
  else{
    wxSearchClear()
    return
  }
  // 更新数据
  temData.value = inputValue;
  temData.tipKeys = tipKeys;
  __data.wxSearchData = temData
  
  // 更新视图
  __that.setData(
    __data
  );
}

// 清空输入
function wxSearchClear() {
  // 页面数据
  var temData = __that.data.wxSearchData;
  // 更新数据
  temData.value = "";
  temData.tipKeys = [];
  // 更新视图
  __that.setData({
    wxSearchData: temData,
    inputText: temData.value,
    isWxSearch:false,
    isMap: true
  });
}

// 点击提示或者关键字、历史记录时的操作
function wxSearchKeyTap(e) {
  console.log(e)
  var temData = __that.data.wxSearchData;
  // 更新数据
  temData.value = e.currentTarget.dataset.key.orgName;
  temData.tipKeys = [e.currentTarget.dataset.key]
  __that.setData({
    wxSearchData: temData,
    isWxSearch: false,
    inputText: e.currentTarget.dataset.key.orgName,
    isMap: true
  });
  
  __wxSearchKeyTap(e.currentTarget.dataset.key);
}

// 确任或者回车
function wxSearchConfirm(e) {
  //返回
  if (__that.isSearch){
    __that.setData({
      scale: 3,
      bottonText : "搜索"
    })
    wxSearchClear()
    __that.isSearch = false
    __that.setMarkers(__that.orgList)
    return
  }
  var key = e.target.dataset.key;
  search(__that.data.wxSearchData.value);
  
}

function search(inputValue) {
  if (inputValue && inputValue.length > 0) {
    __that.setData({
      isWxSearch: false,
      isMap: true,
      map_text_hidden: true
    });
    // 回调搜索
    __searchFunction(__that.data.wxSearchData);
  }
  else{
    __searchFunction(__that.data.wxSearchData);
  }
}


function imageError(e){
  //console.log(e)
}

// 导出接口
module.exports = {
  init: init, //初始化函数
  wxSearchInput: wxSearchInput,// 输入变化时的操作
  wxSearchKeyTap: wxSearchKeyTap, // 点击提示或者关键字、历史记录时的操作
  wxSearchConfirm: wxSearchConfirm, // 搜索函数
  wxSearchClear: wxSearchClear,  // 清空函数
}