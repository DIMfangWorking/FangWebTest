# -*- coding:utf-8 -*-

import socket
import subprocess
import struct
import os
import pdb
import datetime
import signal
import shlex

from Atom import Atom
from DbMng import DbMng

class AtomEnb(Atom):
	def __init__(self, item, group):
		self.testMng = group.testMng;
		Atom.__init__(self, item, group);
		self.LoadSubInfo(item);
		self.initUeInfo();
		self.initEnbInfo();
		self.sqlList = [];
		self.group = group;

	def initUeInfo(self):
		pass

	def LoadSubInfo(self, item):
		self.type = item.get('name')
		if self.type == None:
			self.type = 'src_enb'
		self.enbId = item.text

	def initEnbInfo(self):
		self.enbName = str('Enb_'+ self.enbId)
		self.enbPreId = str(int(self.enbId))
		self.cellId1 = int(self.enbId) + 1
		self.cellId2 = int(self.enbId) + 2
		self.phyCellId = str(self.enbId)
		self.phyCellId1 = str(self.cellId1)
		self.phyCellId2 = str(self.cellId2)
		self.enbIp = socket.inet_ntoa(self.testMng.enbip);
		self.dbName = 'lte' + self.enbPreId + '.db';

		self.enbHexPackStringIp = hex(int(socket.ntohl(struct.unpack('I',self.testMng.enbip)[0])))[2:]
		self.startTime = datetime.datetime.utcnow().strftime('%Y_%m_%d_%H%M%S')

	def ModifyDb(self):
		# print self.ModifyDb
		hexIp = int(socket.ntohl(struct.unpack('I',self.testMng.enbip)[0]))
		sql = "update T_IPV4 set au8IPAddr = X'%8.8X';" %hexIp
		self.sqlList.append(sql)
		#hexIp = socket.ntohl(struct.unpack('I',socket.inet_aton(SystemCfg.EPC_IP))[0])
		hexIp = int(socket.ntohl(struct.unpack('I',self.testMng.epcip)[0]))
		sql = "update T_SCTP set au8DstIP1 = X'%8.8X'" %hexIp
		self.sqlList.append(sql)
		sql = 'update T_SCTP set u16RemotPort = 36412'
		self.sqlList.append(sql)
		sql = 'update T_SCTP set u16LocPort = 36412'
		self.sqlList.append(sql)
		sql = 'update T_OMC set au8OmcServerIP = X\'%8.8X\', u16SrcPort = 4999, u16DstPort = 4999' %hexIp
		self.sqlList.append(sql)
		sql = 'update T_ENB_PARA set u32eNBId = %d, au8eNBName = \'%s\'' %(int(self.enbId),'xwcloudtest');
		self.sqlList.append(sql)
		sql = 'update T_ENB_PARA set u8UserInactTimer = 19'
		self.sqlList.append(sql)
		sql = 'update T_CEL_PARA set u16PhyCellId = ' + self.phyCellId + ' where  u8CID=252'
		self.sqlList.append(sql)
		sql = 'update T_CEL_PARA set u16PhyCellId = ' + self.phyCellId1 + ' where  u8CID=253'
		self.sqlList.append(sql)
		sql = 'update T_CEL_PARA set u16PhyCellId = ' + self.phyCellId2 + ' where  u8CID=254'
		self.sqlList.append(sql)

		if 1 < len(self.group.enbList):
			NrbEnb = self.case.GetNrbEnb(aotmEnb = self)
			sqlCmd = 'update T_CEL_NBRCEL set u32NbreNBId =' + NrbEnb.enbId + ' where u8SvrCID=252'
			self.sqlList.append(sqlCmd)
			sqlCmd = 'update T_CEL_NBRCEL set u16PhyCellId =' + NrbEnb.phyCellId + ' where u8SvrCID=252'
			self.sqlList.append(sqlCmd)
			sqlCmd = 'update T_CEL_NBRCEL set u8NbrCID = 252 where u8SvrCID=252'
			self.sqlList.append(sqlCmd)

		self.dbm = DbMng(self.testMng.enbpath, self.dbName)
		self.dbm.AddSql(self.sqlList)

		self.dbm.excuteCmd()

	def StartEnb(self):
		# evt_ip = os.popen("ifconfig "+ self.testMng.eth + "|grep 'inet addr'|awk '{print $2}'").read();
		# evt_ip = evt_ip[evt_ip.find(':')+1:evt_ip.find('\n')];
		# evt_ip1 = os.popen("ifconfig "+ self.testMng.eth + ":" + self.enbPreId + "|grep 'inet addr'|awk '{print $2}'").read();
		# evt_ip1 = evt_ip1[evt_ip1.find(':')+1:evt_ip1.find('\n')];
		# if evt_ip != self.enbIp and evt_ip1 != self.enbIp:
		# 	os.system('ifconfig '+ self.testMng.eth + ':'+ self.enbPreId + ' ' + self.enbIp + ' netmask 255.255.255.0');

		if self.type != 'tgt_enb':
			# cmd = (self.testMng.enbpath  + os.sep + 'lte_app', '111', self.dbm.file);
			cmd = ('./lte_app', '111', self.dbName);
		else:
			# cmd = (self.testMng.enbpath  + os.sep + 'lte_app', '222', self.dbm.file);
			cmd = ('./lte_app', '222', self.dbName);

		nomal_log = self.group.groupLogPath + os.sep + 'enb_' + self.enbId + '_'+ self.type + '_'+ self.startTime + '_stdout.log';
		err_log = self.group.groupLogPath + os.sep + 'enb_' + self.enbId + '_'+ self.type + '_'+ self.startTime +'_stderr.log';
		if os.path.isfile(nomal_log):
			os.unlink(nomal_log);
			os.unlink(err_log);
		self.enb_nomal_fd = open(nomal_log, 'w+');
		self.enb_err_fd = open(err_log,'w+');
		#start lte_app
		self.lte_app = subprocess.Popen(cmd, stdout= self.enb_nomal_fd.fileno(), stderr = self.enb_err_fd.fileno(), cwd = self.testMng.enbpath + os.sep);
		print('enb ', self.enbId ,'start pid', self.lte_app.pid, ' cmd ', cmd);
		pass;

	def StartUe(self):
		if ('tgt_enb' != self.type):
			NrbEnb = self.group.GetNrbEnb(aotmEnb = self);
			# 默认源enb的ip在前
			predir = os.getcwd();
			os.chdir(self.testMng.uepath);
			curpath = os.getcwd();
			if None != NrbEnb:
				# cmd = (curpath + os.sep + 'UE', self.enbIp, NrbEnb.enbIp);
				cmd = ('./UE', self.enbIp, NrbEnb.enbIp);
			else:
				# cmd = (curpath + os.sep + 'UE', self.enbIp);
				cmd = ('./UE', self.enbIp, '460%3.3d912130001' % int(self.enbId));

			nomal_log = predir + os.sep + self.group.groupLogPath + os.sep + 'ue_'+ self.startTime +'_stdout.log';
			err_log = predir + os.sep + self.group.groupLogPath + os.sep + 'ue_'+ self.startTime +'_stderr.log';
			if os.path.isfile(nomal_log):
				os.unlink(nomal_log);
				os.unlink(err_log);
			self.ue_nomal_fd = open(nomal_log, 'w+');
			self.ue_err_fd = open(err_log,'w+');
			self.ue = subprocess.Popen(cmd, stdout=self.ue_nomal_fd.fileno(), stderr=self.ue_err_fd.fileno(), cwd = '/home/xinwei/trunk/OpenAir4G/targets/UE');
			# self.ue = subprocess.Popen(cmd, stdout=self.ue_nomal_fd.fileno(), stderr=self.ue_err_fd.fileno(), cwd = '/home/xinwei/code/testframework/ue/targets/UE');
			print('ue start pid:', self.ue.pid, ' cmd ', cmd);
			os.chdir(predir);
		pass

	def StartTcpdump(self):
		outFile = self.group.groupLogPath + os.sep + 'tcpdump_' + self.enbId + '_'+ self.type + '_'+ self.startTime + '.pcap';
		cmd = 'tcpdump -i ' + self.testMng.eth + ' -w ' + outFile;
		self.tcpdump = subprocess.Popen(shlex.split(cmd));
		print('tcpdump pid', self.tcpdump.pid);
		pass;

	def Run(self):
		print('set enb config');
		if self.testMng.startue == 1 or self.testMng.startenb == 1:
			self.StartTcpdump();

		if self.testMng.startenb == 1:
			self.ModifyDb();
			self.StartEnb();

		if self.testMng.startue == 1:
			self.StartUe();

	def Clear(self):
		if self.testMng.startue == 1:
			if  'tgt_enb' != self.type:
				self.ue_nomal_fd.close();
				self.ue_err_fd.close();
				self.ue.terminate();
				print('kill  %d'%self.ue.pid);

		if self.testMng.startenb == 1:
			try:
				self.enb_err_fd.close();
				self.enb_nomal_fd.close();
				self.lte_app.terminate();
			except OSError as err:
				# print(str(err));
				pass
			print('kill  %d'%self.lte_app.pid);

		if self.testMng.startue == 1 or self.testMng.startenb == 1:
			try:
				#self.tcpdump.terminate();
				self.tcpdump.send_signal(signal.SIGINT);
				self.tcpdump.wait();
			except OSError as err:
				pass;