var child_process = require('child_process');
var fs = require('fs');
var util = require('util');
var url = require('url');

var Redis = require('ioredis');

var redisEI = undefined;

/* docker manager start */
var taskCurrentIndex = 0;
var config = {};

var logger = console;

function getEiBasicLog(data, reslove, reject)
{
    logger.info("run get ei basic Log start ");

    redisEI.lrange(data.task.cache_key, 0, -1, function (err, result){
            if (err || !result)
            {
                data.error = err;
                reject(data);
            }
            else
            {
                data.task.ei_basic = [];

                for (var index in result)
                {
                    var message = JSON.parse(result[index]);

                    data.task.ei_basic.push(message);
                }
                logger.info('call reslove');
                reslove(data);
            }
    });
}

function generateImage(data, reslove, reject)
{
    if (data.task.type === 'simulation')
    {
        reslove(data);
        return;
    }

    // logger.info(util.inspect(data, {showHidden : true, depth : null}));
    // logger.info(util.inspect(config.master.static_page_path, {showHidden : true, depth : null}));
    // logger.info(util.inspect(data.task, {showHidden : true, depth : null}));
    // logger.info(util.inspect(data.task.id, {showHidden : true, depth : null}));
    var task_id = data.task.id;

    var EIData = JSON.stringify(data.result_data.ei_basic);
    var para = ['EIBaseDraw.py', config.master.static_page_path + '/task/' + task_id];

    // logger.info("EIData",EIData);

    logger.info("run generate image. python ",para);

    if (!EIData || EIData.length <= 0)
    {
        logger.error("not ei baise data");
        reslove(data);
        return;
    }

    var child = child_process.spawn('python', para);

    logger.info("run generate image spawn");

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    logger.info("run generate image write start ");

    child.stdin.write(EIData+"\n");

    logger.info("run generate image write end ");

    var stdoutBuff = "";
    var stderrBuff = "";
    child.stdout.on('data', function(message){
        logger.info('stdout : ' + message);
        stdoutBuff += message;
    });

    child.stderr.on('data', function(message){
        logger.error('stderr : ' + message);
        stderrBuff += message;
    });

    child.on('close', function (code, signal) {
        if (code !=0 )
        {
            data.error = "generate image fail";
            reject(data);
        }
        else
        {
            reslove(data);
        }
    });
}

function sucessFunc(err)
{
    console.log("sucess");
}

function errorFunc(err)
{
    console.log(err);
}

function main(key)
{
    getEiBasicLog({task : { cache_key : key}}, function (data){
        data.result_data = {ei_basic : data.task.ei_basic}
        generateImage(data, sucessFunc, errorFunc);
    }, errorFunc);
}

if (module == require.main)
{
    redisEI = new Redis({port:6379, host:"172.31.4.5", db:2});
    config.master = {static_page_path : "./"};
    main(process.argv[2]);
}