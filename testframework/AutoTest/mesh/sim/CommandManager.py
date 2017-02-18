__author__ = 'user'

import pdb
import os
import subprocess
import sqlite3
import threading
import struct
import socket

import Log


__debug_flag = False

def log_debug(info):
    global __debug_flag
    if __debug_flag:
        Log.log_trace(info, Log.DEBUG_LEVEL)
#
class CommandParam:
    def __init__(self, cmd_name, cmd_cmd, cmd_obj):
        self.cmd_name = cmd_name
        self.cmd_cmd = cmd_cmd
        self.cmd_obj = cmd_obj

        self.sponsor_node_id = None
        self.timeout = None
        self.expect = None
        self.dst_ip = None
        self.package_len = None
        self.times = None
        self.lch_num = None
        self.title = None
        self.step_list = []
        self.db_table = None
        self.db_opt = None
        self.db_sql = None


    def __str__(self):
        return 'cmd_name: ' + self.cmd_name + '\n' + \
                'cmd_cmd: ' + self.cmd_cmd + '\n' + \
                'cmd_obj: ' + self.cmd_obj + '\n' + \
                'sponsor_node_id: ' + str(self.sponsor_node_id) + '\n' + \
                'timeout: ' + str(self.timeout) + '\n' + \
                'expect: ' + str(self.expect) + '\n' + \
                'dst_ip: ' + str(self.dst_ip) + '\n' + \
                'package_len: ' + str(self.package_len) + '\n' + \
                'times: ' + str(self.times) + '\n' + \
                'times: ' + str(self.times) + '\n' + \
                'lch_num: ' + str(self.lch_num) + '\n' + \
                'title: ' + str(self.title) + '\n' + \
                'step_list: ' + str(self.step_list) + '\n' + \
                'db_table: ' + str(self.db_table) + '\n' + \
                'db_opt: ' + str(self.db_opt) + '\n' + \
                'db_sql: ' + str(self.db_sql) + '\n'

#
class Command:
    def __init__(self):
        self.param = None

    #
    def execute(self, cmd_param, mesh_device_manager):
        return 0

    def database_handle(self, db_name, db_table, db_sql, db_opt_value, expect_value):
        index_value = db_name[-1:]

        file_name = 'mesh'
        table_name = db_table

        hdlNum = 0
        if 21 == db_opt_value:
            hdlNum = 1

        dataBaseCmd = db_sql

        opType = db_opt_value
        context = 6
        #pdb.set_trace()
        fmt = '!24s24s24s24s24s24s24s24s24s24s24s24s24s24s24s24s24s24s24s24s24sB3000sBI'
        #fmt = '!24s24s460sB3000sBI'

        u16SrcSPID = 5002
        u16DstSPID = 401
        u16MsgType = 2006

        sendMsgFmt = '4H24s480sB3000sBI'
        u16MsgLength = struct.calcsize(sendMsgFmt) - 8
        sendMsgPacket = struct.Struct(sendMsgFmt)
        sendMsg = sendMsgPacket.pack(u16SrcSPID,u16DstSPID,u16MsgType,u16MsgLength,file_name,table_name,hdlNum,dataBaseCmd,opType,context)
        log_debug(sendMsg)
        sendList = struct.unpack(sendMsgFmt, sendMsg)
        log_debug(sendList)
        #pdb.set_trace()
        recMsgFmt = '!4HBIII500sI'
        socket_client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        if os.path.exists('/tmp/socket_mesh_client' + index_value): # socket_mesh_client[int]
            os.unlink('/tmp/socket_mesh_client' + index_value)
        socket_client.bind('/tmp/socket_mesh_client' + index_value)
        socket_client.connect('/tmp/socket_mesh_server' + index_value) # socket_mesh_server[int]
        fmtlen = struct.calcsize(recMsgFmt)
        bufsize=struct.calcsize(recMsgFmt)

        log_debug(fmtlen)

        socket_client.send(sendMsg)
        data=socket_client.recv(bufsize)
        #pdb.set_trace()
        if not len(data):
            print 'data is error'
        else:
            rspList = struct.unpack('!4HBIII500sI', data)
            header1, header2, header3, header4, type, res, ctx, rown, errMsg, reslen = struct.unpack('!4HBIII500sI', data)
        log_debug(rspList)
        #print header1, header2, header3, header4, type, res, ctx, rown, errMsg, reslen
        #pdb.set_trace()
        if 0 != reslen:
            data=socket_client.recv(reslen)
            if None != expect_value:
                rspList = struct.unpack('I', data)
                log_debug(rspList[0])
                if int(expect_value) != rspList[0]:
                    Log.log_trace('expect: ' + expect_value + ', which is: ' + str(rspList[0]), Log.ERROR_LEVEL)
                    socket_client.close()
                    return -1

        socket_client.close()
        log_debug('database socke close')