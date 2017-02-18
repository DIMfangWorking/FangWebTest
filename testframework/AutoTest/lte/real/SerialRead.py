import ctypes
import re

import time;

from threading import *;

from serial import *

class EnhancedSerial(Serial):
    def __init__(self, *args, **kwargs):
        #ensure that a reasonable timeout is set
        timeout = kwargs.get('timeout',0.1)
        if timeout < 0.01: timeout = 0.1
        kwargs['timeout'] = timeout
        Serial.__init__(self, *args, **kwargs)
        self.buf = ''
        
    def readline(self, maxsize=None, timeout=1):
        """maxsize is ignored, timeout in seconds is the max time that is way for a complete line"""
        tries = 0
        while 1:
            self.buf += self.read(512)
            pos = self.buf.find('\n')
            if pos >= 0:
                line, self.buf = self.buf[:pos+1], self.buf[pos+1:]
                return line
            tries += 1
            if tries * self.timeout > timeout:
                break
        line, self.buf = self.buf, ''
        return line

    def readlines(self, sizehint=None, timeout=1):
        """read all lines that are available. abort after timout
        when no more data arrives."""
        lines = []
        while 1:
            line = self.readline(timeout=timeout)
            if line:
                lines.append(line)
            if not line or line[-1:] != '\n':
                break
        return lines

def ValidHandle(value):
    if value == 0:
        raise ctypes.WinError()
    return value

NULL = 0
HDEVINFO = ctypes.c_int
BOOL = ctypes.c_int
CHAR = ctypes.c_char
PCTSTR = ctypes.c_char_p
HWND = ctypes.c_uint
DWORD = ctypes.c_ulong
PDWORD = ctypes.POINTER(DWORD)
ULONG = ctypes.c_ulong
ULONG_PTR = ctypes.POINTER(ULONG)
#~ PBYTE = ctypes.c_char_p
PBYTE = ctypes.c_void_p

class GUID(ctypes.Structure):
    _fields_ = [
        ('Data1', ctypes.c_ulong),
        ('Data2', ctypes.c_ushort),
        ('Data3', ctypes.c_ushort),
        ('Data4', ctypes.c_ubyte*8),
    ]
    def __str__(self):
        return "{%08x-%04x-%04x-%s-%s}" % (
            self.Data1,
            self.Data2,
            self.Data3,
            ''.join(["%02x" % d for d in self.Data4[:2]]),
            ''.join(["%02x" % d for d in self.Data4[2:]]),
        )

class SP_DEVINFO_DATA(ctypes.Structure):
    _fields_ = [
        ('cbSize', DWORD),
        ('ClassGuid', GUID),
        ('DevInst', DWORD),
        ('Reserved', ULONG_PTR),
    ]
    def __str__(self):
        return "ClassGuid:%s DevInst:%s" % (self.ClassGuid, self.DevInst)
PSP_DEVINFO_DATA = ctypes.POINTER(SP_DEVINFO_DATA)

class SP_DEVICE_INTERFACE_DATA(ctypes.Structure):
    _fields_ = [
        ('cbSize', DWORD),
        ('InterfaceClassGuid', GUID),
        ('Flags', DWORD),
        ('Reserved', ULONG_PTR),
    ]
    def __str__(self):
        return "InterfaceClassGuid:%s Flags:%s" % (self.InterfaceClassGuid, self.Flags)

PSP_DEVICE_INTERFACE_DATA = ctypes.POINTER(SP_DEVICE_INTERFACE_DATA)

PSP_DEVICE_INTERFACE_DETAIL_DATA = ctypes.c_void_p

class dummy(ctypes.Structure):
    _fields_=[("d1", DWORD), ("d2", CHAR)]
    _pack_ = 1
SIZEOF_SP_DEVICE_INTERFACE_DETAIL_DATA_A = ctypes.sizeof(dummy)

SetupDiDestroyDeviceInfoList = ctypes.windll.setupapi.SetupDiDestroyDeviceInfoList
SetupDiDestroyDeviceInfoList.argtypes = [HDEVINFO]
SetupDiDestroyDeviceInfoList.restype = BOOL

SetupDiGetClassDevs = ctypes.windll.setupapi.SetupDiGetClassDevsA
SetupDiGetClassDevs.argtypes = [ctypes.POINTER(GUID), PCTSTR, HWND, DWORD]
SetupDiGetClassDevs.restype = ValidHandle # HDEVINFO

SetupDiEnumDeviceInterfaces = ctypes.windll.setupapi.SetupDiEnumDeviceInterfaces
SetupDiEnumDeviceInterfaces.argtypes = [HDEVINFO, PSP_DEVINFO_DATA, ctypes.POINTER(GUID), DWORD, PSP_DEVICE_INTERFACE_DATA]
SetupDiEnumDeviceInterfaces.restype = BOOL

SetupDiGetDeviceInterfaceDetail = ctypes.windll.setupapi.SetupDiGetDeviceInterfaceDetailA
SetupDiGetDeviceInterfaceDetail.argtypes = [HDEVINFO, PSP_DEVICE_INTERFACE_DATA, PSP_DEVICE_INTERFACE_DETAIL_DATA, DWORD, PDWORD, PSP_DEVINFO_DATA]
SetupDiGetDeviceInterfaceDetail.restype = BOOL

SetupDiGetDeviceRegistryProperty = ctypes.windll.setupapi.SetupDiGetDeviceRegistryPropertyA
SetupDiGetDeviceRegistryProperty.argtypes = [HDEVINFO, PSP_DEVINFO_DATA, DWORD, PDWORD, PBYTE, DWORD, PDWORD]
SetupDiGetDeviceRegistryProperty.restype = BOOL


GUID_CLASS_COMPORT = GUID(0x86e0d1e0L, 0x8089, 0x11d0,
    (ctypes.c_ubyte*8)(0x9c, 0xe4, 0x08, 0x00, 0x3e, 0x30, 0x1f, 0x73))

DIGCF_PRESENT = 2
DIGCF_DEVICEINTERFACE = 16
INVALID_HANDLE_VALUE = 0
ERROR_INSUFFICIENT_BUFFER = 122
SPDRP_HARDWAREID = 1
SPDRP_FRIENDLYNAME = 12
SPDRP_LOCATION_INFORMATION = 13
ERROR_NO_MORE_ITEMS = 259

def comports(available_only=True):
    """This generator scans the device registry for com ports and yields
    (order, port, desc, hwid).  If available_only is true only return currently
    existing ports. Order is a helper to get sorted lists. it can be ignored
    otherwise."""
    flags = DIGCF_DEVICEINTERFACE
    if available_only:
        flags |= DIGCF_PRESENT
    g_hdi = SetupDiGetClassDevs(ctypes.byref(GUID_CLASS_COMPORT), None, NULL, flags);
    #~ for i in range(256):
    for dwIndex in range(256):
        did = SP_DEVICE_INTERFACE_DATA()
        did.cbSize = ctypes.sizeof(did)

        if not SetupDiEnumDeviceInterfaces(
            g_hdi,
            None,
            ctypes.byref(GUID_CLASS_COMPORT),
            dwIndex,
            ctypes.byref(did)
        ):
            if ctypes.GetLastError() != ERROR_NO_MORE_ITEMS:
                raise ctypes.WinError()
            break

        dwNeeded = DWORD()
        # get the size
        if not SetupDiGetDeviceInterfaceDetail(
            g_hdi,
            ctypes.byref(did),
            None, 0, ctypes.byref(dwNeeded),
            None
        ):
            # Ignore ERROR_INSUFFICIENT_BUFFER
            if ctypes.GetLastError() != ERROR_INSUFFICIENT_BUFFER:
                raise ctypes.WinError()
        # allocate buffer
        class SP_DEVICE_INTERFACE_DETAIL_DATA_A(ctypes.Structure):
            _fields_ = [
                ('cbSize', DWORD),
                ('DevicePath', CHAR*(dwNeeded.value - ctypes.sizeof(DWORD))),
            ]
            def __str__(self):
                return "DevicePath:%s" % (self.DevicePath,)
        idd = SP_DEVICE_INTERFACE_DETAIL_DATA_A()
        idd.cbSize = SIZEOF_SP_DEVICE_INTERFACE_DETAIL_DATA_A
        devinfo = SP_DEVINFO_DATA()
        devinfo.cbSize = ctypes.sizeof(devinfo)
        if not SetupDiGetDeviceInterfaceDetail(
            g_hdi,
            ctypes.byref(did),
            ctypes.byref(idd), dwNeeded, None,
            ctypes.byref(devinfo)
        ):
            raise ctypes.WinError()

        # hardware ID
        szHardwareID = ctypes.create_string_buffer(250)
        if not SetupDiGetDeviceRegistryProperty(
            g_hdi,
            ctypes.byref(devinfo),
            SPDRP_HARDWAREID,
            None,
            ctypes.byref(szHardwareID), ctypes.sizeof(szHardwareID) - 1,
            None
        ):
            # Ignore ERROR_INSUFFICIENT_BUFFER
            if ctypes.GetLastError() != ERROR_INSUFFICIENT_BUFFER:
                raise ctypes.WinError()

        # friendly name
        szFriendlyName = ctypes.create_string_buffer(1024)
        if not SetupDiGetDeviceRegistryProperty(
            g_hdi,
            ctypes.byref(devinfo),
            SPDRP_FRIENDLYNAME,
            None,
            ctypes.byref(szFriendlyName), ctypes.sizeof(szFriendlyName) - 1,
            None
        ):
            # Ignore ERROR_INSUFFICIENT_BUFFER
            if ctypes.GetLastError() != ERROR_INSUFFICIENT_BUFFER:
                #~ raise ctypes.WinError()
                # not getting friendly name for com0com devices, try something else
                szFriendlyName = ctypes.create_string_buffer(1024)
                if SetupDiGetDeviceRegistryProperty(
                    g_hdi,
                    ctypes.byref(devinfo),
                    SPDRP_LOCATION_INFORMATION,
                    None,
                    ctypes.byref(szFriendlyName), ctypes.sizeof(szFriendlyName) - 1,
                    None
                ):
                    port_name = "\\\\.\\" + szFriendlyName.value
                    order = None
                else:
                    port_name = szFriendlyName.value
                    order = None
        else:
            try:
                m = re.search(r"\((.*?(\d+))\)", szFriendlyName.value)
                #~ print szFriendlyName.value, m.groups()
                port_name = m.group(1)
                order = int(m.group(2))
            except AttributeError, msg:
                port_name = szFriendlyName.value
                order = None
        yield order, port_name, szFriendlyName.value, szHardwareID.value

    SetupDiDestroyDeviceInfoList(g_hdi)


class SerialRead(Thread):
  def __init__(self, logfile = None, lock=None):
    super(SerialRead, self).__init__();

    self.logfile=logfile;
    self.lock=lock;
    self.stoppend = False;

    self.s = None;
    for order, port, desc, hwid in sorted(comports()):
      logfile.write("%-10s: %s (%s)" % (port, desc, hwid));
      try:
        self.s = EnhancedSerial(port, baudrate=115200) # test open
        break;
      except serialutil.SerialException:
        print "can't be openend"

    if self.s is None:
      raise Exception("No available serial port");

  def run(self):
    try :
      while not self.stoppend:
        str = self.s.readline()
        self.logfile.write(str)
        if re.match('^PTT: PTT Power On Success\!\s+$', str) :
          self.lock.release();
    except ValueError:
      pass

  def stop(self):
    self.logfile.close();
    self.stoppend = True;


if __name__ == '__main__':
  s = SerialRead(sys.stdout);
  s.start();
  time.sleep(2);
  s.stop();