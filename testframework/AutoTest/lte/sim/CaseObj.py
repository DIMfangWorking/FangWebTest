# -*- coding:utf-8 -*-
import sys
if sys.platform == "win32":
    import xml.etree.ElementTree as tree
else:
    import lxml.etree as tree
import os
import imp

class CaseObj:
    def __init__(self, file, time):
        self.file_name = file
        self.path = os.path.dirname(file);
        self.times = time
        self.atomList = []
        self.atomObjTab = {}
        self.UptObjTab()
        pass

    def UptObjTab(self):
        file_list = os.listdir('AutoTest');
        for AtomFile in file_list:
            if 7 < len(AtomFile) and '.py' == AtomFile[-3:] and 'Atom'== AtomFile[:4]:
                classString = AtomFile.split('.')[0]
                self.atomObjTab[classString[4:]] = getattr(__import__(classString), classString)

    def ParseCase(self):
        try:
            doc =tree.parse(self.file_name);
        except IOError as err:
            print(err);
            return False;

        root = doc.getroot()
        for item in root:
            atomObj = self.NewTagAtom(item, self);
            if None == atomObj:
                continue;
            self.atomList.append(atomObj);

    def NewTagAtom(self, TagItem, case):
        action = TagItem.get('name');
        if action in self.atomObjTab:
                return self.atomObjTab[action](TagItem, case);
        else:
            for aotmItem in TagItem:
                return self.NewTagAtom(aotmItem, case);
        return None;

    def BeforRun(self):
        pass;

    def AfterRun(self):
        pass;

    def Run(self):
        print('run ' + str(self.__class__))
        for time in self.times:
            self.BeforRun();
            for atomObj in self.atomList:
                print('run ' + str(atomObj.__class__.__name__) + ' start')
                if (atomObj.Run() == False):
                    print('run ' + str(atomObj.__class__.__name__) + ' result : False')
                    self.group.testMng.resultReport.notifyStartRunTestCase(str(atomObj.__class__.__name__) + ' : FAILURE');
                    return False;
                else:
                    self.group.testMng.resultReport.notifyStartRunTestCase(str(atomObj.__class__.__name__) + ' : SUCCESS');
            self.AfterRun();
        print('run ' + self.name + ' result : True')
        return True;

    def Clear(self):
        for atomObj in self.atomList:
            atomObj.Clear();
            del atomObj;