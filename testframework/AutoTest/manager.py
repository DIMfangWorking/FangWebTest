# -*- coding:utf-8 -*-
__author__ = 'guowei';
__all__=['Manager'];

import os;
import pdb;
import datetime;
import sys;
import socket;
import xmltodict;

from logger import getLogger;

logger = getLogger();

def Manager(argv):
  try:
    project = argv['Project'].lower()

    manager_class = __import__(project + '.manager');
    manager_class = getattr(manager_class, 'manager');
    manager_class = getattr(manager_class, 'ManagerImp');

    logger.debug('manager_class %r', manager_class);
    
    return manager_class(argv);
  except :
    logger.error('load imp manager error. %r', sys.exec_info());
    raise Exception('not found Project');