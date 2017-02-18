__author__ = 'user'

import os

#
class CIAgentInfo:
    def __init__(self):
        self.name = "mesh_CI_agent_00"
        self.build_num = "00"

    def set_name(self, name):
        self.name = name

    def get_name(self):
        return self.name


    def get_index(self):
        if 15 < len(self.name):
            return self.name[15:]
        else:
            return "00"

    def set_build_num(self, build_num):
        self.build_num = build_num

    def get_build_num(self):
        return self.build_num

    def set(self, name, build_num):
        self.name = name
        self.build_num = build_num

    def get(self):
        return self.get_name(), self.get_index(), self.get_build_num()

    def get_link(self):
        return 'http://172.31.3.250:8080/job/' + self.get_name() + '/'

    def to_string(self):
        return "agent_name:" + self.get_name() + "\nbuild_num:" + self.get_build_num()

    def print_context(self):
        print self.to_string()


class TestPath:
    def __init__(self):
        self.mesh_code_rel_path = "/mesh/branches/MESH_v1.0.2.0/codebts/"
        self.mesh_code_path = ""
        self.mesh_sync_assist_file_path = self.mesh_code_rel_path + "codebts/codemesh/RTL2/arch/linux/"
        self.test_script_rel_path = "/TestScript/"
        self.test_root_path = "/home/jenkins/workspace/"
        self.test_log_rel_path = "/TestLog/"
        self.make_result_filename = "make_result.log"
        self.test_report_filename = "test_report.log"
        self.test_case_rel_path = "/TestCaseGroup/"
        self.ci_agent_name = ""
        self.build_num = ""

    def set_ci_agent_info(self, ci_agent_name, build_num):
        self.ci_agent_name = ci_agent_name
        self.build_num = build_num
        self.make_result_filename = ci_agent_name + '_' + build_num + '_' + self.make_result_filename
        self.test_report_filename = ci_agent_name + '_' + build_num + '_' + self.test_report_filename


    def get_mesh_code_path(self):
        return self.mesh_code_path
        # return self.test_root_path + self.mesh_code_rel_path

    def set_mesh_code_path(self, code_path):
        self.mesh_code_path = code_path

    def get_test_script_path(self):
        return self.test_root_path + self.test_script_rel_path

    def get_test_case_path(self):
        return self.test_root_path + self.test_case_rel_path

    def get_test_log_path(self):
        return self.test_root_path + self.test_log_rel_path

    def set_test_root_path(self, ci_agent_name):
        self.test_root_path += ci_agent_name + "/mesh_test"

    def get_test_root_path(self):
        return self.test_root_path

    def get_mesh_sync_assist_file_path(self):
        return self.test_root_path + self.mesh_sync_assist_file_path

    def get_make_result_filename(self):
        return self.make_result_filename

    def get_test_report_filename(self):
        return self.test_report_filename

    def to_string(self):
        return 'MeshCode Path:' + self.get_mesh_code_path() + \
               '\nTestScript Path:' + self.get_test_script_path() + \
               '\nTestLog Path:' + self.get_test_log_path()

    def print_context(self):
        print self.to_string()


#
class GlobalVar:
    def __init__(self):
        self.ci_agent_info = CIAgentInfo()
        self.test_path = TestPath()

    def init(self, ci_agent_name, build_num):
        self.ci_agent_info.set(ci_agent_name, build_num)
        self.test_path.set_test_root_path(ci_agent_name)
        self.test_path.set_ci_agent_info(ci_agent_name, build_num)

    def get_ci_agent_name(self):
        return self.ci_agent_info.get_name()

    def get_ci_agent_build_num(self):
        return self.ci_agent_info.get_build_num()

    def get_ci_agent_index(self):
        return self.ci_agent_info.get_index()

    def get_ci_agent_link(self):
        return self.ci_agent_info.get_link()

    def get_mesh_code_path(self):
        return self.test_path.get_mesh_code_path()

    def set_mesh_code_path(self, code_path):
        self.test_path.set_mesh_code_path(code_path)

    def get_test_script_path(self):
        return self.test_path.get_test_script_path()

    def get_test_case_path(self):
        return self.test_path.get_test_case_path()

    def get_test_log_path(self):
        return self.test_path.get_test_log_path()

    def get_test_root_path(self):
        return self.test_path.get_test_root_path()

    def get_mesh_sync_assist_file_path(self):
        return self.test_path.get_mesh_sync_assist_file_path()

    def get_make_result_filename(self):
        return self.test_path.get_make_result_filename()

    def get_test_report_filename(self):
        return self.test_path.get_test_report_filename()

    def get_mesh_log_file(self):
        dir = self.get_test_log_path()

        list = os.listdir(dir)
        result = []
        for filename in list:
            if filename.find('_' + self.get_ci_agent_build_num()) >= 0 and filename.find('mesh') >= 0 and \
               filename.find('stdout') >= 0 and filename.find(self.get_ci_agent_name()) >= 0:
                result.append(filename)

        return result


    def print_context(self):
        self.ci_agent_info.print_context()
        self.test_path.print_context()

#
g_global_data = GlobalVar()


def get_instance():
    return g_global_data

#
if '__main__' == __name__:
    g_global_data.print_context()