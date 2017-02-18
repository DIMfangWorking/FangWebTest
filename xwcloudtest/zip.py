#coding=utf-8
#甄码农python代码
#使用zipfile做目录压缩，解压缩功能

import sys;
import os,os.path
import zipfile
 
def zip_dir(dirname,zipfilename):
    filelist = []
    if os.path.isfile(dirname):
        filelist.append(dirname)
    else :
        for root, dirs, files in os.walk(dirname):
            for name in files:
                filelist.append(os.path.join(root, name))
         
    zf = zipfile.ZipFile(zipfilename, 'w', zipfile.zlib.DEFLATED)
    for tar in filelist:
        arcname = tar[len(dirname):]
        print arcname
        zf.write(tar,arcname)
    zf.close()

if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.stderr.write("useage: python zip.py zipfilename  dir\n");
        exit(1);
    zip_dir(sys.argv[2],sys.argv[1]);