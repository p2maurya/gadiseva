const express = require('express');
const router = express.Router();
const { db, uuidv4 } = require('../data/store');
const { haversineDistance } = require('../middleware/haversine');

// POST /api/drivers — Register a new driver
router.post('/', (req, res) => {
  const { name, phone, vehicleType, vehicleNumber, city, lat, lng } = req.body;

  if (!name || !phone || !vehicleType || !city) {
    return res.status(400).json({ error: 'Name, phone, vehicleType, and city are required' });
  }

  const existing = db.drivers.find(d => d.phone === phone);
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

  db.drivers.push(driver);
  res.status(201).json({ message: 'Driver registered successfully', driver });
});

// GET /api/drivers — List all drivers (admin)
router.get('/', (req, res) => {
  const drivers = db.drivers.map(d => ({ ...d }));
  res.json({ drivers, total: drivers.length });
});

// GET /api/drivers/nearby/search — Find nearby available drivers
// IMPORTANT: This route MUST be before /:id or Express will match "nearby" as an id
router.get('/nearby/search', (req, res) => {
  const { lat, lng, radius = 50, goodsType } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng query params required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const maxRadius = parseFloat(radius);

  let nearby = db.drivers
    .filter(d => d.available && d.lat && d.lng)
    .map(d => {
      const distance = haversineDistance(userLat, userLng, d.lat, d.lng);
      return { ...d, distance: Math.round(distance * 10) / 10 };
    })
    .filter(d => d.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);

  // If no results within radius, expand to show all available with distance
  if (nearby.length === 0) {
    nearby = db.drivers
      .filter(d => d.available && d.lat && d.lng)
      .map(d => {
        const distance = haversineDistance(userLat, userLng, d.lat, d.lng);
        return { ...d, distance: Math.round(distance * 10) / 10 };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  res.json({ vehicles: nearby, total: nearby.length, searchRadius: maxRadius });
});

// GET /api/drivers/:id — Get single driver
router.get('/:id', (req, res) => {
  const driver = db.drivers.find(d => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json(driver);
});

// PATCH /api/drivers/:id/availability — Toggle availability + update GPS
router.patch('/:id/availability', (req, res) => {
  const driver = db.drivers.find(d => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  const { available, lat, lng } = req.body;
  driver.available = available !== undefined ? Boolean(available) : !driver.available;
  if (lat) driver.lat = parseFloat(lat);
  if (lng) driver.lng = parseFloat(lng);

  res.json({ message: 'Availability updated', driver });
});

// PATCH /api/drivers/:id/location — Update GPS location
router.patch('/:id/location', (req, res) => {
  const driver = db.drivers.find(d => d.id === req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });

  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

  driver.lat = parseFloat(lat);
  driver.lng = parseFloat(lng);
  res.json({ message: 'Location updated', driver });
});

module.exports = router;
