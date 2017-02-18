# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['DBOption'];

import os;
import sys;
import re;
import sqlite3;

import imp;

from logger import getLogger;

logger = getLogger();

class DBOption(object):
  def __init__(self, testMng):
    logger.info('DBOption __init__');
    self.testMng = testMng;
    print __import__(self.testMng.Project + '.' + self.testMng.Platform);

  def getTable(self, table):
    logger.info('getTable __init__', table);
    if self.testMng.env == 'real':
      from real.DbMng import RealDBOql;
      table = RealDBOql(table, self.enb);
    else:
      from sim.DbMng import DbMng;

    return table;