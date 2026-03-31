Tic Tac Toe Multiplayer (Server-Authoritative)
A real-time multiplayer Tic Tac Toe game built using:

- ⚡ Nakama (Authoritative Game Server)
- ⚛️ React (Frontend)
- 🌐 Deployed on Render

This project demonstrates a **server-authoritative architecture**, ensuring fair gameplay, real-time synchronization, and scalability.

##  Features

###  Core Features

####  Server-Authoritative Game Logic
- All game state is managed on the server
- Moves are validated server-side before applying
- Prevents cheating or client-side manipulation
- Only valid state updates are broadcasted to players

####  Matchmaking System
- Create private game rooms
- Join using room codes
- Automatic matchmaking (`find_match`)
- Handles player reconnects and disconnections gracefully

####  Deployment
- Nakama server deployed on cloud (Render)
- Frontend deployed and publicly accessible

---

###  Optional Features (Implemented)

####  Concurrent Game Support
- Multiple matches can run simultaneously
- Each match has isolated game state
- Scalable architecture via Nakama match handlers

##  Setup & Installation

###  Prerequisites
- Node.js (v18+)
- Docker (for Nakama)
- Git

###  Backend Setup (Nakama)

1. Clone the repo:

git clone <your-repo-url>
cd nakama

2. Start Nakama using Docker:
docker-compose up

3. Place your match logic file:
/data/modules/match.js

Nakama will load it automatically.

###  Frontend Setup (Nakama)

cd client
npm install
npm run dev

### Deployment
## Backend (Nakama on Render)
Create a new Web Service on Render
Use Nakama Docker image
Add your match logic inside /data/modules/

Ensure logs show:

Startup done
Found runtime modules ["match.js"]

## Frontend Deployment
Deploy using:
Render (Versal,Netlify)

Set environment variable:

`VITE_BASE_URL=https://your-nakama-server-url`

## Database
A managed PostgreSQL instance is used on Render.

The connection string is configured using environment variables:

postgres://<user>:<password>@<render-host>:5432/nakama

### API / Server Configuration
## RPC Endpoints
 Create Match
client.rpc(session, "create_match", "")
 Find Match (Auto Matchmaking)
client.rpc(session, "find_match", "")
 Join by Code
client.rpc(session, "join_by_code", JSON.stringify({ code }))