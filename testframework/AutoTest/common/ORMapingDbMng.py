# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['ORMapingDbMng'];

import os;
import sys;
import re;
import sqlite3;

from common.DBOQLInterface import DBOQLInterface;

class ORMapingDbMng(DBOQL):
  def __init__(self, path, file):
    self.path = path
    self.file_name = file
    self.file = self.path + os.sep + self.file_name
    self.sqlList = []

  def excuteCmd(self):
    try:
      os.unlink(self.file)
    except:
      pass

    if sys.platform == 'win32':
      os.system('copy %s%slte.db %s'%(self.path, os.sep, self.file))
    else :
      os.system('cp %s%slte.db %s'%(self.path, os.sep, self.file))

    print('now begin modify db file ' + self.path + os.sep + self.file)

    db = sqlite3.connect(self.file)
    sqlCu = db.cursor()
    for sql in self.sqlList:
      print(sql)
      sqlCu.execute(sql)

    db.commit()
    sqlCu.close()
    db.close()

  def setOption(self, options):
    for option in options:
      sql = '';
      if option.dmlType == 'update':
        sql = option.dmlType + ' ' + option.table + ' set '
      elif option.dmlType == 'delete':
        sql = option.dmlType + ' from ' + option.table + ' ( '
      elif option.dmlType == 'insert':
        sql = option.dmlType + ' into ' + option.table + ' '

      for f in option.field:
        if option.dmlType == 'update':
          if f.type == 'ip' :
            sql += f.field + ' = X\'' + f.value + '\', ';
        else :
            sql += f.field + ' = ' + f.value + ', ';
        elif option.dmlType == 'insert':
          sql = f.field + ', '

      if option.dmlType == 'insert' or option.dmlType == 'update':
        sql = sql[:len(sql) - 2] + ') value (';

      if option.dmlType == 'insert':
        for f in option.field:
          if f.type == 'ip' :
            sql += f.field + ' = X\'' + f.value + '\', ';
          else :
            sql += f.field + ' = ' + f.value + ', ';

        sql = sql[:len(sql) - 2] + ')';

      if len(option.condition) > 0:
        sql += 'where '

      for c in option.condition:
        if f.type == 'ip' :
          sql += f.field + ' = X\'' + f.value + '\', ';
        else :
          sql += f.field + ' = ' + f.value + ', ';
      if len(option.condition) > 0:
        sql = sql[:len(sql) - 2];

      self.sqlList.push(sqlList);

#/*操作类型*/
##define DBS_INSERT            (18)  /* 增加 */
##define DBS_DELETE            (9)   /* 删除 */
##define DBS_UPDATE            (23)  /* 修改 */
##define DBS_SELECT            (21)  /* 查询 */
##define DBS_TRANSACTION         (22)  /* 事务 */
#/* 数据操作请求消息*/
#typedef struct
#{
#  S8  as8DbName[DBS_DB_NAME_LEN] ;        /* 库名 */
#  S8  aas8TblName[DBS_EXEC_HDL_NUM][DBS_TBL_NAME_LEN];    /* 表名 */
#  U8  u8HdlNum;                   /* 句柄个数 */
#  S8  as8SqlText[DBS_SQLTEXT_MAX_LEN ];       /* 请求更新的sql语句*/
#  U8  u8OpType;                   /* DBS_INSERT 增;DBS_DELETE 删;DBS_UPDATE 改;DBS_SELECT 查;DBS_TRANSACTION 事务*/
#  U32 u32Context ;                /* 应用上下文*/
#}T_DBS_EXEC_REQ_MSG;

  def getSqlInfo(self, sql):
    patten = 23
    cmd = sql.lstrip().rstrip().lower()
    m = re.search('^(update|insert|delete)\s+(?:into)?(\S+)\s+', cmd)
    try:
      type = m.groups()[0]
      tab = m.groups()[1]
    except:
      print(cmd + ' sql err')
      return (None,None)
    if type == 'update':
      patten = 23
    elif type == 'insert':
      patten = 18
    elif type == 'delete':
      patten = 9
    return (patten, tab.upper())

  def insert(self, argv):
    print 'Did not implement the function insert';
    pass;

  def save(self, argv):
    print 'Did not implement the function save';
    pass;

  def remove(self, argv):
    print 'Did not implement the function remove';
    pass;

  def delete(self, argv):
    print 'Did not implement the function delete';
    pass;

  def update(self, filter, argv):
    print 'Did not implement the function update';
    pass;

  def overwrite(self, filter, argv):
    print 'Did not implement the function overwrite';
    pass;

  def find(self, filter):
    print 'Did not implement the function find';
    pass;

  def select(self, filter):
    print 'Did not implement the function select';
    pass;