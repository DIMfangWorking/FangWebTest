import os;
import sys;
import json;

import matplotlib;
# matplotlib.rcdefaults();
matplotlib.use("Agg");

import numpy as np;
import matplotlib.pyplot as plt;

class EIBaiseDraw(object):
  def __init__(self, data, path):
    self.data = data;
    self.save_path = path;
    self.times = len(data);
    self.x = np.linspace(0, self.times, self.times);

  def generateDlAvgMcs(self):
    figure = plt.figure();

    y = [];
    for t in self.data:
      if '254' not in t:
        continue;
      y.append(float(t['254']['cellDLDetailState']['u16DLAvrgMcs'])/10);

    if len(y) <= 0:
      raise Exception('not u16DLAvrgMcs data');
      

    ax = figure.add_subplot(111);

    ax.set_xlabel("Time");
    # ax.set_ylabel("%%");

    ax.plot(self.x, y, color="red", linewidth=1);
    filename = self.save_path + os.sep + "DlAvgMcs.png";
    figure.savefig(filename);

  def generateUlAvgMcs(self):
    figure = plt.figure();

    y = [];
    for t in self.data:
      if '254' not in t:
        continue;
      y.append(float(t['254']['cellULDetailState']['u16ULAvrgMcs'])/10);

    if len(y) <= 0:
      raise Exception('not u16ULAvrgMcs data');

    ax = figure.add_subplot(111);

    ax.set_xlabel("Time");
    # ax.set_ylabel("%%");

    ax.plot(self.x, y, '-', color="red", linewidth=1);
    plt.savefig(self.save_path + os.sep + "UlAvgMcs.png");

  def generateDlFlowRate(self):
    figure = plt.figure();

    y = [];
    for t in self.data:
      if '254' not in t:
        continue;
      y.append(float(t['254']['cellDLDetailState']['u32DLMacThrput'])/1024/1024);

    if len(y) <= 0:
      raise Exception('not u32DLMacThrput data');      

    ax = figure.add_subplot(111);

    ax.set_xlabel("Time");
    ax.set_ylabel("Mbps");

    ax.plot(self.x, y, '-', color="red", linewidth=1);
    plt.savefig(self.save_path + os.sep + "DlFlowRate.png");

  def generateUlAvgBler(self):
    figure = plt.figure();

    y = [];
    for t in self.data:
      if '254' not in t:
        continue;
      y.append(t['254']['cellULDetailState']['u8ULAvrgBler']);

    if len(y) <= 0:
      raise Exception('not u8ULAvrgBler data');
      return None;

    ax = figure.add_subplot(111);

    ax.plot(self.x, y, '-', color="red", linewidth=1);
    plt.savefig(self.save_path + os.sep + "UlAvgBler.png");

  def generateUlFlowRate(self):
    figure = plt.figure();

    y = [];
    for t in self.data:
      if '254' not in t:
        continue;
      y.append(float(t['254']['cellULDetailState']['u32ULMacThrput'])/1024/1024);

    if len(y) <= 0:
      raise Exception('not u32ULMacThrput data');

    ax = figure.add_subplot(111);

    ax.set_xlabel("Time");
    ax.set_ylabel("Mbps");

    ax.plot(self.x, y, '-', color="red", linewidth=1);
    plt.savefig(self.save_path + os.sep + "UlFlowRate.png");

  def generateDlAvgBler(self):
    figure = plt.figure();

    y = [];
    for t in self.data:
      if '254' not in t:
        continue;
      y.append(t['254']['cellDLDetailState']['u8DLAvrgBler']);

    if len(y) <= 0:
      raise Exception('not u8DLAvrgBler data');

    ax = figure.add_subplot(111);

    ax.plot(self.x, y, '-', color="red", linewidth=1);
    plt.savefig(self.save_path + os.sep + "DlAvgBler.png");

if __name__ == "__main__":
  if len(sys.argv) != 2:
    sys.stderr.write("usage : python EIBaiseDraw output_path");
    os.exit(1);
  path = sys.argv[1];

  if not os.path.exists(path):
    os.system("mkdir -p %s" %path);

  try:
    print 'read line';
    dataStr = sys.stdin.readline();
    print 'json loads';
    EIData = json.loads(dataStr);

    print 'new EIBaiseDraw obj';
    draw = EIBaiseDraw(EIData, path);

    print 'generateDlAvgMcs';
    draw.generateDlAvgMcs();
    print 'generateUlAvgMcs';
    draw.generateUlAvgMcs();
    print 'generateDlFlowRate';
    draw.generateDlFlowRate();
    print 'generateUlAvgBler';
    draw.generateUlAvgBler();
    print 'generateUlFlowRate';
    draw.generateUlFlowRate();
    print 'generateDlAvgBler';
    draw.generateDlAvgBler();

    result = 0;
  except:
    print sys.exc_info();

    result = -1;

  sys.exit(result);
  os._exit(result);