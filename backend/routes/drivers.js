const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../data/store');
const { haversineDistance } = require('../middleware/haversine');

// POST /api/drivers — Register a new driver
router.post('/', async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber, city, lat, lng } = req.body;

    if (!name || !phone || !vehicleType || !city) {
      return res.status(400).json({ error: 'Name, phone, vehicleType, and city are required' });
    }

    const existing = await db.getDriverByPhone(phone.trim());
    if (existing) {
      return res.status(409).json({ error: 'Driver with this phone already exists', driver: existing });
    }

    const driver = {
      id: uuidv4(),
      name: name.trim(),
      phone: phone.trim(),
      vehicleType,
      vehicleNumber: vehicleNumber || 'N/A',
      city: city.trim(),
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      available: false,
      rating: 0,
      trips: 0,
      createdAt: new Date().toISOString()
    };

    await db.insertDriver(driver);
    res.status(201).json({ message: 'Driver registered successfully', driver });
  } catch (err) {
    console.error('Register driver error:', err);
    res.status(500).json({ error: 'Server error while registering driver' });
  }
});

// GET /api/drivers — List all drivers (admin)
router.get('/', async (req, res) => {
  try {
    const drivers = await db.getDrivers();
    res.json({ drivers, total: drivers.length });
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({ error: 'Server error while fetching drivers' });
  }
});

// GET /api/drivers/nearby/search — Find nearby available drivers
// IMPORTANT: This route MUST be before /:id
router.get('/nearby/search', async (req, res) => {
  try {
    const { lat, lng, radius = 50, goodsType } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query params required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    const allDrivers = await db.getDrivers();

    let nearby = allDrivers
      .filter(d => d.available && d.lat && d.lng)
      .map(d => {
        const distance = haversineDistance(userLat, userLng, d.lat, d.lng);
        return { ...d, distance: Math.round(distance * 10) / 10 };
      })
      .filter(d => d.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    // If no results within radius, expand to show all available with distance
    if (nearby.length === 0) {
      nearby = allDrivers
        .filter(d => d.available && d.lat && d.lng)
        .map(d => {
          const distance = haversineDistance(userLat, userLng, d.lat, d.lng);
          return { ...d, distance: Math.round(distance * 10) / 10 };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
    }

    res.json({ vehicles: nearby, total: nearby.length, searchRadius: maxRadius });
  } catch (err) {
    console.error('Nearby search error:', err);
    res.status(500).json({ error: 'Server error while searching nearby drivers' });
  }
});

// GET /api/drivers/:id — Get single driver
router.get('/:id', async (req, res) => {
  try {
    const driver = await db.getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    console.error('Get driver error:', err);
    res.status(500).json({ error: 'Server error while fetching driver' });
  }
});

// PATCH /api/drivers/:id/availability — Toggle availability + update GPS
router.patch('/:id/availability', async (req, res) => {
  try {
    const driver = await db.getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const { available, lat, lng } = req.body;
    const updates = {
      available: available !== undefined ? Boolean(available) : !driver.available
    };
    if (lat) updates.lat = parseFloat(lat);
    if (lng) updates.lng = parseFloat(lng);

    const updated = await db.updateDriver(req.params.id, updates);
    res.json({ message: 'Availability updated', driver: updated });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ error: 'Server error while updating availability' });
  }
});

// PATCH /api/drivers/:id/location — Update GPS location
router.patch('/:id/location', async (req, res) => {
  try {
    const driver = await db.getDriverById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const updated = await db.updateDriver(req.params.id, {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });
    res.json({ message: 'Location updated', driver: updated });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ error: 'Server error while updating location' });
  }
});

module.exports = router;
