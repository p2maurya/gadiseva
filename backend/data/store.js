const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
// Set MONGODB_URI environment variable in your Render/Railway dashboard
// Get free URI from: https://cloud.mongodb.com
const MONGODB_URI = process.env.MONGODB_URI;

let client = null;
let mongoDb = null;
let usingMongo = false;

// Default seed drivers (only used when MongoDB is NOT connected)
const seedDrivers = [
  {
    id: 'driver-001',
    name: 'Ramesh Yadav',
    phone: '9876543210',
    vehicleType: 'Tractor',
    vehicleNumber: 'UP32 AB 1234',
    city: 'Sitapur',
    lat: 27.5706,
    lng: 80.6833,
    available: true,
    rating: 4.5,
    trips: 34,
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-002',
    name: 'Suresh Kumar',
    phone: '9812345678',
    vehicleType: 'Mini Truck',
    vehicleNumber: 'UP32 CD 5678',
    city: 'Lucknow',
    lat: 26.8467,
    lng: 80.9462,
    available: true,
    rating: 4.2,
    trips: 21,
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-003',
    name: 'Mohan Lal',
    phone: '9934567890',
    vehicleType: 'Pickup Van',
    vehicleNumber: 'UP32 EF 9012',
    city: 'Hardoi',
    lat: 27.3957,
    lng: 80.1237,
    available: false,
    rating: 4.8,
    trips: 57,
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-004',
    name: 'Dinesh Patel',
    phone: '9845678901',
    vehicleType: 'Tempo',
    vehicleNumber: 'UP33 GH 3456',
    city: 'Barabanki',
    lat: 26.9273,
    lng: 81.1876,
    available: true,
    rating: 4.0,
    trips: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-005',
    name: 'Vijay Singh',
    phone: '9867890123',
    vehicleType: 'Bullock Cart',
    vehicleNumber: 'N/A',
    city: 'Raebareli',
    lat: 26.2348,
    lng: 81.2390,
    available: true,
    rating: 3.9,
    trips: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-006',
    name: 'Rakesh Verma',
    phone: '9878901234',
    vehicleType: 'Auto',
    vehicleNumber: 'UP32 KL 7890',
    city: 'Lucknow',
    lat: 26.8550,
    lng: 80.9200,
    available: true,
    rating: 4.3,
    trips: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: 'driver-007',
    name: 'Santosh Mishra',
    phone: '9890123456',
    vehicleType: 'Truck',
    vehicleNumber: 'UP32 MN 1122',
    city: 'Unnao',
    lat: 26.5481,
    lng: 80.4915,
    available: true,
    rating: 4.6,
    trips: 28,
    createdAt: new Date().toISOString()
  }
];

// Fallback in-memory store (used only if MongoDB is NOT configured)
const memDb = {
  drivers: [...seedDrivers],
  bookings: [
    {
      id: 'book-001',
      customerId: 'cust-001',
      customerName: 'Priya Sharma',
      customerPhone: '9811223344',
      driverId: 'driver-002',
      driverName: 'Suresh Kumar',
      pickupAddress: 'Gomti Nagar, Lucknow',
      dropAddress: 'Sitapur Road, Lucknow',
      pickupLat: 26.860,
      pickupLng: 80.9968,
      dropLat: 26.9124,
      dropLng: 80.9623,
      goodsType: 'Saman',
      status: 'completed',
      fare: 350,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  customers: [],
  admins: [{ id: 'admin-001', username: 'admin', password: 'admin123' }]
};

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
async function connectMongo() {
  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set. Using in-memory storage (data will reset on restart!)');
    console.warn('   Set MONGODB_URI in environment variables to persist data.');
    return false;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    mongoDb = client.db('gaadi_express');
    usingMongo = true;

    // Seed default drivers if collection is empty
    const count = await mongoDb.collection('drivers').countDocuments();
    if (count === 0) {
      await mongoDb.collection('drivers').insertMany(seedDrivers);
      console.log('✅ MongoDB: Seeded default drivers');
    }

    console.log('✅ MongoDB Atlas connected — data will persist!');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('   Falling back to in-memory storage.');
    usingMongo = false;
    return false;
  }
}

// ─── DB Wrapper (works for both Mongo and in-memory) ─────────────────────────
const db = {
  // ── DRIVERS ──────────────────────────────────────────────
  async getDrivers() {
    if (usingMongo) {
      return await mongoDb.collection('drivers').find({}).toArray();
    }
    return memDb.drivers;
  },

  async getDriverById(id) {
    if (usingMongo) {
      return await mongoDb.collection('drivers').findOne({ id });
    }
    return memDb.drivers.find(d => d.id === id) || null;
  },

  async getDriverByPhone(phone) {
    if (usingMongo) {
      return await mongoDb.collection('drivers').findOne({ phone });
    }
    return memDb.drivers.find(d => d.phone === phone) || null;
  },

  async insertDriver(driver) {
    if (usingMongo) {
      await mongoDb.collection('drivers').insertOne(driver);
    } else {
      memDb.drivers.push(driver);
    }
    return driver;
  },

  async updateDriver(id, updates) {
    if (usingMongo) {
      await mongoDb.collection('drivers').updateOne({ id }, { $set: updates });
      return await mongoDb.collection('drivers').findOne({ id });
    }
    const driver = memDb.drivers.find(d => d.id === id);
    if (driver) Object.assign(driver, updates);
    return driver;
  },

  // ── BOOKINGS ──────────────────────────────────────────────
  async getBookings(filter = {}) {
    if (usingMongo) {
      return await mongoDb.collection('bookings').find(filter).sort({ createdAt: -1 }).toArray();
    }
    let bookings = [...memDb.bookings];
    if (filter.status) bookings = bookings.filter(b => b.status === filter.status);
    if (filter.driverId) bookings = bookings.filter(b => b.driverId === filter.driverId);
    if (filter.customerId) bookings = bookings.filter(b => b.customerId === filter.customerId);
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getBookingById(id) {
    if (usingMongo) {
      return await mongoDb.collection('bookings').findOne({ id });
    }
    return memDb.bookings.find(b => b.id === id) || null;
  },

  async insertBooking(booking) {
    if (usingMongo) {
      await mongoDb.collection('bookings').insertOne(booking);
    } else {
      memDb.bookings.push(booking);
    }
    return booking;
  },

  async updateBooking(id, updates) {
    if (usingMongo) {
      await mongoDb.collection('bookings').updateOne({ id }, { $set: updates });
      return await mongoDb.collection('bookings').findOne({ id });
    }
    const booking = memDb.bookings.find(b => b.id === id);
    if (booking) Object.assign(booking, updates);
    return booking;
  },

  // ── STATS ──────────────────────────────────────────────
  async getStats() {
    if (usingMongo) {
      const bookings = await mongoDb.collection('bookings').find({}).toArray();
      const drivers = await mongoDb.collection('drivers').find({}).toArray();
      return { bookings, drivers };
    }
    return { bookings: memDb.bookings, drivers: memDb.drivers };
  },

  isUsingMongo() {
    return usingMongo;
  }
};

module.exports = { db, uuidv4, connectMongo };
