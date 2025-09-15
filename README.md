# School Payment Dashboard Application

A comprehensive full-stack application for managing school payment transactions with a modern dashboard interface.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- NPM or Yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
Create a `.env` file in the backend directory:
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/school-payments?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=1h

# Payment Gateway Configuration
PG_KEY=edvtest01
API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0
SCHOOL_ID=65b0e6293e9f76a9694d84b4
PAYMENT_API_URL=https://dev-vanilla.edviron.com/erp

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. **Start the backend server:**
```bash
npm run start:dev
```

The backend server will start on `http://localhost:3001` and automatically seed the database with sample data.

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=School Payment Dashboard
```

4. **Start the frontend development server:**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Default Login Credentials

- **Username:** `admin`
- **Password:** `admin123`

## 📋 API Documentation

### Authentication Endpoints

#### POST /auth/login
Login with username and password.

**Request:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### POST /auth/signup
Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Payment Endpoints

#### POST /create-payment
Create a new payment request.

**Request:**
```bash
curl -X POST http://localhost:3001/create-payment \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000",
    "callback_url": "https://example.com/callback",
    "student_info": {
      "name": "John Doe",
      "id": "STU001",
      "email": "john@example.com"
    }
  }'
```

#### GET /transaction-status/:custom_order_id
Check transaction status by order ID.

**Request:**
```bash
curl -X GET http://localhost:3001/transaction-status/ORDER_1703001001_abc123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Transaction Endpoints

#### GET /transactions
Get all transactions with pagination and filtering.

**Request:**
```bash
curl -X GET "http://localhost:3001/transactions?page=1&limit=10&sort=createdAt&order=desc&status=success" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /transactions/school/:schoolId
Get transactions filtered by school ID.

**Request:**
```bash
curl -X GET http://localhost:3001/transactions/school/65b0e6293e9f76a9694d84b4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Webhook Endpoint

#### POST /webhook
Handle payment status webhooks.

**Request:**
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": 1,
    "order_info": {
      "order_id": "COLLECT_001",
      "order_amount": 1000,
      "transaction_amount": 1000,
      "gateway": "Edviron",
      "bank_reference": "REF_12345",
      "status": "success",
      "payment_mode": "netbanking",
      "payment_details": "Payment via netbanking",
      "payment_message": "Payment successful",
      "payment_time": "2024-01-01T12:00:00Z"
    }
  }'
```

## 🛠️ Features

### Backend Features
- **JWT Authentication**: Secure API endpoints with token-based authentication
- **Payment Gateway Integration**: Integration with Edviron payment API
- **MongoDB Integration**: Complete database schemas with proper indexing
- **Webhook Handling**: Real-time payment status updates
- **Data Validation**: Comprehensive input validation using class-validator
- **Logging**: Winston-based logging for debugging and monitoring
- **Error Handling**: Consistent error responses across all endpoints
- **Database Seeding**: Automatic sample data generation for testing

### Frontend Features
- **Modern Dashboard**: Clean, responsive interface built with React and Tailwind CSS
- **Transaction Management**: View and filter transactions with advanced search
- **Real-time Status Checking**: Check payment status by order ID
- **Data Visualization**: Charts and analytics for transaction insights
- **Dark Mode**: Toggle between light and dark themes
- **Export Functionality**: Download transaction data as CSV
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🏗️ Architecture

### Backend Architecture
```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── payment/           # Payment processing
│   ├── transaction/       # Transaction management
│   ├── webhook/           # Webhook handling
│   ├── schemas/           # Database schemas
│   ├── seeder/            # Database seeding
│   └── main.ts            # Application entry point
├── logs/                  # Log files
└── package.json
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── main.tsx           # Application entry point
└── package.json
```

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Install Heroku CLI and login:**
```bash
heroku login
```

2. **Create Heroku app:**
```bash
heroku create your-app-name-backend
```

3. **Set environment variables:**
```bash
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set NODE_ENV=production
# ... set other environment variables
```

4. **Deploy:**
```bash
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)

#### Using Netlify:
1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

#### Using Vercel:
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

## 🧪 Testing

### Sample Test Data

The application automatically seeds the database with sample data including:
- Admin user (username: admin, password: admin123)
- 15+ sample transactions with various statuses
- Multiple school IDs for testing filters

### Test Payment Credentials

For testing payment integration, use these test credentials from Cashfree sandbox:
- **Test Card**: 4111 1111 1111 1111
- **CVV**: 123
- **Expiry**: Any future date
- **OTP**: 123456

## 🔧 Configuration

### Environment Variables

#### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | Secret key for JWT tokens | your-secret-key |
| JWT_EXPIRY | Token expiration time | 1h |
| PG_KEY | Payment gateway key | edvtest01 |
| API_KEY | Payment API key | Bearer token |
| SCHOOL_ID | Default school ID | 65b0e6293e9f76a9694d84b4 |

#### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3001 |
| VITE_APP_NAME | Application name | School Payment Dashboard |

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@example.com

## 🔄 Updates

Check the repository regularly for updates and new features. The application is actively maintained and updated with new features and security improvements.