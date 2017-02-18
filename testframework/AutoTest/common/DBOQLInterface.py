# -*- coding:utf-8 -*-

__author__ = 'guowei';
__all__ = ['DBOQLInterface'];

import os;
import re;
import sqlite3;
import sys;

class DBOQLInterface(object):
  def __init__(self, table, enb):
    self.table = table.lower();
    self.enb = enb;

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