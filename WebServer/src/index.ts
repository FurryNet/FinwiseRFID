import {Socket, createServer} from "net";
import {RFIDAuthData} from "./definitions";
import { redis, redisPrefix } from "./database";
import { searchClient } from "./WebServer";


enum reqType {
  InvalidID,
  checkAuth,
}

export const clients: Socket[] = [];
export const server = createServer((socket)=> {
  clients.push(socket);
  socket.on('ready', ()=> console.log('New RFID Client Detected'));

  socket.on("data", async (data)=> {
    const response = RFIDAuthData.decode(data);

    switch(response.ID) {
    case reqType.checkAuth: {
      const reqKey = `${redisPrefix}RFID:REQUEST:${Buffer.from(response.data).toString('base64')}`;
      const req = (await redis.get(reqKey))?.split(":");
      if(!req) {
        console.log("Received invalid auth request from client");
        socket.write(RFIDAuthData.encode({ID: reqType.checkAuth, data: Buffer.from('Invalid RFID Card', 'utf-8')}).finish());
      } else if(req[2] === "approved") {
        console.log("Received Duplicate Auth Request from Client");
        socket.write(RFIDAuthData.encode({ID: reqType.checkAuth, data: Buffer.from('Authentication already completed, maybe a site glitch?', 'utf-8')}).finish());
      } else if(req[2] === "pending") {
        // Approve user's request
        await redis.set(reqKey, `${req[0]}:${req[1]}:approved`);
        socket.write(RFIDAuthData.encode({ID: reqType.checkAuth, data: Buffer.from('Authentication Success! You should be automatically logged in, if not, you can use the check button to manually do so.', 'utf-8')}).finish());
        const client = searchClient(req[0]);
        client?.send("approved");
        client?.close();
      }
      break;
    }

    default:
      console.log("Invalid Request Received from Client");
      socket.write(RFIDAuthData.encode({ID: 0, data: Buffer.from('Invalid Request ID', 'utf-8')}).finish());
      break;
    }
  });

  socket.on("end", ()=> {
    console.log("Client Disconnected");
    const index = clients.indexOf(socket);
    if(index !== -1) {
      clients.splice(index, 1);
    }
  });
});

const port = process.env["NFCAUTH_HW_SRV"] ? process.env["NFCAUTH_HW_SRV"].split(":")[1] : "1234";
server.listen(port, () => {
  console.log(`RFID Hardware Server is listening on port: ${port}`);
});