import {Socket, createServer} from "net";
import {RFIDAuthData} from "./protobuf";
import { redis, redisPrefix } from "./database";


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
      const req = await redis.get(reqKey);
      if(!req) {
        console.log("Received invalid auth request from client");
        socket.write(RFIDAuthData.encode(new RFIDAuthData({ID: reqType.checkAuth, data: Buffer.from('Invalid RFID Card', 'utf-8')})).finish());
        break;
      } else if(req === "approved") {
        console.log("Received Duplicate Auth Request from Client");
        socket.write(RFIDAuthData.encode(new RFIDAuthData({ID: reqType.checkAuth, data: Buffer.from('Authentication already completed, maybe a site glitch?', 'utf-8')})).finish());
        break;
      } else if(req === "pending") {
        // Approve user's request
        await redis.set(reqKey, "approved");
      }
      break;
    }
    
    default:
      console.log("Invalid Request Received from Client");
      socket.write(RFIDAuthData.encode(new RFIDAuthData({ID: 0, data: Buffer.from('Invalid Request ID', 'utf-8')})).finish());
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