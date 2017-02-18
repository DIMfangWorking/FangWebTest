#! /bin/bash
export NODE_PATH=$(pwd)/../../xwcloudtest/node_modules
export PATH=$PATH:$(pwd)/../../xwcloudtest/node_modules/.bin
mocha --recursive --sort --retries 0 --timeoute 60000 --reporter doc