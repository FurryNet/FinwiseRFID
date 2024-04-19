import { createServer } from 'http';
import websocket from "ws";
import { URL } from 'url';
import { redis, redisPrefix } from './database';


const server = createServer();
const rediReqPrefix = `${redisPrefix}RFID:REQUEST:`;

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
  const reqKey = (new URL(req.url)).searchParams.get('reqKey');
  if(!reqKey)
    return ws.close(1008, "Invalid Request");
  if(await redis.exists(`${rediReqPrefix}${reqKey}`) === 0)
    return ws.close(1008, "Invalid Request");

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