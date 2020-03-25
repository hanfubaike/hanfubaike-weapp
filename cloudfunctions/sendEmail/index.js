const cloud = require('wx-server-sdk')
cloud.init()
//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
var config = {
  service:"163",
  port: 465, // SMTP 端口
  secure: true, // 使用了 SSL
  auth: {
    user: 'user', //邮箱账号
    pass: 'pass' //邮箱的授权码
  }
};
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);
// 云函数入口函数 
exports.main = async(event, context) => {
  // 创建一个邮件对象
  var mail = {
    // 发件人
    from: event.from,
    // 主题
    subject: event.title,
    // 收件人
    to: event.to,
    //抄送
    cc: event.cc,
    // 邮件内容，text或者html格式
    text: event.text //可以是链接，也可以是验证码
  };

  let res = await transporter.sendMail(mail);
  return res;
}