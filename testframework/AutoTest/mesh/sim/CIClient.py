# -*- coding:utf-8 -*-

import os
import sys
import pdb
import mysql.connector
import subprocess
import logging

import Log

__debug_flag = False

def log_debug(info):
    global __debug_flag
    if __debug_flag:
        Log.log_trace(info, Log.DEBUG_LEVEL)

# CI 客户端
class CIClient:

    def __init__(self, agent_name):

        self.branch_path_prefix = '/home/jenkins/workspace/'+agent_name+'/mesh_test/mesh'

        self.name = agent_name

        self.cnx = mysql.connector.connect(host='172.31.2.28',user='root',password='',database='jira')

        self.cur = self.cnx.cursor()

        self.branch = ''

        self.revision = ''

        self.issue_id = ''

        self.author = ''

        self.comment = ''

        self.test_case = None



    def __del__ (self):

        self.cur.close()
        self.cnx.close()


    def get_issue_info (self):
        dbg_trace = Log.log_trace('CIClient::get_issue_info')
        #pdb.set_trace()
        query = "select issue_id,author,comment from ci_info where revision = '%s'" %(self.revision)
        # print query
        self.cur.execute(query)
        
        result = self.cur.fetchall()
        
        if len(result) == 0:

            return 

        self.issue_id,self.author,self.comment = result[0]
        print result[0]

    def get_mission (self):
        dbg_trace = Log.log_trace('CIClient::get_mission')
        query = "select branch,branch_path,revision,test_case from ci_agent_info where name = '%s' and state='wait_start'" %(self.name)
        # print query
        #pdb.set_trace()

        self.cur.execute(query)

        result = self.cur.fetchall()
        
        if len(result) == 0:

            return (None,None)

        branch, branch_path, revision, test_case = result[0]

        self.test_case = str(test_case)

        self.revision = str(revision)

        self.branch = str(branch)

        code_path = self.branch_path_prefix + str(branch_path)

        print code_path, revision

        return (code_path,self.revision)


   

    def get_code_path (self):
        dbg_trace = Log.log_trace('CIClient::get_code_path')
        code_path,revision = self.get_mission()

        self.get_issue_info()
		
        if code_path == None:
                        
            return None

        old_path = os.getcwd()
        os.chdir(code_path)

        os.system('svn up -r '+revision)

        os.chdir(old_path)
        # print code_path
        return code_path

    def get_test_case (self):

        return self.test_case


    def release_agent (self):

        update = "update ci_agent_info set state = 'idle' where name = '%s'" %(self.name)

        self.cur.execute(update)

        self.cnx.commit()



    def update_ci_state (self):

        update = "update ci_info set is_ci_passed = '1' where revision <= '%s' and branch = '%s'" %(self.revision,self.branch)

        self.cur.execute(update)

        self.cnx.commit()


