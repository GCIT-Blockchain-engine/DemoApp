# Demo Blockchain App

This is a demo blockchain application for managing user wallets, handling login and registration, and demonstrating blockchain-based transactions. The application is built using Node.js, Express, and MongoDB, and it features user authentication, wallet key management, and integration with a blockchain API for transactions.

## Table of Contents

- [Demo Blockchain App](#demo-blockchain-app)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running the Application](#running-the-application)
  - [API Endpoints](#api-endpoints)
  - [User Interface](#user-interface)
  - [License](#license)

## Features

- User Registration and Login
- JWT-based Authentication
- Wallet Key Generation and Storage
- QR Code Generation for Public Keys
- Simple and clean user interface for accessing the application

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **QR Code Generation**: `html5-qrcode`

## Getting Started

### Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd demo-blockchain-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **MongoDB Setup**:
   Ensure that MongoDB is installed and running on your local machine at `mongodb://localhost:27017/gcit`.

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

- `JWT_SECRET` should be a random string used for signing JWT tokens.
- `PORT` is the port number for running the Express server (default is `3000`).

### Running the Application

1. **Start the Server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

2. **Access the Frontend**:
   You can access the login page, register page, and dashboard through the following URLs:
   - Registration: `http://localhost:3000/register`
   - Login: `http://localhost:3000/`
   - Dashboard: `http://localhost:3000/dashboard` (requires login)

## API Endpoints

The following endpoints are available in the demo app:

- **POST /register**: Register a new user.
  - **Body Parameters**:
    - `name`: User's name.
    - `email`: User's email.
    - `password`: User's password.

- **POST /login**: Login user and get a JWT token.
  - **Body Parameters**:
    - `email`: User's email.
    - `password`: User's password.

- **POST /generate-keys**: Generate public and private keys for the user and save them.
  - **Body Parameters**:
    - `userId`: User's ID from the JWT token.
    - `privateKey`: Private key generated for the user.
    - `publicKey`: Public key generated for the user.

- **GET /user**: Get user data. Requires authentication.

## User Interface

The frontend is available under the `public` folder and includes the following pages:

- **Login Page**: The default root (`/`) serves as the login page where users can log in using their email and password.
- **Register Page**: Users can create a new account through the `/register` route.
- **Dashboard Page**: Once logged in, users can view their public and private keys, balance, and perform actions like QR code generation for wallet address, and transaction history.

## License

This project is licensed under the MIT License. Feel free to use, modify, and share it.

