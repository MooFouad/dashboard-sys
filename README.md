# GTS Dashboard - Full-Stack Management System

A comprehensive enterprise dashboard for managing vehicles, facilities, and employee benefits with automated expiry tracking and government API integration.

## Live Demo

🚀 **[View Live Demo](https://your-demo-url.vercel.app)**
📧 **Demo Account:** `demo@gts-demo.com` / `Demo@2024`
👤 **Or click "Try as Guest" for instant access** (no registration needed)

---

## Features

### Core Functionality
- **Vehicle Fleet Management** - Track licenses, inspections, insurance, and driver assignments
- **Property Management** - Monitor rental contracts, lease periods, and payment schedules
- **Utility Tracking** - Manage electricity consumption, billing, and payment status
- **Employee Benefits** - Track social insurance and GOSI (Saudi social insurance) records
- **Automated Alerts** - Color-coded expiry warnings with configurable notification days
- **Real-time Sync** - Integration with Saudi government APIs (Absher/TAMM, GOSI)

### Technical Features
- **Role-Based Access Control** - Admin, User, and Viewer roles with granular permissions
- **Excel Import/Export** - Bulk data operations with XLSX support
- **Push Notifications** - Web push notifications for expiring items
- **Data Validation** - Comprehensive input validation and sanitization
- **Responsive Design** - Mobile-first UI built with TailwindCSS
- **RESTful API** - Well-documented backend with Express.js
- **Secure Authentication** - JWT-based auth with bcrypt password hashing

---

## Tech Stack

### Frontend
- **React 19** - Modern UI with hooks and context API
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent iconography
- **Axios** - Promise-based HTTP client
- **XLSX** - Excel file processing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Validator** - Request validation
- **Node-Cron** - Scheduled notification jobs
- **Web Push** - Push notification support

### DevOps & Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Nodemon** - Auto-restart development server
- **dotenv** - Environment variable management

---

## Screenshots

### Dashboard Overview
![Dashboard](./docs/screenshots/dashboard.png)

### Vehicle Management
![Vehicles](./docs/screenshots/vehicles.png)

### Expiry Tracking
![Expiry Alerts](./docs/screenshots/expiry-tracking.png)

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gts-dashboard.git
   cd gts-dashboard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and other credentials
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Update VITE_API_URL if needed
   ```

4. **Seed Demo Data** (Optional)
   ```bash
   cd backend
   npm run seed
   ```

5. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

---

## Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gts-demo

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Demo Mode (use mock APIs instead of real integrations)
DEMO_MODE=true

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# External APIs (optional - mocked in demo mode)
GOSI_API_KEY=your-gosi-api-key
TAMM_CLIENT_ID=your-tamm-client-id
TAMM_CLIENT_SECRET=your-tamm-client-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

---

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login with email/password
POST /api/auth/guest       - Guest login (no credentials)
GET  /api/auth/me          - Get current user
POST /api/auth/logout      - Logout
```

### Resource Endpoints
```
# Vehicles
GET    /api/vehicles              - List all vehicles
POST   /api/vehicles              - Create vehicle
GET    /api/vehicles/:id          - Get vehicle by ID
PUT    /api/vehicles/:id          - Update vehicle
DELETE /api/vehicles/:id          - Delete vehicle
GET    /api/vehicles/count        - Get vehicle count

# Similar patterns for:
/api/home-rents
/api/electricity
/api/social-insurance
/api/gosi
/api/absher
/api/insurance
/api/mvpi
```

### Import/Export
```
POST /api/import/vehicles/:file   - Import vehicles from Excel
GET  /api/export/vehicles         - Export vehicles to Excel
```

---

## Project Structure

```
gts-dashboard/
├── backend/
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware (auth, validation, errors)
│   ├── models/             # Mongoose models
│   ├── routes/             # API route definitions
│   ├── scripts/            # Database seed and utility scripts
│   ├── services/           # Business logic and external API integration
│   │   └── mocks/          # Mock API services for demo mode
│   ├── validators/         # Request validation schemas
│   ├── .env.example        # Environment variables template
│   ├── server.js           # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Login, register
│   │   │   ├── common/     # Shared components
│   │   │   ├── layout/     # Header, sidebar, toolbar
│   │   │   ├── vehicles/   # Vehicle management
│   │   │   ├── homeRents/  # Property management
│   │   │   ├── electricity/# Utility tracking
│   │   │   └── ...         # Other modules
│   │   ├── contexts/       # React context (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # React entry point
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Key Features Explained

### Expiry Tracking System
The dashboard automatically calculates remaining days until expiry for:
- Vehicle licenses and inspections
- Insurance policies
- Rental contracts
- Employee benefits

**Color Coding:**
- 🔴 **Red** - Expired (negative days)
- 🟠 **Orange** - Expiring within 7 days
- 🟡 **Yellow** - Expiring within 30 days
- 🟢 **Green** - Active (30+ days remaining)

### Saudi Government API Integration
**GOSI API** - Fetches employee social insurance data:
- Employee engagement periods
- Wage information
- Contribution amounts
- Coverage status

**TAMM/Absher API** - Retrieves vehicle information:
- Vehicle registration details
- Insurance status
- MVPI (inspection) records
- Istemarah renewal eligibility

*Note: In demo mode, these APIs are mocked with realistic data*

### Notification System
- **Scheduled Daily Checks** - Runs at 9 AM to identify expiring items
- **Web Push Notifications** - Browser notifications for expiring records
- **Email Alerts** - (Optional) Email notifications to administrators
- **Configurable Thresholds** - Set custom warning periods

---

## Portfolio Context

This is a portfolio version of a production application originally built for fleet and facilities management. Key differences:

- **Mock Data** - All displayed data is fictional
- **Demo APIs** - External API calls are simulated
- **Guest Mode** - Instant access without registration
- **Sample Credentials** - Pre-configured demo accounts

The production version manages real company assets and integrates with Saudi government services (GOSI, Absher/TAMM) for automated data synchronization.

---

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## Deployment

### Backend (Render, Railway, or similar)
1. Create new Web Service
2. Connect to your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Frontend (Vercel, Netlify, or similar)
1. Import GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

---

## Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

**Your Name** - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

**Project Link:** [https://github.com/yourusername/gts-dashboard](https://github.com/yourusername/gts-dashboard)

**Live Demo:** [https://gts-dashboard-demo.vercel.app](https://gts-dashboard-demo.vercel.app)

---

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- API framework: [Express.js](https://expressjs.com/)
- Database: [MongoDB](https://www.mongodb.com/)

---

**Made with ❤️ as a portfolio project showcasing full-stack development skills**
#   d a s h b o a r d - s y s  
 #   d a s h b o a r d - s y s  
 