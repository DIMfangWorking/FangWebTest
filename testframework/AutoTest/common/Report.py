# -*- coding:utf-8 -*-
import os
import sys
import time
import datetime
import re
import StringIO;

class ReportCIResult(object):
    htmlHead = '''
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>CompileResult</title>
<STYLE type="text/css">

body{font-family:Consolas,Microsoft Yahei}
table,td,tr,th{font-size:12px;}
table{ margin:0 auto;}
.common{align:center; text-align:left; margin-bottom:20px; border-top:1px solid #d8d8d8; border-left:1px solid #d8d8d8;}
.common th{ line-height:20px; font-weight:normal; background-color:#AFD7FF; border-right:1px solid #d8d8d8; border-bottom:1px solid #d8d8d8;}
.common td{ padding:5px 3px; line-height:16px; border-right:1px solid #d8d8d8; border-bottom:1px solid #d8d8d8;}
.common td{ line-height:16px;}

.bluebar{ height:4px; line-height:4px; overflow:hidden; background-color:#2f9ae0;}
.list_dl{ overflow:hidden; _display:inline-block; border:1px solid #cbddeb; border-bottom:0;}
.last_dl{ border-bottom:1px solid #cbddeb; white-space:nowrap;}
.list_dl dt{ width:578px; height:38px; line-height:40px; overflow:hidden; padding-left:50px; float:left; font-size:14px;}
.list_dl dd{ width:130px; height:31px; line-height:14px; padding-top:7px; float:left; color:#999999; overflow:hidden;}
.list_dl dd.cli_dd{ width:70px;}
.list_dl dd span{ display:block;}

.list_dl dt.tiline{ width:908px; height:24px; line-height:24px; background-color:#f0f9fe; color:#333333; font-weight:bold; font-size:12px;}
dl.bluebg{ height:38px; line-height:38px; padding-top:0; background-color:#f0f9fe; color:#333333;}
dl.bluebg dd{ height:38px; line-height:38px; padding-top:0; color:#333333;}

</STYLE>
</head>
<body>
'''

    def __init__(self):
        self.reportHtml = StringIO.StringIO();
        self.reportHtml.writelines(ReportCIResult.htmlHead);
        write_str = '<table width=\"90%\" class = \"common\">\n'
        self.reportHtml.writelines(write_str);

    def __del__(self):
        self.reportHtml.close();

    def notifyDownloadCodeResult(self, url, revision, result):
        self.downloadCodeResult = result;
        write_str = '<tr><th>Download Code Info</th></tr>\n'
        write_str += '<tr><td>url:'+url+'&nbsp;&nbsp;revision:'+str(revision)+'</td></tr>\n'
        result = ('success' if result == 0 else 'failed');
        write_str += '<tr><td>download code result '+result+'</td></tr>\n'
        self.reportHtml.writelines(write_str)
        return 0;

    def notifyCompileResult(self, file):
        write_str = '<tr><th>Compile Info</th></tr>\n'
        self.reportHtml.writelines(write_str)

        file_result = open(file,'r')
        write_str = '<tr><td>'
        regex_str = 'failed|error:|undefined reference to|multiple definition of|Error 1|No rule to make target `all'
        for line in file_result.readlines():
            if re.search(regex_str,line)!=None:
                write_str+= line+'<br/>'
        #str+='</tr>'
        if len(write_str) < 20 :
            write_str += 'enb build successfully</td></tr>\n'
        else:
            result = result + 1
            write_str += '</td></tr>'
        self.reportHtml.writelines(write_str)

        file_result.close()

    def notifyStartRunTest(self):
        write_str = '<tr><th>Test Result</th></tr>\n'
        self.reportHtml.writelines(write_str)

    def notifyStartRunTestCase(self, case):
        write_str = '<tr><td>'+ case +'</td></tr>\n'
        self.reportHtml.writelines(write_str)

    def notifyStartRunAtom(self, atom):
        write_str = '<tr><td>&nbsp;&nbsp;'+ atom +'</td></tr>\n'
        self.reportHtml.writelines(write_str)

    def generateEmailContent(self):
        self.reportHtml.write('<tr><th>' \
            'Check console output at {result_url} to view the results.' \
            '</tr></th>');
        self.reportHtml.write('<tr><th>' \
            'Powered by CloudTestPlatform' \
            '</tr></th></table></body> </html>');
        html = self.reportHtml.getvalue()
        return html

if __name__ == '__main__':
    re1 = ReportCIResult();
    re1.notifyDownloadCodeResult('http://cloud.xa.com', 123, 0);
    re1.notifyCompileResult('./make_enb.txt');
    re1.notifyStartRunTest();
    re1.notifyStartRunTestCase('TestCase_3Cells_And_1Ue_for_each_Cell_Attach_And_Ping ');
    re1.notifyStartRunAtom('MSG_CELL_STATUS_CHECK_RSP FAILURE:TimeOut');
    print re1.generateEmailContent();