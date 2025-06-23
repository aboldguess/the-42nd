# Treasure Hunt

This project contains a React client and an Express/MongoDB server for running an online treasure hunt game.

## Features
- Onboarding flow for players to create or join teams
- Sequential clues with answer submission
- Side quests and a rogues gallery for uploaded media
- Admin authentication and dashboard endpoints
- Team colour schemes and profile management
- QR-coded links for all clues and side quests

## Development notes
- Client source in `client/` built with React
- Server code in `server/` using Express and Mongoose
- File uploads are stored in `server/uploads`
- The client proxies API requests to `localhost:5000` during development
- A default admin user is seeded from environment variables when the server starts

## Setup
### Prerequisites
- [Node.js](https://nodejs.org/) and npm
- A running MongoDB instance

### Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment variables
Create a `.env` file in the `server` directory with the following keys:
```bash
MONGO_URI=<your mongodb uri>
JWT_SECRET=<random jwt secret>
ADMIN_USERNAME=<initial admin username>
ADMIN_PASSWORD=<initial admin password>
PORT=5000 # optional
APP_BASE_URL=http://localhost:3000 # base URL used when generating QR codes
```

### Starting the services
Start the Express API (from `server`):
```bash
npm run dev      # uses nodemon
# or
npm start        # plain node
```
Start the React client (from `client`):
```bash
npm start
```
The client will automatically proxy requests to the server on port `5000`.

Once both services are running you can visit `http://localhost:3000` to use the app.

### QR codes
Each clue and side quest automatically includes a QR code that encodes its URL. Scanning a code directs players to that page. Unauthenticated users are routed to onboarding and back. The APP_BASE_URL variable sets the base URL used in these codes.
