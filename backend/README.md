# CRAFTELLE Backend API

This is the backend API for the CRAFTELLE e-commerce platform. It provides RESTful endpoints for user authentication, product management, cart, orders, payments, and more.

## Tech Stack
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Authentication**: JWT (JSON Web Tokens)
-   **Payment Gateway**: Razorpay
-   **Image Storage**: Cloudinary
-   **File Handling**: Multer

## Getting Started

### Prerequisites
-   Node.js (v14 or higher)
-   MongoDB (Local or Atlas)
-   Cloudinary Account
-   Razorpay Account

### Installation

1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` root and add the following:

    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/craftelle
    JWT_SECRET=your_jwt_secret_key_change_this_in_production
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

### Running the Server

-   **Development Mode** (with nodemon):
    ```bash
    npm run dev
    ```

-   **Production Mode**:
    ```bash
    npm start
    ```

Server will run on `http://localhost:5000` by default.

## API Endpoints

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/v1/auth/register` | Register new user (First user becomes Admin) |
| | POST | `/api/v1/auth/login` | Login user |
| **Products** | GET | `/api/v1/products` | Get all products |
| | POST | `/api/v1/products` | Create product (Admin) |
| **Orders** | POST | `/api/v1/orders/new` | Place new order |
| **Payment** | POST | `/api/v1/payment/checkout` | Initiate Razorpay payment |
| **Upload** | POST | `/api/v1/upload` | Upload image for customization |

## Database Seeding (Optional)

To quickly populate the database with an Admin user and Dummy Products:

-   **Import Data**: `node seeder.js -i`
-   **Delete Data**: `node seeder.js -d`

## Folder Structure

```
backend/
├── src/
│   ├── config/         # DB & Cloudinary config
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth, Error, Upload middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   └── utils/          # Helper functions (APIFeatures)
├── server.js           # App entry point
├── seeder.js           # Data import/destroy script
└── README.md           # Documentation
```
