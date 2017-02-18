var util = require('util');
var mailer = require("nodemailer");

function Mail(option)
{
    if (option)
    {
        if (!util.isObject(option))
        {
            throw new Error('mail option not object');
        }

        option.host = option.host || "172.31.2.3";
        option.port = option.port || 25;
        option.secure = opion.secure || false; // use SSL 
        option.direct = opion.direct || false; // default not auth
        option.greetingTimeout = 5 * 60 * 1000;
    }
    else
    {
        option = {
            host: "172.31.2.3",
            port: 25,
            secure: false, // use SSL 
            direct : false,
            greetingTimeout: 5 * 60 * 1000
        };
    }

    // Use Smtp Protocol to send Email
    this.smtpTransport = mailer.createTransport(option);
    if (!this.smtpTransport)
    {
        throw new Error('not connect mail server');
    }
}

Mail.prototype.sendMail = function(mail, callback)
{
    this.smtpTransport.sendMail(mail, function(error, response){
        if(error)
        {
            logger.error(util.inspect(response, {showHiddent : true, depth:null}));
        }
        else
        {
            logger.info("Message sent: " + util.inspect(response, {showHiddent : true, depth:null}));
        }
        callback(error, response);
    });
}

module.exports = Mail;

if (module == require.main)
{
    var mail = new Mail();
    var mailContext = {
        from: "linux_CI_auto <guowei@bj.xinwei.com.cn>",
        from: "linux_CI_auto <guowei@bj.xinwei.com.cn>",
        to: ["guowei@bj.xinwei.com.cn"],
        cc: ["quleixing@bj.xinwei.com.cn",
            "xiaoxu@bj.xinwei.com.cn",
            "liujinxing@bj.xinwei.com.cn",
            "guowei@bj.xinwei.com.cn"],
        subject: "Send Email Using Node.js",
        text: "Node.js New world for me",
        html: "<b>Node.js New world for me</b>"
    }

    logger = console;

    mail.sendMail(mailContext, function (err, response){
        logger.info("Message sent: " + util.inspect(response, {showHiddent : true, depth:null}));
    });
}