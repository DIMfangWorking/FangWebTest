import os;
import sys;
import shlex;
import subprocess;
from multiprocessing import cpu_count;

class Compile(object):
    basic_dir = '/home/guow/code';
    enb_dir = './enb/output';
    log_file = 'log' + os.sep + 'make_output.txt'

    def __init__(self, url, revision, svn_user, svn_password):
        self.url = url;
        self.revision = revision;
        self.svn_user = svn_user;
        self.svn_password = svn_password;

    def downloadSource(self):
        if os.path.exists(Compile.basic_dir + '/.svn'):
            cmd = 'svn upgrade ' + Compile.basic_dir;
            os.system(cmd);
            cmd = 'svn update --no-auth-cache --username ' + self.svn_user + \
                ' --password '+ self.svn_password +' -r ' + \
                self.revision + ' ' + Compile.basic_dir;
        else:
            cmd = 'svn co --no-auth-cache --username ' + self.svn_user + \
                ' --password '+ self.svn_password +' -r ' + \
                self.revision + ' ' + self.url + ' ' + Compile.basic_dir

        print cmd
        result = os.system(cmd);
        if 0 <> result:
            print "svn checkout failed";
        else:
            print "svn checkout success";
        return result;

    def compile(self):
        os.system('make -C ' + Compile.basic_dir +' clean >/dev/null')
        cmd =  'make -C ' + Compile.basic_dir + ' >%s 2>&1' %Compile.log_file;
        print cmd
        result = os.system(cmd);
        if 0 <> result:
            print 'build enb failed';
        else :
            print 'build enb success';

        return result;

    def moveFileToRunDir(self, runDir):
        print 'move file to ' + runDir;

        cmd = 'rm -rf ' + runDir + os.sep + '*';
        print cmd;
        result = os.system(cmd);
        if 0 <> result:
            return result;
        else :
            print 'rm file success';

        cmd = 'cp ' + Compile.basic_dir + os.sep + 'output' + os.sep + 'lte_app ' + runDir;
        print cmd;
        result = os.system(cmd);
        if 0 <> result:
            return result;
        else :
            print 'move lte_app file success';

        cmd = 'cp ' + Compile.basic_dir + os.sep + 'output' + os.sep + 'lte.db ' + runDir;
        print cmd;
        result = os.system(cmd);
        if 0 <> result:
            return result;
        else :
            print 'move db file success';

        return result;

    def result(self):
        pass;