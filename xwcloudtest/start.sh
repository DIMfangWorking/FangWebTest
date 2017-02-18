#! /bin/bash
# docker inner run this shell

process=$(ps -ef | grep -E "(npm|node)" | grep -v grep | awk -F" " '{print $2}')
if [[ "$process" ]] ; then
    echo kill -9 $process
    kill -9 $process
#    sleep 3
fi

cd /home/guow

npm start web 
# npm start master 