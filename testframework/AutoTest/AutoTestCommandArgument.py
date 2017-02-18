# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__=['AutoTestCommandArgument'];

import os;
import stat;
import socket;
import argparse;
from gettext import gettext as _;

def IPConve(ip):
    try :
        ip = socket.gethostbyname(ip) 
    except:
        pass
    return socket.inet_aton(ip)

FileDirectory = '';
FileName = '';

def FileDirectoryCheck(dire):
    global FileName;
    global FileDirectory;

    file = dire + os.sep + FileName;

    # all other arguments are used as file names
    try:
        if FileName:
            statinfo = os.stat(dire + os.sep + FileName);
            if (statinfo.st_mode | stat.S_IFREG):
                pass
            else :
                message = _("can't open '%s': %s");
                raise argparse.ArgumentTypeError(message % (file, file));
    except IOError as e:
        message = _("can't open '%s': %s");
        raise argparse.ArgumentTypeError(message % (file, e));
    except WindowsError as e:
        message = _("can't open '%s': %s");
        raise argparse.ArgumentTypeError(message % (file, e));

    FileDirectory=dire;

    return dire;

def FileNameCheck(file):
    global FileName;
    global FileDirectory;

    filename = FileDirectory + os.sep + file;

    # all other arguments are used as file names
    try:
        if FileDirectory:
            statinfo = os.stat(filename);
            if (statinfo.st_mode | stat.S_IFREG):
                pass
            else:
                message = _("can't open '%s': %s");
                raise argparse.ArgumentTypeError(message % (filename, filename));
    except IOError as e:
        message = _("can't open '%s': %s");
        raise argparse.ArgumentTypeError(message % (filename, e));
    except WindowsError as e:
        message = _("can't open '%s': %s");
        raise argparse.ArgumentTypeError(message % (filename, e));

    FileName=file;

    return file;

def DirNameCheck(d):
    # all other arguments are used as file names
    try:
            statinfo = os.stat(d);
            if (stat.S_ISDIR(statinfo.st_mode)):
                pass
            else:
                message = _("can't open %s");
                raise argparse.ArgumentTypeError(message % (d));
    except IOError as e:
        message = _("can't open '%s': %s");
        raise argparse.ArgumentTypeError(message % (d, e));
    except WindowsError as e:
        message = _("can't open '%s': %s");
        raise argparse.ArgumentTypeError(message % (d, e));

    return d;

class AutoTestCommandArgument(object):
  def __init__(self):
    self.parser = argparse.ArgumentParser();
    subparsers = self.parser.add_subparsers(title='Project', dest="Project",
                                    description='choose project', help='Project');

    lteSubParser = subparsers.add_parser("LTE", help = "run LTE feature");
    self._LTECommandArgument(lteSubParser);

    meshSubParser = subparsers.add_parser("MESH", help = "run MESH feature");
    self._MESHCommandArgument(meshSubParser);

    self.parser.add_argument("-v", "--version", action='version', version='%(prog)s 4.0');

  def _LTERealCommandArgument(self, parser):
    subparsers = parser.add_subparsers(title='Option', dest="Option",
                  description='choose option', help='Option');
    parser_uploadCGI = subparsers.add_parser("uploadCGI", help = "upload tools cgi file to bbu");

    parser_exec = subparsers.add_parser("test", help = "Execute test");
    parser_exec.add_argument("--versionpath", dest="versionpath", type=DirNameCheck, help = "version path");
    parser_exec.add_argument("--enbip", dest="enbip", type=IPConve, required = True, help="enb ip");
    parser_exec.add_argument("--epcip", dest="epcip", type=IPConve, required = True, help="epc ip");
    parser_exec.add_argument("--enbid", dest="enbid", type=int, required = True, help="enb id");
    parser_exec.add_argument("--enbname", dest="enbname", type=str, required = True, help="ebn name");
    parser_exec.add_argument("--redis", dest="redis", type=IPConve, help="redis host");
    parser_exec.add_argument("--rport", dest="rport", type=int, default= 6379, help="redis server port");
    parser_exec.add_argument("--rkey", dest="rkey", type=str, help="redis key");
    parser_exec.add_argument("--slave_ue", dest="slaveUEIP", type=IPConve, help="slave_ue ip");
    parser_exec.add_argument("--sue_port", dest="slaveUEPort", type=int, default = 3000, help="slave_ue port");
    parser_exec.add_argument("--logpath", dest="logpath", type=str, default='log', help="log path. default log");
    parser_exec.add_argument("--grouppath", dest="grouppath", type=FileDirectoryCheck, default='TestCaseGroup', help="test cast group path. default TestCaseGroup");
    parser_exec.add_argument("--file", dest="file", type=FileNameCheck, default='StartConfig.xml', help="test cast group xml file path. default StartConfig.xml");

  def _LTESimCommandArgument(self, parser):
    parser.add_argument("--enbip", dest="enbip", type=IPConve, required = True, help="enb ip");
    parser.add_argument("--epcip", dest="epcip", type=IPConve, required = True, help="epc ip");
    parser.add_argument("--enbid", dest="enbid", type=int, required = True, help="enb id");
    parser.add_argument("--enbname", dest="enbname", type=str, required = True, help="ebn name");
    parser.add_argument("--eth", dest="eth", type=str, default='eth1', help="eth name. default eno1");
    parser.add_argument("--enbpath", dest="enbpath", type=str, default='enb' + os.sep + 'output', help="enb path. default enb" + os.sep + "output");
    parser.add_argument("--uepath", dest="uepath", type=str, default='ue' + os.sep + 'targets'  + os.sep + 'UE', help="enb path. default ue" + os.sep + "targets"  + os.sep + "UE");
    parser.add_argument("--startenb", dest="startenb", type=int, default=1, choices=[0,1], help="start enb flag. default 1");
    parser.add_argument("--startue", dest="startue", type=int, default=1, choices=[0,1], help="start ue flag. default 1");
    parser.add_argument("--redis", dest="redis", type=IPConve, required = True, help="redis host");
    parser.add_argument("--rport", dest="rport", type=int, default= 6379, help="redis server port");
    parser.add_argument("--rkey", dest="rkey", type=str, required = True, help="redis key");
    parser.add_argument("--wait", dest="wait", type=int, default=10, help="wait set docker network.");
    parser.add_argument("--logpath", dest="logpath", type=str, default='log', help="log path. default log");
    parser.add_argument("--grouppath", dest="grouppath", type=FileDirectoryCheck, default='TestCaseGroup', help="test cast group path. default TestCaseGroup");
    parser.add_argument("--file", dest="file", type=FileNameCheck, default='StartConfig.xml', help="test cast group xml file path. default StartConfig.xml");

  def _LTECommandArgument(self, parser):
    subparsers = parser.add_subparsers(title='Platform', dest="Platform",
                    description='choose platform', help='Platform');

    realSubParsers = subparsers.add_parser("real", help = "real platform");
    self._LTERealCommandArgument(realSubParsers);

    simSubParsers = subparsers.add_parser("sim", help = "sim platform");
    self._LTESimCommandArgument(simSubParsers);

  def _MeshRealCommandArgument(self, parser):
    parser.add_argument("--logpath", dest="logpath", type=str, default='log', help="log path. default log");
    parser.add_argument("--grouppath", dest="grouppath", type=FileDirectoryCheck, default='TestCaseGroup', help="test cast group path. default TestCaseGroup");
    parser.add_argument("--file", dest="file", type=FileNameCheck, default='StartConfig.xml', help="test cast group xml file path. default StartConfig.xml");
    parser.add_argument("--redis", dest="redis", type=IPConve, required = True, help="redis host");
    parser.add_argument("--rport", dest="rport", type=int, default= 6379, help="redis server port");
    parser.add_argument("--rkey", dest="rkey", type=str, required = True, help="redis key");

  def _MeshSimCommandArgument(self, parser):
    parser.add_argument("--enbpath", dest="enbpath", type=str, default='enb' + os.sep + 'output', help="enb path. default enb" + os.sep + "output");
    parser.add_argument("--logpath", dest="logpath", type=str, default='log', help="log path. default log");
    parser.add_argument("--grouppath", dest="grouppath", type=FileDirectoryCheck, default='TestCaseGroup', help="test cast group path. default TestCaseGroup");
    parser.add_argument("--file", dest="file", type=FileNameCheck, default='StartConfig.xml', help="test cast group xml file path. default StartConfig.xml");
    parser.add_argument("--redis", dest="redis", type=IPConve, required = True, help="redis host");
    parser.add_argument("--rport", dest="rport", type=int, default= 6379, help="redis server port");
    parser.add_argument("--rkey", dest="rkey", type=str, required = True, help="redis key");
    parser.add_argument("--wait", dest="wait", type=int, default=10, help="wait set docker network.");

  def _MESHCommandArgument(self, parser):
    subparsers = parser.add_subparsers(title='Platform', dest="Platform",
                    description='choose platform', help='Platform');

    realSubParsers = subparsers.add_parser("real", help = "real platform");
    self._MeshRealCommandArgument(realSubParsers);

    simSubParsers = subparsers.add_parser("sim", help = "sim platform");
    self._MeshSimCommandArgument(simSubParsers);

  def getOption(self, argv):
    args = self.parser.parse_args(argv);
    options = vars(args);
    return options;