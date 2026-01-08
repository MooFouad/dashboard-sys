# Mock Data Setup Guide

## Overview
The portfolio version now uses **JSON-based mock data** instead of MongoDB. This provides:

✅ **No database required** - Works immediately without setup
✅ **Completely isolated** - Zero risk of touching production data
✅ **Fast deployment** - No MongoDB Atlas configuration needed
✅ **Self-contained** - All demo data in version control

---

## How It Works

### 1. Mock Data Files
All demo data is stored in JSON files at `backend/data/mock/`:

```
backend/data/mock/
├── users.json           # Demo user accounts
├── vehicles.json        # 8 demo vehicles
├── homeRents.json       # 5 demo properties
├── electricity.json     # 4 demo accounts
├── socialInsurance.json # 8 demo employees
├── absher.json          # 8 vehicle registration records
└── gosi.json            # 8 GOSI social insurance records
```

### 2. Mock Data Service
The `mockDataService.js` loads these files and provides:
- In-memory CRUD operations
- Query filtering
- Automatic ID generation
- Count operations

### 3. Server Configuration
When `USE_MOCK_DATA=true` in `.env`:
- Server skips MongoDB connection
- Loads mock data from JSON files on startup
- All data operations work in-memory

---

## Environment Configuration

### `.env` Settings for Portfolio Version

```env
# Demo Mode - CRITICAL FOR PORTFOLIO
DEMO_MODE=true          # Mock external APIs (GOSI, Absher)
USE_MOCK_DATA=true      # Use JSON files instead of database

# No MongoDB URI needed!
# Database section is commented out

# New demo VAPID keys (different from production)
VAPID_PUBLIC_KEY=BFme8MomUeiPyMe1mEa49Z7oY16I4sAGkoiH6JCG47JIZ67TuZGIKQn08i9iuwJvEWbatWIHoptRX8Z-6BWsyM0
VAPID_PRIVATE_KEY=6zjHYXfZRV9zU2AOtz0aUDdz4zNghktpd1QnhrIRO9w

# Email disabled for demo
EMAIL_USER=
EMAIL_PASS=

# New JWT secret (different from production)
JWT_SECRET=8df1698c0e3f92964e7b3a4fe56065c3a6aa38c9216bbdd70f10c0eca5de2a05a58db35342d171662d5bd86d5744b29d5a70518eae4904fce3a329dceee8d009
```

---

## Using Mock Data in Routes

### Example: Vehicle Routes

Routes that normally use MongoDB models should check for mock data mode:

```javascript
const mockDataService = require('../services/mockDataService');

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    let vehicles;

    if (process.env.USE_MOCK_DATA === 'true') {
      // Use mock data service
      vehicles = await mockDataService.find('vehicles');
    } else {
      // Use MongoDB model
      vehicles = await Vehicle.find();
    }

    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    let vehicle;

    if (process.env.USE_MOCK_DATA === 'true') {
      vehicle = await mockDataService.findById('vehicles', req.params.id);
    } else {
      vehicle = await Vehicle.findById(req.params.id);
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE vehicle
router.post('/', async (req, res) => {
  try {
    let vehicle;

    if (process.env.USE_MOCK_DATA === 'true') {
      vehicle = await mockDataService.create('vehicles', req.body);
    } else {
      vehicle = await Vehicle.create(req.body);
    }

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE vehicle
router.put('/:id', async (req, res) => {
  try {
    let vehicle;

    if (process.env.USE_MOCK_DATA === 'true') {
      vehicle = await mockDataService.update('vehicles', req.params.id, req.body);
    } else {
      vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    let vehicle;

    if (process.env.USE_MOCK_DATA === 'true') {
      vehicle = await mockDataService.delete('vehicles', req.params.id);
    } else {
      vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    }

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Mock Data Service API

### Available Methods

```javascript
const mockDataService = require('../services/mockDataService');

// Find all items (with optional query filter)
await mockDataService.find('vehicles', { status: 'active' });
await mockDataService.find('users'); // All users

// Find one item by query
await mockDataService.findOne('users', { email: 'demo@gts-demo.com' });

// Find by ID
await mockDataService.findById('vehicles', 'veh-001');

// Create new item (auto-generates ID)
await mockDataService.create('vehicles', { plateNumber: 'ABC-9999', ... });

// Update item by ID
await mockDataService.update('vehicles', 'veh-001', { status: 'inactive' });

// Delete item by ID
await mockDataService.delete('vehicles', 'veh-001');

// Delete multiple items
await mockDataService.deleteMany('vehicles', ['veh-001', 'veh-002']);

// Count items
await mockDataService.count('vehicles');
await mockDataService.count('vehicles', { status: 'active' }); // With filter

// Reset all data to original state
await mockDataService.reset();

// Get statistics
await mockDataService.getStats(); // Returns counts for all collections
```

---

## Demo Data Details

### User Accounts

```json
{
  "email": "demo@gts-demo.com",
  "password": "Demo@2024",
  "role": "admin"
}
```

**All accounts:**
- **demo@gts-demo.com** / Demo@2024 (admin)
- **user@gts-demo.com** / User@2024 (user)
- **viewer@gts-demo.com** / Viewer@2024 (viewer)

### Data Statistics

- **Users**: 3 accounts (admin, user, viewer)
- **Vehicles**: 8 vehicles (various statuses)
- **Home Rents**: 5 properties (offices, warehouses, residential)
- **Electricity**: 4 accounts
- **Social Insurance**: 8 employees
- **Absher**: 8 vehicle registration records
- **GOSI**: 8 social insurance records

All data maintains referential integrity:
- Vehicle plate numbers match across Vehicle, Absher collections
- Employee national IDs match between Social Insurance and GOSI
- Data includes mix of active, expiring-soon, and expired statuses

---

## Testing the Mock Data System

### 1. Start the Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
📦 DEMO MODE: Using mock JSON data (no database connection)
   Data loaded from: backend/data/mock/*.json
✅ Mock data loaded:
   - users: 3 items
   - vehicles: 8 items
   - homeRents: 5 items
   - electricity: 4 items
   - socialInsurance: 8 items
   - absher: 8 items
   - gosi: 8 items
```

### 2. Test Authentication

```bash
# Login as demo admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@gts-demo.com","password":"Demo@2024"}'

# Guest login
curl -X POST http://localhost:5000/api/auth/guest
```

### 3. Test Data Retrieval

```bash
# Get all vehicles
curl http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer <your-token>"

# Get vehicle count
curl http://localhost:5000/api/vehicles/count \
  -H "Authorization: Bearer <your-token>"
```

---

## Advantages Over Database

### Development

✅ **Instant startup** - No database connection delay
✅ **Easy debugging** - Edit JSON files directly
✅ **Version control** - Data changes tracked in Git
✅ **No dependencies** - Works without MongoDB installed

### Deployment

✅ **Vercel/Netlify ready** - No database config needed
✅ **Zero cost** - No MongoDB Atlas account required
✅ **Portable** - Works anywhere Node.js runs
✅ **Fast** - In-memory operations

### Portfolio

✅ **Safe** - Cannot accidentally connect to production
✅ **Consistent** - Same data for all users
✅ **Resettable** - Easy to restore original state
✅ **Shareable** - Demo data in repository

---

## Limitations & Notes

### Data Persistence

⚠️ **Changes are temporary** - Data resets on server restart
⚠️ **No transactions** - Not suitable for production
⚠️ **Limited querying** - Simple filters only (no aggregation)

### When NOT to Use

- ❌ Production applications
- ❌ Multi-user environments requiring persistence
- ❌ Complex database queries (joins, aggregations)
- ❌ Large datasets (>1000 records per collection)

### Perfect For

- ✅ **Portfolio demos** (our use case!)
- ✅ Frontend development
- ✅ API testing
- ✅ Prototyping
- ✅ Education/training

---

## Switching Between Mock and Real Database

### Use Mock Data (Portfolio)

```env
DEMO_MODE=true
USE_MOCK_DATA=true
# MONGODB_URI=... (commented out)
```

### Use Real Database (Production)

```env
DEMO_MODE=false
USE_MOCK_DATA=false
MONGODB_URI=mongodb+srv://...your-real-database...
```

---

## Troubleshooting

### Server fails to start?

**Check:**
1. `.env` file exists in backend folder
2. `USE_MOCK_DATA=true` is set
3. JSON files exist in `backend/data/mock/`

### Data not showing up?

**Check:**
1. Routes are using `mockDataService` when `USE_MOCK_DATA=true`
2. JSON files are valid (no syntax errors)
3. Server console shows "Mock data loaded" message

### Frontend can't connect?

**Check:**
1. Backend is running on port 5000
2. Frontend `.env` has `VITE_API_URL=http://localhost:5000/api`
3. CORS is enabled for frontend origin

---

## Summary

Your portfolio version now runs **completely standalone** with:

✅ No MongoDB required
✅ No database setup
✅ No production risk
✅ Instant deployment

All demo data is in JSON files that load instantly on startup. Perfect for portfolio demonstrations!
