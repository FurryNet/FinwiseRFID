import socket
import os
import threading
import comm_pb2


# Start connecting to the server
server_addrnport = os.environ.get('NFCAUTH_HW_SRV')
if (server_addrnport is None):
    print("No server address found, closing software")
    exit()

server_addr, server_port = server_addrnport.split(':')

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    client.connect((server_addr, int(server_port)))
    print("Connected to server")
except:
    print("Failed to connect to server")
    exit()

def sendStatus(data: comm_pb2.RFIDAuthData):
    client.sendall(data.SerializeToString())


def waitRead():
    while True:
        try:
            data = client.recv(128)
            data = comm_pb2.RFIDAuthData()
            data.ParseFromString(data)
            print(f"Received: {str(data.ID)} -> {str(data.data)}", flush=True)
        except:
            break

# Thread the reading
threading.Thread(target=waitRead).start()
        

