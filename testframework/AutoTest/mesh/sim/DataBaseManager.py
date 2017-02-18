# -*- coding:utf-8 -*-

__author__ = 'user'

import os
import sqlite3

import Log


# class
class DataBaseManager:
    def __init__(self, file_name):
        self.db_file = file_name
        self.command_list = []

    #
    def init_database(self):
        if os.path.isfile(self.db_file):
            return 0
        else:
            Log.log_trace('DB:init_database fail' + self.db_file)
            return -1

    #
    def add_update_command(self, table_name, field_name, value, whereas=''):
        self.command_list.append('update ' + table_name + ' set ' + field_name + ' = ' + value + whereas)

    #
    def execute_command(self):
        if 0 != self.init_database():
            return -1

        cx = sqlite3.connect(self.db_file)
        cu = cx.cursor()
        # pdb.set_trace()
        for item in self.command_list:
            # sql command
            Log.log_trace(item, Log.DEBUG_LEVEL)
            # exec
            cu.execute(item)

        cx.commit()
        cu.close()
        cx.close()

        return 0
