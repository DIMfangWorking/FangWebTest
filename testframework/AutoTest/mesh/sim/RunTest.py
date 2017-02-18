# -*- coding:utf-8 -*-

__author__ = 'user'

import sys
import os
import re

import Log
from multiprocessing import cpu_count
from TestCaseManager import TestCaseManager
import SyncAssist

import GlobalVar
from CIClient import CIClient

class Test:
    def __init__(self):
        pass;

    def init(self):
        code_path = self.ci_client.get_code_path()

        old_path = os.getcwd()
        if os.path.exists(GlobalVar.get_instance().get_test_log_path()[:-1]):
            pass # os.system('rm -rf ' + GlobalVar.get_instance().get_test_log_path()[:-1])
        else:
            os.mkdir(GlobalVar.get_instance().get_test_log_path()[:-1])

        # os.system('mkdir ' + GlobalVar.get_instance().get_test_log_path()[:-1])
        os.chdir(GlobalVar.get_instance().get_test_log_path())
        os.system('touch ' + GlobalVar.get_instance().get_test_report_filename())
        os.system('touch ' + GlobalVar.get_instance().get_make_result_filename())

        os.chdir(old_path)
        return 0


    def build_mesh_app(self):
        dbg_trace = Log.DebugTrace('Build mesh_app')
        os.chdir(GlobalVar.get_instance().get_mesh_code_path())
        os.system('rm -rf ./output/mesh_app')
        os.system('make clean ' + ' >& ' \
                  + GlobalVar.get_instance().get_test_log_path() + GlobalVar.get_instance().get_make_result_filename())
        os.system('make -j' + str(cpu_count()) + '>& ' \
                  + GlobalVar.get_instance().get_test_log_path() + GlobalVar.get_instance().get_make_result_filename())

        ret = os.path.exists('./output/mesh_app')

        os.chdir(GlobalVar.get_instance().get_test_script_path())

        if False == ret:
            Log.log_trace('build_mesh_app failed!', Log.ERROR_LEVEL)
            Log.log_trace('error log:' + GlobalVar.get_instance().get_test_log_path() + GlobalVar.get_instance().get_make_result_filename(),
                      Log.ERROR_LEVEL)
            return -1

        # os.system('rm -f ' + GlobalVar.get_instance().get_test_log_path() + GlobalVar.get_instance().get_make_result_filename())
        Log.log_trace('build_mesh_app success!')
        return 0

    # 开始测试
    def run_test(self):
        dbg_trace = Log.DebugTrace('run_test test')

        # 初始化
        result = self.init()
        if (0 != result):
            return result

        # 编译
        result = self.build_mesh_app()
        if (0 != result):
            return result

        # 启动同步
        sync_control = SyncAssist.SyncControl(GlobalVar.get_instance().get_ci_agent_name()[15:])
        result = sync_control.run_sync_control()
        if (0 != result):
            return result

        # 执行测试用例 run_all_test_case()
        tcm = TestCaseManager(test_case_path = GlobalVar.get_instance().get_test_case_path(),
                              test_case_list_filename = 'run.list')
        tcm.gen_test_case_list()
        result = tcm.run_all_test_case()
        if (0 != result):
            return result

        # 停止同步
        result = sync_control.stop_sync_control()
        if (0 != result):
            return result

        self.ci_client.update_ci_state()

        return 0

# main
if "__main__" == __name__:
    dbg_trace = Log.DebugTrace('Mesh Test')

    test = Test()

    # 运行测试
    result = test.run_test()
    # 生成测试报告
    test.gen_report()

    if 0 != result:
        exit(result)
    # end test