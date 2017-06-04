#!/usr/bin/python3


class ANSIColors(object):

    def ERROR(self, s):
        return "\033[38;5;166;1m" + str(s) + "\033[0m"

    def INFO(self, s):
        return "\033[38;5;77;1m" + str(s) + "\033[0m"

    def WARN(self, s):
        return "\033[38;5;220;1m" + str(s) + "\033[0m"
