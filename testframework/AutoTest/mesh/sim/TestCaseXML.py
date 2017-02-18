__author__ = 'user'
# test group xml and test case xml

import Log

from lxml import etree

import MeshDeviceManager as MDM
import CommandManager as CM

__debug_flag = False

def log_debug(info):
    global __debug_flag
    if __debug_flag:
        Log.log_trace(info, Log.DEBUG_LEVEL)

# base xml
class TestXML:
    def __init__(self, file_path, file_name):
        self.file_path = file_path
        self.file_name = file_name

    #
    def parse(self):
        pass

class TestGroupXML(TestXML):
    def __init__(self, file_path, file_name):
        TestXML.__init__(self, file_path, file_name)

    #
    def parse(self):
        doc = etree.parse(self.file_path + self.file_name)
        root = doc.getroot()
        mesh_devices = []
        mesh_topo = None

        tcg_name = root.get('tcg_name')
        log_debug(tcg_name)

        for item in root:
            if 0 == cmp(item.tag, 'tcg_mesh_devices'):
                mesh_devices = self.__load_mesh_devices(item)
            elif 0 == cmp(item.tag, 'tcg_mesh_topo_cfg'):
                mesh_topo = self.__load_mesh_topo_config(item)
            else:
                Log.log_trace('unknown tag: ' + item.tag)

        if (None != tcg_name) and (None != mesh_devices):
            return tcg_name, MDM.MeshDeviceManager(mesh_devices, mesh_topo)
        else:
            return None, None

    #
    def __load_mesh_devices(self, root):
        mesh_device_list = []
        for device_item in root:
            mesh_nodes = []
            mesh_userip = []

            device_name = device_item.get('device_name')
            log_debug(device_name)

            for sub_item in device_item:
                if 0 == cmp(sub_item.tag, 'device_userip'):
                    userip = self.__load_mesh_userip(sub_item)
                    if (None != userip):
                        mesh_userip.append(userip)
                elif 0 == cmp(sub_item.tag, 'device_node'):
                    node = self.__load_mesh_node(sub_item)
                    if None != node:
                        mesh_nodes.append(node)
                else:pass

            if (None != device_name) and (0 < len(mesh_userip)) and (0 < len(mesh_nodes)):
                mesh_device = MDM.MeshDevice(device_name, mesh_userip, mesh_nodes)
                mesh_device_list.append(mesh_device)

        if (0 != len(mesh_device_list)):
            return mesh_device_list
        else:
            return None

    #
    def __load_mesh_userip(self, root):
        userip_ip = root.get('userip_ip')
        userip_netmask = root.get('userip_netmask')

        log_debug(userip_ip + '  ' + userip_netmask)

        if (None != userip_ip) and (None != userip_netmask):
            return MDM.UserIP(userip_ip, userip_netmask)
        else:
            return None

    def __load_mesh_node(self, root):
        node_inid = root.get('node_inid')
        node_id = root.get('node_id')

        log_debug(node_inid + '  ' + node_id)

        if (None != node_inid) and (None != node_id):
            return MDM.MeshNode(node_inid, node_id)
        else:
            return None

    #
    def __load_mesh_topo_config(self, root):
        topo_name = root.get('topo_name')
        if None == topo_name:
            topo_name = 'topo_default'
            return MDM.MeshTopo(topo_name)
        else:
            mesh_topo = MDM.MeshTopo(topo_name)
            for sub_item in root:
                if 0 == cmp(sub_item.tag, 'topo_rel'):
                    mesh_topo.add_nbr_node_rel(self.__load_topo_rel(sub_item))
            return mesh_topo

    #
    def __load_topo_rel(self, root):
        node_id = root.get('node_id')
        nbr_node_list = []
        if None != node_id:
            for sub_item in root:
                if 0 == cmp(sub_item.tag, 'nbr_node_id'):
                    if nbr_node_list.__contains__(int(sub_item.text)):
                        pass
                    else:
                        nbr_node_list.append(int(sub_item.text))
        else:
            return None

        nbr_node_rel = MDM.NbrNodeRelation(node_id)
        nbr_node_rel.update_nbr_nodes(nbr_node_list)
        return nbr_node_rel

class TestCaseXML(TestXML):
    def __init__(self, file_path, file_name):
        TestXML.__init__(self, file_path, file_name)
        self.cmd_param_list = []

    def parse(self):
        doc = etree.parse(self.file_path + self.file_name)
        root = doc.getroot()

        tc_name = root.get('tc_name')
        log_debug(tc_name)

        if None == tc_name:
            return None

        for cmd_group in root:
            self.__load_cmd_group(cmd_group)

        if 0 != len(self.cmd_param_list):
            return tc_name, self.cmd_param_list
        else:
            return None, None

    def __load_cmd_group(self, root):
        times = root.get('times')
        log_debug('times: ' + times)

        if None == times:
            times = 1
        else:
            times = int(times)

        while 0 < times:
            times -= 1
            for cmd in root:
                if 0 == cmp(cmd.tag, 'command'):
                    self.__load_command(cmd)
                else:
                    Log.log_trace('unknow tag: '+str(cmd.tag))

    def __load_command(self, root):
        name = root.get('cmd_name')
        cmd = root.get('cmd_cmd')
        obj = root.get('cmd_obj')

        if (None == name) or (None == cmd) or (None == obj):
            return

        param = CM.CommandParam(name, cmd, obj)

        for item in root:
            if 0 == cmp(item.tag, 'timeout'):
                param.timeout = item.text
            elif 0 == cmp(item.tag, 'sponsor_node_id'):
                param.sponsor_node_id = item.text
            elif 0 == cmp(item.tag, 'expect'):
                param.expect = item.text
            elif 0 == cmp(item.tag, 'dst_ip'):
                param.dst_ip = item.text
            elif 0 == cmp(item.tag, 'package_len'):
                param.package_len = item.text
            elif 0 == cmp(item.tag, 'times'):
                param.times = item.text
            elif 0 == cmp(item.tag, 'lch_num'):
                param.lch_num = item.text
            elif 0 == cmp(item.tag, 'title'):
                param.title = item.text
            elif 0 == cmp(item.tag, 'step'):
                param.step_list.append(item.text)
            elif 0 == cmp(item.tag, 'db_opt'):
                param.db_opt = item.text
            elif 0 == cmp(item.tag, 'db_table'):
                param.db_table = item.text
            elif 0 == cmp(item.tag, 'db_sql'):
                param.db_sql = item.text

        log_debug(param)

        self.cmd_param_list.append(param)

if '__main__' == __name__:
    tg_xml = TestGroupXML('', 'TestCaseGroup_Init.xml')

    mesh_device_manager = tg_xml.parse()

    tc_xml = TestCaseXML('', 'TestCase_Access.xml')
    cmd_param = tc_xml.parse()
