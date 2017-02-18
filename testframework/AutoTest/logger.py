#-*- coding:utf-8 -*-

try:
    #from robot.api import logger
    raise 'no robot';
except:
    import logging;
    import logging.handlers;
    from logging.handlers import RotatingFileHandler;

globalLogger = None;

def getLogger():
    global globalLogger

    if globalLogger is None:
        # 定义一个Handler打印INFO及以上级别的日志到autotest.log
        Rthandler = RotatingFileHandler('autotest.log', mode = 'a+', maxBytes = 10*1024*1024, backupCount = 5);
        Rthandler.setLevel(logging.DEBUG);
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(filename)s:%(lineno)s - %(name)s - %(message)s');
        Rthandler.setFormatter(formatter);

        # 定义一个Handler打印INFO及以上级别的日志到sys.stderr
        console = logging.StreamHandler();
        console.setLevel(logging.DEBUG);

        # 设置日志打印格式
        console.setFormatter(formatter);

        # 将定义好的console日志handler添加到root logger
        globalLogger = logging.getLogger('AutoTest');
        # globalLogger.addHandler(console);
        globalLogger.addHandler(Rthandler);

        globalLogger.setLevel(logging.DEBUG);

    return globalLogger;

if __name__ == '__main__':
    getLogger();
    globalLogger.debug("debug");
    globalLogger.info("info");
    globalLogger.warning("warning");
    globalLogger.error("error");
    globalLogger.critical("critical");