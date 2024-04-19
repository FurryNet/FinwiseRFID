import { createServer } from 'http';
import websocket from "ws";
import { parse } from 'url';
import { redis, redisPrefix } from './database';


const server = createServer();
const redisReqIDPrefix = `${redisPrefix}RFID:ID:`;


// Extend ws client to include request key
interface wsClient extends websocket {
  reqKey: string;
}


// Websocket for real-time updates
export const clients: wsClient[] = [];
export function searchClient(key: string) {
  return clients.find((client)=> client.reqKey === key);
}


export const ws_server = new websocket.Server({server, path: '/auth'});
ws_server.on('connection', async (ws: wsClient, req)=> {
  // Sanitation Check
  if(!req.url)
    return ws.close(1008, "Invalid Request");

  // Verify if the request exists
  const reqKey = (parse(req.url, true).query)['reqKey'] as string;
  if(!reqKey) {
    console.log("WS Rejected: Missing Request Key");
    return ws.close(1008, "Invalid Request");
  }
    
  if(await redis.exists(`${redisReqIDPrefix}${reqKey}`) === 0) {
    console.log("WS Rejected: Invalid Request Key");
    return ws.close(1008, "Invalid Request");
  }

  // Setup the valid client
  ws.reqKey = reqKey;
  clients.push(ws);
  ws.on('close', ()=> {
    const index = clients.indexOf(ws);
    if(index !== -1)
      clients.splice(index, 1);
  });
  ws.on('message', async ()=> {
    ws.close(1008, "Invalid Request");
  });

});



server.listen(8080, ()=> {
  console.log("RFID REST Server is listening on port 8080");
});