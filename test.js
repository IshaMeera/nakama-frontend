global.WebSocket = require("ws");

const { Client } = require("@heroiclabs/nakama-js");

const client = new Client("defaultkey", "127.0.0.1", "7350");

async function run() {
    //auth
    const session = await client.authenticateDevice("device12345");

    console.log("Authenticated:", session);

    //create socket
    const socket = client.createSocket();
    await socket.connect(session, true);

    console.log("Socket connected");

    const matchId = "06bb1b5e-b56e-4df7-a4f7-0a3fb33d97d3.nakama";
    //joinmatch
    const match = await socket.joinMatch(matchId);

    console.log("Joined match:", match);
    //listen for update
    socket.onmatchdata = (data) => {
        console.log("Game state update:", JSON.parse(new TextDecoder().decode(data.data)));
    };
    //send move
    setTimeout(() => {
    socket.sendMatchState(matchId, 1, JSON.stringify({ x: 0, y: 0 }));
}, 500);

setTimeout(() => {
    socket.sendMatchState(matchId, 1, JSON.stringify({ x: 1, y: 0 }));
}, 1000);

setTimeout(() => {
    socket.sendMatchState(matchId, 1, JSON.stringify({ x: 0, y: 1 }));
}, 1500);

setTimeout(() => {
    socket.sendMatchState(matchId, 1, JSON.stringify({ x: 1, y: 1 }));
}, 2000);

setTimeout(() => {
    socket.sendMatchState(matchId, 1, JSON.stringify({ x: 0, y: 2 }));
}, 2500);

    console.log("Move sent!");
}

run();