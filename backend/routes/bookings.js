const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../data/store');

// GET /api/bookings/admin/stats — MUST be before /:id
router.get('/admin/stats', async (req, res) => {
  try {
    const { bookings, drivers } = await db.getStats();

    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const inProgress = bookings.filter(b => b.status === 'in_progress').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    const totalFare = bookings
      .filter(b => b.status === 'completed' && b.fare)
      .reduce((sum, b) => sum + b.fare, 0);
    const commission = Math.round(totalFare * 0.1);

    const availableDrivers = drivers.filter(d => d.available).length;
    const totalDrivers = drivers.length;

    res.json({
      bookings: { total, pending, confirmed, inProgress, completed, cancelled },
      drivers: { total: totalDrivers, available: availableDrivers },
      revenue: { totalFare, commission },
      storage: db.isUsingMongo() ? 'mongodb' : 'memory'
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error while fetching stats' });
  }
});

// POST /api/bookings — Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      customerName, customerPhone, customerId,
      pickupAddress, dropAddress,
      pickupLat, pickupLng, dropLat, dropLng,
      goodsType, driverId, fare
    } = req.body;

    if (!customerName || !customerPhone || !pickupAddress || !dropAddress || !goodsType) {
      return res.status(400).json({
        error: 'Missing required fields: customerName, customerPhone, pickupAddress, dropAddress, goodsType'
      });
    }

    let assignedDriver = null;
    if (driverId) {
      assignedDriver = await db.getDriverById(driverId);
      if (assignedDriver) {
        await db.updateDriver(driverId, { available: false });
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

    await db.insertBooking(booking);
    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Server error while creating booking' });
  }
});

// GET /api/bookings — List all bookings with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, driverId, customerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (driverId) filter.driverId = driverId;
    if (customerId) filter.customerId = customerId;

    const bookings = await db.getBookings(filter);
    res.json({ bookings, total: bookings.length });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Server error while fetching bookings' });
  }
});

// GET /api/bookings/:id — Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await db.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ error: 'Server error while fetching booking' });
  }
});

// PATCH /api/bookings/:id/status — Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const booking = await db.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const { status, driverId } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    const bookingUpdates = { status };

    // Assign driver if provided and not already assigned
    if (driverId && !booking.driverId) {
      const driver = await db.getDriverById(driverId);
      if (driver) {
        bookingUpdates.driverId = driverId;
        bookingUpdates.driverName = driver.name;
        await db.updateDriver(driverId, { available: false });
      }
    }

    // On completion: free up driver and increment trip count
    if (status === 'completed' && booking.driverId) {
      const driver = await db.getDriverById(booking.driverId);
      if (driver) {
        await db.updateDriver(booking.driverId, {
          available: true,
          trips: (driver.trips || 0) + 1
        });
      }
    }

    // On cancellation: free up driver
    if (status === 'cancelled' && booking.driverId) {
      await db.updateDriver(booking.driverId, { available: true });
    }

    const updated = await db.updateBooking(req.params.id, bookingUpdates);
    res.json({ message: 'Booking status updated', booking: updated });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: 'Server error while updating booking status' });
  }
});

module.exports = router;
