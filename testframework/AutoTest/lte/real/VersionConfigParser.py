import os;
import re;
import ConfigParser;

def optionxform(option):
  return option;

class Singleton(type):
  def __init__(cls,name,bases,dict):
    super(Singleton, cls).__init__(name, bases,dict);
    cls._instance = None;

  def __call__(cls, *args, **kwargs):
    if not cls._instance:
      cls._instance = super(Singleton, cls).__call__(*args, **kwargs);
    return cls._instance;

class VersionConfig(object):
  __metaclass__ = Singleton;

  def __init__(self, file = 'AutoTest' + os.sep + 'real' + os.sep + 'version.cfg'):
    self.result = {};

    if not os.path.exists(file):
      raise Exception("not found file %s config" %file);

    config = ConfigParser.RawConfigParser();
    setattr(config, 'optionxform', optionxform);

    config.read(file);
    sections = config.sections();
    for section in sections:
      self.result[section] = {};
      options = config.items(section);
      for option,value in options:
        self.result[section][option] = config.get(section, option);

  def getConfig(self, version):
    if version is None:
      return self.result['default'];

    for key,value in self.result.items():
      if re.match(key, version, flags=0):
        return value

    return self.result['default'];

if __name__ == "__main__":
  v = VersionConfig('version.cfg');
  print v.getConfig(None)
  print v.getConfig('V3.1.1.0')
  print v.getConfig('V3.1.1.1')
  print v.getConfig('V3.1.1.2P111')
  print v.getConfig('V3.1.1.2T111')
  print v.getConfig('V3.1.0.0')
