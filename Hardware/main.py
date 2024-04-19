## SAMPLE CODE, MOFIDY!!!

import signal
import time
import sys

from pirc522 import RFID

run = True
rdr = RFID()
util = rdr.util()
util.debug = True

lastId = 0

def end_read(signal,frame):
    global run
    print("\nCtrl+C captured, ending read.")
    run = False
    rdr.cleanup()
    sys.exit()

signal.signal(signal.SIGINT, end_read)

print("Starting")
while run:
    rdr.wait_for_tag()

    (error, data) = rdr.request()
    if not error:
        print("\nDetected: " + format(data, "02x"))

    (error, uid) = rdr.anticoll()
    if not error:
        print("Card read UID: "+str(uid[0])+","+str(uid[1])+","+str(uid[2])+","+str(uid[3]))

        print("Setting tag")
        util.set_tag(uid)

        print("\nAuthorizing")
        util.auth(rdr.auth_a, [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])
        util.do_auth(1)

        print("\nReading")
        error = util.do_auth(1)
        if not error:
            (error, data) = util.rfid.read(1)
            try:
                print("ADDR (1): "+bytes(data).decode('utf-8'))
            except:
                print("Data not string encoded")
            print("ADDR (1-raw): "+str(data))
        #util.read_out(1)

        print("\nDeauthorizing")
        util.deauth()

        time.sleep(3)