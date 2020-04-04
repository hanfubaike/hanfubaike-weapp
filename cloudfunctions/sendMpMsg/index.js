// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.uniformMessage.send({
      touser: event.openid,
      mpTemplateMsg: {
        appid: event.mpAppid,
        url: event.url,
        miniprogram: {
          appid: event.appid,
          page: event.page 
        },
        data: {
          first: {
            value: '有新的组织需要审核',
            color: '#173177'
          },
          keyword1: {
            value: '与非',
            color: '#173177'
          },
          keyword2: {
            value: '测试组织',
            color: '#173177'
          },
          keyword3: {
            value: '2014年9月22日',
            color: '#173177'
          },
          remark: {
            value: '请打开小程序进行查看',
            color: '#173177'
          }
        },
        templateId: 'yJ-GO96k1cd613WBumrtrsQpQv0p7fyzGCeID6eIpgA'
      }
      })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}