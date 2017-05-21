#!/usr/bin/python3


class ANSIColors(object):

    def RED_BOLD(self, s):
        return "\033[31;1m" + str(s) + "\033[0m"

    def GREEN_BOLD(self, s):
        return "\033[32;1m" + str(s) + "\033[0m"

    def YELLOW_BOLD(self, s):
        return "\033[33;1m" + str(s) + "\033[0m"
