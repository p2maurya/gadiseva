const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../data/store');

// GET /api/bookings/admin/stats — MUST be before /:id
router.get('/admin/stats', (req, res) => {
  const total = db.bookings.length;
  const pending = db.bookings.filter(b => b.status === 'pending').length;
  const confirmed = db.bookings.filter(b => b.status === 'confirmed').length;
  const inProgress = db.bookings.filter(b => b.status === 'in_progress').length;
  const completed = db.bookings.filter(b => b.status === 'completed').length;
  const cancelled = db.bookings.filter(b => b.status === 'cancelled').length;

  const totalFare = db.bookings
    .filter(b => b.status === 'completed' && b.fare)
    .reduce((sum, b) => sum + b.fare, 0);
  const commission = Math.round(totalFare * 0.1);

  const availableDrivers = db.drivers.filter(d => d.available).length;
  const totalDrivers = db.drivers.length;

  res.json({
    bookings: { total, pending, confirmed, inProgress, completed, cancelled },
    drivers: { total: totalDrivers, available: availableDrivers },
    revenue: { totalFare, commission }
  });
});

// POST /api/bookings — Create a new booking
router.post('/', (req, res) => {
  const {
    customerName, customerPhone, customerId,
    pickupAddress, dropAddress,
    pickupLat, pickupLng, dropLat, dropLng,
    goodsType, driverId, fare
  } = req.body;

  if (!customerName || !customerPhone || !pickupAddress || !dropAddress || !goodsType) {
    return res.status(400).json({ error: 'Missing required booking fields: customerName, customerPhone, pickupAddress, dropAddress, goodsType' });
  }

  let assignedDriver = null;

  if (driverId) {
    assignedDriver = db.drivers.find(d => d.id === driverId);
    if (assignedDriver) {
      assignedDriver.available = false;
    }
  }

  const booking = {
    id: uuidv4(),
    customerId: customerId || uuidv4(),
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    driverId: driverId || null,
    driverName: assignedDriver ? assignedDriver.name : null,
    pickupAddress: pickupAddress.trim(),
    dropAddress: dropAddress.trim(),
    pickupLat: pickupLat ? parseFloat(pickupLat) : null,
    pickupLng: pickupLng ? parseFloat(pickupLng) : null,
    dropLat: dropLat ? parseFloat(dropLat) : null,
    dropLng: dropLng ? parseFloat(dropLng) : null,
    goodsType,
    status: driverId ? 'confirmed' : 'pending',
    fare: fare ? parseInt(fare) : null,
    createdAt: new Date().toISOString()
  };

  db.bookings.push(booking);
  res.status(201).json({ message: 'Booking created', booking });
});

// GET /api/bookings — List all bookings with optional filters
router.get('/', (req, res) => {
  const { status, driverId, customerId } = req.query;
  let bookings = [...db.bookings];

  if (status) bookings = bookings.filter(b => b.status === status);
  if (driverId) bookings = bookings.filter(b => b.driverId === driverId);
  if (customerId) bookings = bookings.filter(b => b.customerId === customerId);

  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings, total: bookings.length });
});

// GET /api/bookings/:id — Get single booking
router.get('/:id', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// PATCH /api/bookings/:id/status — Update booking status
router.patch('/:id/status', (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const { status, driverId } = req.body;
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  booking.status = status;

  // Assign driver if provided and not already assigned
  if (driverId && !booking.driverId) {
    const driver = db.drivers.find(d => d.id === driverId);
    if (driver) {
      booking.driverId = driverId;
      booking.driverName = driver.name;
      driver.available = false;
    }
  }

  // On completion: free up driver and increment trip count
  if (status === 'completed' && booking.driverId) {
    const driver = db.drivers.find(d => d.id === booking.driverId);
    if (driver) {
      driver.available = true;
      driver.trips += 1;
    }
  }

  // On cancellation: free up driver
  if (status === 'cancelled' && booking.driverId) {
    const driver = db.drivers.find(d => d.id === booking.driverId);
    if (driver) driver.available = true;
  }

  res.json({ message: 'Booking status updated', booking });
});

module.exports = router;
