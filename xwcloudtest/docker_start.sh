#! /bin/bash

/home/xinwei/tools/create_bridge0.sh

route add default gw 172.31.3.254

chmod a+x /home/guow/start.sh

con_id=$(docker run -d --cpu-shares=700 -v /home/xinwei/mongodb_file:/data/db -p 27017:27017 mongodb mongod)
if [ $? != 0 ]; then
    echo 'run mongodb error';
    docker rm $con_id
    exit 1;
else
    echo 'start mongodb docker success'
fi

sleep 10

con_id=$(docker run -d --cpu-shares=700 -v /home/xinwei/code/xwcloudtest/:/home/guow -v /home/xwcloudtest/:/home/xwcloudtest/ --dns=172.31.2.1 --dns=172.31.2.69 -p 80:80 node /home/guow/start.sh)
if [ $? != 0 ]; then
    echo 'run node error';
    docker rm $con_id
    exit 1;
else
    echo 'start node docker success'
fi

con_id=$(docker run -d --cpu-shares=700 -v /home/xinwei/code/xwcloudtest/:/home/xinwei/code/xwcloudtest/ -w /home/xinwei/code/xwcloudtest/ --dns=172.31.2.1 --dns=172.31.2.69 -p 3000:3000 node npm start master)
if [ $? != 0 ]; then
    echo 'run master error';
    docker rm $con_id
    exit 1;
else
    echo 'start master docker success'
fi

setsebool -P ftp_home_dir 1
#systemctl start  vsftpd.service

cd /home/xinwei/code/cache
redis-server redis.conf
nohup bin/logstash -f logstash.conf &

cd /home/xinwei/code/xwcloudtest
nohup npm start slave &
