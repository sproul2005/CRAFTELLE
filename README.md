# Craftelle - E-Commerce Platform

Craftelle is a premium, full-stack e-commerce platform dedicated to handcrafted art masterpieces, including Resin Art, String Art, Mandala Art, Portraits, Candles, and Rakhis. It provides a seamless shopping experience for users and a robust admin dashboard for managing the store.

## 🌟 Key Features

### For Users:
- **Responsive Design:** A beautiful, responsive user interface designed for both desktop and mobile devices.
- **Product Catalog:** Browse products across various categories with filtering and dynamic search with instant suggestions.
- **Authentication:** Secure user signup and login with JWT and automatic session handling.
- **Cart & Wishlist:** Fully functional shopping cart and wishlist management.
- **Checkout Process:** Seamless checkout flow with integrated payment gateways (Razorpay).
- **Order Tracking:** Users can view their order history and track the status of current orders.

### For Administrators:
- **Admin Dashboard:** Centralized dashboard to view sales figures and recent orders.
- **Product Management:** Add, edit, or remove products. Upload images directly to Cloudinary.
- **Order Management:** View and update the status of customer orders (e.g., from Processing to Shipped/Delivered).

## 🚀 Technology Stack

### Frontend:
- **Framework:** React.js (Vite)
- **Styling:** Custom CSS, Lucide React (Icons)
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **State Management:** React Context API (Auth, Cart, Wishlist)

### Backend:
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **File Uploads:** Multer & Cloudinary
- **Payments:** Razorpay

## 🛠️ Installation & Setup

### Prerequisites
- Node.js installed on your local machine
- MongoDB instance (local or Atlas)
- Cloudinary Account (for image uploads)
- Razorpay Account (for payments)

### 1. Clone the repository
```bash
git clone https://github.com/sproul2005/CRAFTELLE.git
cd CRAFTELLE
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and create a `.env` file.
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
NODE_ENV=DEVELOPMENT
DB_LOCAL_URI=mongodb://localhost:27017/craftelle
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and run the development server.
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application should now be running. The frontend typically runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 📁 Project Structure

```text
CRAFTELLE/
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── config/           # Database and Cloudinary configuration
│   │   ├── controllers/      # Route controllers (Auth, Products, Orders, etc.)
│   │   ├── middleware/       # Custom middleware (Auth, Error handling, Multer)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express API routes
│   │   └── utils/            # Helper classes (APIFeatures, ErrorHandler)
│   └── server.js             # Entry point for backend
│
└── frontend/                 # React.js Application
    ├── public/
    └── src/
        ├── assets/           # Static files
        ├── components/       # Reusable UI components (Navbar, Footer, etc.)
        ├── context/          # React Context providers (Auth, Cart, Wishlist)
        ├── pages/            # Page-level components
        │   └── admin/        # Admin interface pages
        ├── services/         # Axios API service configuration
        ├── App.jsx           # Main application routing
        └── index.css         # Global styling and CSS variables
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
