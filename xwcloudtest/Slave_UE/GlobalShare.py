#-*- coding:utf-8 -*-
__version__ = "0.1"
__all__ = ["getShareObj", "Cell", "eNB"]
__author__ = "guowei"

__share__ = {}

def getShareObj():
  return __share__;

def setShareObj(obj):
  __share__ = obj;