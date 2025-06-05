import express from 'express';
import { hotelsData } from '../data/hotels.js';

const router = express.Router();

// Endpoint to fetch all hotels
router.get('/hotels', async (req, res) => {
  try {
    res.json(hotelsData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch hotels by location
router.get('/hotels/location/:location', async (req, res) => {
  const { location } = req.params;

  try {
    // Filter hotels by location (case-insensitive)
    const filteredHotels = hotelsData.filter(
      (hotel) => hotel.location.toLowerCase() === location.toLowerCase()
    );

    if (filteredHotels.length === 0) {
      return res.status(404).json({ error: 'No hotels found for this location' });
    }

    res.json(filteredHotels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
