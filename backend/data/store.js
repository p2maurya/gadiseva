const { v4: uuidv4 } = require('uuid');

// In-memory database
// NOTE: Data resets on server restart.
// For production persistence, replace with MongoDB Atlas (free tier).

const db = {
  drivers: [
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
  ],
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
    },
    {
      id: 'book-002',
      customerId: 'cust-002',
      customerName: 'Anil Verma',
      customerPhone: '9822334455',
      driverId: null,
      driverName: null,
      pickupAddress: 'Sitapur Mandi',
      dropAddress: 'Lucknow Mandi',
      pickupLat: 27.5706,
      pickupLng: 80.6833,
      dropLat: 26.8467,
      dropLng: 80.9462,
      goodsType: 'Kheti',
      status: 'pending',
      fare: 800,
      createdAt: new Date().toISOString()
    }
  ],
  customers: [],
  admins: [{ id: 'admin-001', username: 'admin', password: 'admin123' }]
};

module.exports = { db, uuidv4 };
