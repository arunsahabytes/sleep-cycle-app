const express = require('express');
const router = express.Router();
const Sleep = require('../models/Sleep');
const auth = require('../middleware/auth');

// Get all sleep entries for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const sleepEntries = await Sleep.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(7); // Get last 7 days
    res.json(sleepEntries);
  } catch (err) {
    console.error('Error fetching sleep entries:', err);
    res.status(500).json({ message: 'Failed to fetch sleep entries' });
  }
});

// Add a new sleep entry
router.post('/', auth, async (req, res) => {
  try {
    const { date, hours, quality, cycles } = req.body;
    console.log('Received sleep entry:', { date, hours, quality, cycles, userId: req.user.id });

    // Validate input
    if (!date || !hours || !quality || cycles === undefined) {
      console.log('Missing required fields:', { date, hours, quality, cycles });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['date', 'hours', 'quality', 'cycles'],
        received: req.body
      });
    }

    // Validate date format
    const entryDate = new Date(date);
    if (isNaN(entryDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Parse and validate hours
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24) {
      return res.status(400).json({ message: 'Hours must be between 0 and 24' });
    }

    // Parse and validate cycles
    const parsedCycles = parseInt(cycles);
    if (isNaN(parsedCycles) || parsedCycles < 0 || parsedCycles > 10) {
      return res.status(400).json({ message: 'Cycles must be between 0 and 10' });
    }

    // Validate quality
    if (!['Light', 'Good', 'Optimal'].includes(quality)) {
      return res.status(400).json({ message: 'Quality must be Light, Good, or Optimal' });
    }

    // Format date to start of day for consistent storage
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    console.log('Attempting to save/update entry with:', {
      user: req.user.id,
      date: formattedDate.toISOString(),
      hours: parsedHours,
      quality,
      cycles: parsedCycles
    });

    // Try to find an existing entry first
    let sleepEntry = await Sleep.findOne({
      user: req.user.id,
      date: formattedDate
    });

    if (sleepEntry) {
      // Update existing entry
      console.log('Updating existing entry:', sleepEntry._id);
      sleepEntry.hours = parsedHours;
      sleepEntry.quality = quality;
      sleepEntry.cycles = parsedCycles;
      await sleepEntry.save();
    } else {
      // Create new entry
      console.log('Creating new entry');
      sleepEntry = new Sleep({
        user: req.user.id,
        date: formattedDate,
        hours: parsedHours,
        quality,
        cycles: parsedCycles
      });
      await sleepEntry.save();
    }

    console.log('Successfully saved/updated entry:', sleepEntry);
    res.status(201).json(sleepEntry);
  } catch (err) {
    console.error('Error saving sleep entry:', {
      error: err,
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });

    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid sleep data',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    res.status(500).json({ 
      message: 'Failed to save sleep entry',
      error: err.message
    });
  }
});

// Update a sleep entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, hours, quality, cycles } = req.body;
    
    // Validate input
    if (!date || !hours || !quality || cycles === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['date', 'hours', 'quality', 'cycles'],
        received: req.body
      });
    }

    const updatedEntry = await Sleep.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { 
        date,
        hours: parseFloat(hours),
        quality,
        cycles: parseInt(cycles)
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Sleep entry not found' });
    }
    
    res.json(updatedEntry);
  } catch (err) {
    console.error('Error updating sleep entry:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid sleep data',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Failed to update sleep entry' });
  }
});

// Delete a sleep entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEntry = await Sleep.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Sleep entry not found' });
    }
    
    res.json({ message: 'Sleep entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting sleep entry:', err);
    res.status(500).json({ message: 'Failed to delete sleep entry' });
  }
});

module.exports = router; 