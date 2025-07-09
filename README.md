# Hana ENT Hospital App Backend

This repository contains a simple example of a backend API for the Hana ENT Hospital app. It is built with Node.js using only core modules so that it runs without additional dependencies.

## Getting Started

1. Install [Node.js](https://nodejs.org/).
2. Run the server:

```bash
npm start
```

The server will start on port 3000 by default.

## Available Endpoints

- `GET /appointments` – list all appointments
- `POST /appointments` – create a new appointment (JSON body)
- `GET /notices` – hospital notices
- `GET /results` – examination results

Data is stored in memory for demonstration purposes.
