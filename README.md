# Treasure Hunt

This project contains a React client and an Express/MongoDB server for running an online treasure hunt game.

## Features
- Onboarding flow for players to create or join teams
- Simplified signup using only first and last name
- Sequential clues with answer submission
- Side quests and a rogues gallery for uploaded media
- Admin authentication and dashboard endpoints
- Team colour schemes and profile management
- Installable Progressive Web App with offline support
- Admin settings include a **master reset** to wipe all game data after typing
  `definitely` as confirmation
- Scanning QR codes requires login; unauthenticated scans redirect to the sign-in page

## Player Onboarding and Login
Players still enter only their first and last name, but a selfie must be
uploaded during signup. When creating a new team you must also provide a unique
team name and a team photo. To join an existing team simply provide the last
name of the player who originally created it.

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
# Use HTTPS so mobile browsers allow camera access
# Option 1: run with an environment variable
HTTPS=true npm start

# Option 2: create a `.env` file in `client/` containing:
#   HTTPS=true
# Then simply run:
# npm start
```
The client will automatically proxy requests to the server on port `5000`.

Once both services are running you can visit `http://localhost:3000` to use the app. Modern browsers will offer an "Add to Home Screen" prompt because the client is now a Progressive Web App. Mobile users will also see a small banner inviting them to install the app for offline access.

**Note:** The QR scanner requires camera access, which is only permitted in secure contexts. When testing on a mobile device, open the site over `https://` or via `localhost`; otherwise the browser will block camera access and scanning will fail.
By default the QR scanner opens the rear camera. This can be changed from the **Profile** page if your device chooses the wrong camera.

### Building for production
After development you can host the entire webapp from the Express server.

1. Build the React client to generate the static assets:
   ```bash
   cd client
   npm run build
   ```
2. Start the server in production mode so it serves the build:
   ```bash
   cd ../server
   NODE_ENV=production node server.js
   ```

The application will now be available at `http://localhost:5000` and modern
browsers will allow it to be installed as a Progressive Web App with offline
support.
