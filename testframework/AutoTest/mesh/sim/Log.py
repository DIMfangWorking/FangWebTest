__author__ = 'user'

import GlobalVar


DEBUG_LEVEL = 0
INFO_LEVEL = 1
WARN_LEVEL = 2
ERROR_LEVEL = 3
FATAL_LEVEL = 4

__print_level = INFO_LEVEL

def log_report (report_info):
    #print report_info
    #fp = open('../../TestLog/' + GlobalVar.get_instance().get_test_report_filename(), 'a')
    fp = open(GlobalVar.get_instance().get_test_log_path() + \
              GlobalVar.get_instance().get_test_report_filename(), 'a')
    fp.write(report_info+'\n')
    fp.close()


def log_trace(print_info, print_level = INFO_LEVEL):
    global __print_level
    if __print_level <= print_level:
        if DEBUG_LEVEL == print_level:
            print _prev_print, 'DEBUG: ', print_info
        elif INFO_LEVEL == print_level:
            print _prev_print, print_info
        elif ERROR_LEVEL == print_level:
            print 'ERROR: ' + print_info
        else:
            print 'FATAL: ' + print_info

_prev_print = ''

class DebugTrace:
    level = 0
    def __init__(self, debug_info):
        global _prev_print
        if 0 == DebugTrace.level:
            pass
        else:
            _prev_print = _prev_print + '  '
        DebugTrace.level += 1
        self._debug_info = debug_info
        log_trace('>>>> ' + self._debug_info + ' BEGIN <<<<')


    def __del__(self):
        global _prev_print
        log_trace('<<<< ' + self._debug_info + '   END >>>>')
        if 1 == DebugTrace.level:
            pass
        else:
            DebugTrace.level -= 1
            _prev_print = _prev_print[:-2]
