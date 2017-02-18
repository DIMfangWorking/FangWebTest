var http = require('http');

String.prototype.wLength = function (){
    var len = this.length;
    var charCode = 0;
    var realLength = 0;

    for(var i = 0; i < len; i++)
    {
        charCode = this.charCodeAt(i);
        if (charCode>=0 && charCode <= 128)
        {
            realLength += 1;
        }
        else if ((0x0080 <= charCode) && (charCode <= 0x07ff))
        {
            realLength += 2;
        }
        else if ((0x0800 <= charCode) && (charCode <= 0xffff))
        {
            realLength += 3;
        }
        else if ((0x010000 <= charCode) && (charCode <= 0x10ffff))
        {
            realLength += 4;
        }
    }
    return realLength;
};

function sendHttpRequest(options, postData, callback)
{
    logger.debug("update function start ");

    if (postData)
    {
        options.headers['Content-Length'] = postData.wLength();
    }

    var req = http.request(options, function (res) {
        var req_context = '';

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            req_context += chunk;
        });

        res.on('end', function() {
            callback(null, res, req_context);
        });
    });

    req.setSocketKeepAlive(false);

    req.on('error', function(e) {
        callback(e, null, null);
    });

    if (postData)
    {
        req.write(postData);
    }
    req.end();
}

module.exports = sendHttpRequest;
