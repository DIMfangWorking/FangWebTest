var moduler = undefined;

function upload(req, res)
{
    var fileFtpPath = req.files['files[]'].name;

    logger.info(fileFtpPath);

    moduler.saveFileMap({file : fileFtpPath, original : req.files['files[]'].originalname}, function (err, obj){
        logger.info('response : ', fileFtpPath);
        res.json({ result: SUCCESS, file : fileFtpPath });    
    });
}

module.exports = function (mod) {
    moduler = mod;
    return [
        {url : '/upload', method : "POST", process : upload},
    ];
};