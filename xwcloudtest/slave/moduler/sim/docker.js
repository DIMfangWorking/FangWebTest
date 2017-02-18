var Docker = require('dockerode');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var Q = require('q');
var Redis = require('ioredis');

var redis = new Redis({port:config.cache.port, host:config.cache.ip});

var dockerConfig = config.sim_slave.docker;

var docker = new Docker({protocol:dockerConfig.protocol, host:dockerConfig.ip, port: dockerConfig.port});

var docker_run_opt = {
         "Hostname": "",
         "Domainname": "",
         "User": "",
         "AttachStdin": true,
         "AttachStdout": true,
         "AttachStderr": true,
         "Tty": false,
         "OpenStdin": false,
         "StdinOnce": false,
         "Env": null,
         "Image": config.sim_slave.docker.image,
         "Labels": {},
         "NetworkDisabled": false,
         "HostConfig": {
           "Privileged": true,
           "CapAdd": ["ALL"],
           "Dns":['172.31.2.1', '172.16.2.69'],
        // "CpuShares": 500,
           "CpuPeriod":50000,
           "CpuQuota": 100000,
           "NetworkMode": "bridge",
           // "NetworkMode": "none",
        }
    };

/*
docker.listContainers(function (err, containers) {
  containers.forEach(function (containerInfo) {
    console.log("containerInfo", containerInfo);
  });
});
*/

function setOption(data, reslove, reject)
{
  var resource = data.task.resource_snapshot.sub_resource[data.task.sub_index];
  var cmd =  'python -u AutoTest ';
  logger.info("docker slave start. task : ", data.task.id);

  cmd += '--enbip ' + resource.ip + ' ';
  cmd += '--epcip ' + resource.epcip + ' ';
  cmd += '--enbid ' + resource.enbID + ' ';
  cmd += '--enbname ' + resource.enbName + ' ';
  cmd += '--redis ' + config.cache.ip + ' ';
  cmd += '--rport ' + config.cache.port + ' ';
  cmd += '--rkey ' + data.task.id;

  logger.info('cmd : ', cmd);
  data.opt.name = resource.name;  
  data.opt.Cmd = cmd.split(' ');
  data.opt.Entrypoint = null;

  data.opt.WorkingDir = config.slave.testframwrok_path;

  data.opt.HostConfig.LogConfig = { "Type": "syslog", Config: {"syslog-address" : config.syslog.protocol + '://' + config.syslog.ip + ':' + config.syslog.port} };
  //data.opt.HostConfig.LogConfig = { "Type": "gelf", Config: {"gelf-address" : config.syslog.protocol + '://' + config.syslog.ip + ':' + config.syslog.port} },

  data.opt.HostConfig.Binds = [];
  data.opt.Volumes = {};

  data.task.mapPath.forEach(function (item){
    for(var key in item)
    {
      data.opt.HostConfig.Binds.push(key + ':' + item[key]);
      data.opt.Volumes[key] = {};
    }
  });

  logger.info("docker run opt : ", data.opt);
  //logger.info("data.opt.HostConfig.LogConfig.Config : ", data.opt.HostConfig.LogConfig.Config);

  return data;
}

function createContainer(data, reslove, reject)
{
  data.opt = docker_run_opt;

  var data = setOption(data);

  docker.createContainer(data.opt, function (err, container) {
    logger.info("create container callback! container :", container);

    if (err != null)
      logger.error("err ", err);

    if (!container)
    {
      logger.error("container : ", container);
      data.error = 'create container fail!';
      reject(data);
    }
    else
    {
      data.task.container = container;
      reslove(data);
    }
  });
}

function startContainer(dataPromise, reslove, reject)
{
  logger.info("start container ");

  dataPromise.task.container.start(function(err, data) {
    if (err !== null && err.statusCode != 200) {
      logger.info('start container error. ', err)
      dataPromise.task.status = 'close';
      reject(dataPromise);
    }
    else
    {
      dataPromise.task.status = 'run';
      reslove(dataPromise); 
    }
  }); 
}

function checkContainerExist(data, reslove, reject)
{
  var count = 0;
  function checkContainer()
  {
    var select = JSON.stringify({"name":[data.opt.name]});
    logger.info('select', select);
    docker.listContainers({all:1, filters :  select}, function(err, con){
      logger.info(con);
      if (err)
      {
        logger.error('not found container', err);
        data.error = 'not found container';
        reject(data);
      }
      else if (con.length == 0)
      {
        count ++;
        if (count > 5)
        {
          logger.error('not found container, call listContainers > 5 times');
          data.error = 'not found container, call listContainers > 5 times';
          reject(data);
          return;
        }
        else
        {
          logger.info('list containers return 0');
        }

        setTimeout(checkContainer, 1000);
      }
      else
      {
        reslove(data);
      }
    });
  }

  checkContainer();
}

function setNetwork(data, reslove, reject)
{
  logger.info("set network");

  var resource = data.task.resource_snapshot.sub_resource[data.task.sub_index];

  exec('pipework bridge0 '+ docker_run_opt.name +' ' + resource.ip + '/24', function (error, stdout, stderr) {
    if (error !== null) {
      logger.info('pipework error. ', error)
      reject(data);
    }
    else
    {
      logger.info('pipework success. stdout : ', stdout);
      logger.info('stderr : ', stderr);      
      reslove(data); 
    }
  });
}

function startGetContainerLog(data, reslove, reject)
{
  logger.info("start Get Container Log");

  var task_key = {};
  task_key[data.task.id] = 'docker/' + data.task.container.id.substr(0,12);

  data.task.cache_key = task_key[data.task.id];

  redis.publish('task_key', JSON.stringify(task_key));

  reslove(data);
}

function checkAndRemoveContainer(dataPromise, reslove, reject)
{
  function inspectProcess(err,data)
  {
    logger.info(" runing : ", data.State.Running);

    dataPromise.task.run_time = new Date().getTime() - new Date(data.State.StartedAt).getTime();

    if (data.State.Running != true)
    {
      dataPromise.task.run_time = new Date(data.State.FinishedAt).getTime() - new Date(data.State.StartedAt).getTime();

      dataPromise.task.container.remove({v:1, force:1}, function(data){logger.info("remove container")});

      logger.debug(data.LogPath);

      reslove(dataPromise);

      return ;
    }
    
    setTimeout(checkAndRemoveContainer, 1000, dataPromise, reslove, reject);
  }

  dataPromise.task.container.inspect(inspectProcess);
}

function runContainer(task, callback)
{
  makePromise(createContainer, {task : task, async : callback})
        .then(makePromiseFunction(startGetContainerLog), defaultErrorProcess)
        .then(makePromiseFunction(startContainer), defaultErrorProcess)
        .then(makePromiseFunction(checkContainerExist), defaultErrorProcess)
        .then(makePromiseFunction(setNetwork), defaultErrorProcess)
        .then(makePromiseFunction(checkAndRemoveContainer), defaultErrorProcess)
        .done(function (data) {
                logger.info('task(' + data.task.id + ') run container result is success.');
                data.async('');
              }, function (data) {
                if (data.task.container)
                {
                  data.task.container.remove({v:1, force:1}, function(data){logger.info("remove container")});
                }

                logger.debug('data.task : ', data.task);

                if (data.task && data.task.id)
                {
                  data.task.status = 'close';
                  logger.info("complete the task(" + data.task.id + "). reslut is " + data.task.result + " error " + data.error); 
                }
                else
                {
                  logger.info("done function. data : ", data);
                }

                data.async(data.error);
              }, undefined);

  logger.info("create docker end.");
}

exports.runContainer = runContainer;