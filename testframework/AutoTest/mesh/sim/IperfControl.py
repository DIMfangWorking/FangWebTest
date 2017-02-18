# -*- coding:utf-8 -*-
import socket
import subprocess
import threading
import os
import pdb
import time
import Log

iperf_path = 'iperf'
time_factor = 1.0


# PDN
class IperfMain:
    #  if PDN
    def __init__ (self,type,ueip):
        #pdb.set_trace()
        self.type = type
        ipaddr = ueip.split('.')
        self.svr = []
        self.clt = []
        #self.iperf_port = 40000+int(ipaddr[3])
        if type=='PDN':
            #global iperf_path
            #iperf_path = './iperf'
            self.localip = '192.168.100.100'
            self.remoteip = '192.168.100.102'
            self.remoteport = 50102 + int(ipaddr[3])
            self.localport = 50100
            self.start_all_server_in_pdn()
        else:
            global iperf_path
            iperf_path = 'iperf'
            self.localip = '192.168.100.102'
            self.remoteip = '192.168.100.100'
            self.remoteport = 50100
            self.localport = 50102 + int(ipaddr[3])
        self.start_recv_thread()

    def start_all_server_in_pdn (self):
        for i in range(41000+100,41000+130):  #��ʱֻ֧��30��server
            self.start_server(i)
        for i in range(51000+100,51000+140):
            self.start_tcpserver(i)
		

    def stop_all_server_in_pdn (self):
        for _server in self.srv:  #��ʱֻ֧��30��server
            _server.stop()

    def start_server (self,port):
        _server = UdpServer(self.type,port)
        self.svr.append(_server)
        _server.start()
        return _server 
		
    def start_tcpserver (self,port):
        _server = TcpServer(self.type,port)
        self.svr.append(_server)
        _server.start()
        return _server 
        
    def start_client (self,server_ip,band_width,port,packagelen,times):
        _client = UdpClient(self.type,server_ip,band_width,port,packagelen,times)
        self.clt.append(_client)
        _client.start()
        return _client

		
    def start_tcpclient (self,server_ip,band_width,port,packagelen,times):
        _client = TcpClient(self.type,server_ip,band_width,port,packagelen,times)
        self.clt.append(_client)
        _client.start()
        return _client
		
    def send(self,data):
        ADDR=(self.remoteip,self.remoteport)
        s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM, 0)
        s.sendto(data,ADDR)
        s.close()
        return 0

    def start_recv_thread(self):
        
        self.recv_thread = threading.Thread(target=self.recv_thread_handler)
        self.recv_thread.setDaemon(True)
        self.recv_thread.start()

        return 0

    def stop_recv_thread (self):
        self.stop = True
        ADDR=(self.localip,self.localport)
        s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM, 0)
        data = 'stop'
        s.sendto(data,ADDR)
        s.close()
        return 0


    def recv_thread_handler(self):
        bufsize=1500
        ADDR=(self.localip,self.localport)
        self.socket_server=socket.socket(socket.AF_INET, socket.SOCK_DGRAM, 0)
        self.socket_server.bind(ADDR)
        self.stop = False
        while self.stop!=True:
            data,addr=self.socket_server.recvfrom(bufsize)
            buf = data.split(',')
            if not data:
                continue
            elif buf[0] == 'stop':
                continue
            else:
                if buf[0] == 'server':
                    if self.type != 'PDN':
                        # server,40010
                        #buf = data.split(',')
                        self.start_server(buf[1])
                elif buf[0] == 'client':
                    # client,192.168.0.1,10m,41000,100
                    #                    band port times
                    #buf = data.split(',')
                    server_ip = buf[1]
                    band_width=buf[2].replace('m','')
                    port = buf[3]
                    packagelen = buf[4]
                    times = buf[5]
                    self.start_client(server_ip,band_width,port,packagelen,times)
                elif buf[0] == 'tcpclient':
                    #buf = data.split(',')
                    server_ip = buf[1]
                    band_width=buf[2].replace('m','')
                    port = buf[3]
                    packagelen = buf[4]
                    times = buf[5]
                    self.start_tcpclient(server_ip,band_width,port,packagelen,times)

        self.socket_server.close()
        print 'socke close'


# receive
class UdpServer:
    def __init__(self,type,port):
        self.type = type
        self.port = port
        self.subprocess = None

    def start(self):
        cmd = iperf_path
        cmd +=' -u -s -i 1 -l 1000'
        cmd +=' -p ' + str(self.port)
        print 'server start ',cmd
        stdout_name = '..\iperf_'+str(self.port)
        self.stdout_fd = open(stdout_name, 'w+')
        self.subprocess = subprocess.Popen(cmd,stdout=self.stdout_fd.fileno(),stderr=subprocess.PIPE,shell=True)

    def stop (self):
        if None != self.subprocess:
            self.subprocess.kill()

    def get_result (self,times):
        lines=[]
        time.sleep(times+1)
        self.stdout_fd.seek(0,0)
        lines = self.stdout_fd.readlines()
        self.stdout_fd.seek(0,0)
        self.stdout_fd.truncate(0)
        if len(lines)==0:
	    lines.append('None')
            lines.append('None')
        self.stop()
        return lines


    def __del__(self):
        if None != self.subprocess:
            self.subprocess.kill()



# send
class UdpClient:
    def __init__ (self,type,server_ip,band,port,packagelen,times):
        self.server_ip = server_ip
        self.band = band
        self.type = type
        self.port = port
        self.packagelen=packagelen
        self.times = times

    def start (self):
        cmd = iperf_path
        cmd += ' -u'
        cmd +=' -c '+self.server_ip 
        cmd +=' -i 1'
        global time_factor
        cmd +=' -b '+str(float(self.band)*time_factor)+'m'
        cmd +=' -p '+str(self.port)
        cmd +=' -l '+str(self.packagelen)
        cmd +=' -t '+str(self.times)
        print cmd
        self.pid = subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr =subprocess.PIPE,shell=True)

    def stop (self):
        self.pid.kill()

    def get_result (self):
        (result,err)=self.pid.communicate()
        return (result,err)


# receive
class TcpServer:
    def __init__(self, type, port):
        self.__type = type
        self.__port = port
        self.__process = None

    def start(self):
        # iperf -s -w 1024k -i 1 -p 6000
        cmd = iperf_path
        cmd += ' -s -w 1024k -i 1'
        cmd += ' -p ' + str(self.__port)
        print 'server start ', cmd
        stdout_name = '..\iperf_'+str(self.__port)
        self.stdout_fd = open(stdout_name, 'w+')
        self.__process = subprocess.Popen(cmd,stdout=self.stdout_fd.fileno(),stderr=subprocess.PIPE,shell=True)

    #
    def stop(self):
        if None != self.__process:
            self.__process.kill()

    #
    def get_result(self, times):
        lines = []
        time.sleep(times + 1)
        self.stdout_fd.seek(0, 0)
        lines = self.stdout_fd.readlines()
        self.stdout_fd.seek(0, 0)
        self.stdout_fd.truncate(0)
        if len(lines) == 0:
            lines.append('None')

        self.stop()

        return lines

    #
    def __del__(self):
        self.stop()


# send
class TcpClient:
    def __init__(self, type, server_ip, band, port, package_len, times):
        self.__server_ip = server_ip
        self.__band = band
        self.__port = port
        self.__package_len = package_len
        self.__times = times
        self.__process = None

    def start(self):
        # iperf -c 192.168.0.1 -w 1024k -i 1 -p 6000 -t 9
        cmd = iperf_path
        # cmd += ' -u'
        cmd += ' -c '+ self.__server_ip
        cmd += ' -w 1024k -i 1'
        # global time_factor
        # cmd +=' -b '+str(float(self.band)*time_factor)+'m'
        cmd += ' -p '+str(self.__port)
        # cmd +=' -l '+str(self.package_len)
        # cmd +=' -t '+str(self.times)
        cmd += ' -t 9'
        print cmd
        self.__process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr =subprocess.PIPE, shell=True)

    def stop(self):
        if None != self.__process:
            self.__process.kill()
            self.__process = None

    def get_result(self):
        (result, err) = self.__process.communicate()
        return (result, err)


    def __del__(self):
        if None != self.__process:
            self.__process.kill()
            self.__process = None


# debug
if __name__== '__main__':
    icm = IperfMain('PDN','10.10.10.10')
    
