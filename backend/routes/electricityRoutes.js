const express = require('express');
const router = express.Router();
const Electricity = require('../models/Electricity');
const mockDataService = require('../services/mockDataService');
const { AppError } = require('../middleware/errorHandler');
const validate = require('../middleware/validate');
const {
  createElectricityValidator,
  updateElectricityValidator,
  deleteElectricityValidator
} = require('../validators/electricityValidator');

// GET all electricity bills with pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 25, search } = req.query;

    // Use mock data in demo mode
    if (process.env.USE_MOCK_DATA === 'true') {
      let records = await mockDataService.find('electricity');

      // Simple search filter for mock data
      if (search) {
        const searchLower = search.toLowerCase();
        records = records.filter(r =>
          (r.accountNumber && r.accountNumber.toLowerCase().includes(searchLower)) ||
          (r.location && r.location.toLowerCase().includes(searchLower)) ||
          (r.meterNumber && r.meterNumber.toLowerCase().includes(searchLower))
        );
      }

      const total = records.length;
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const paginatedRecords = records.slice(startIndex, startIndex + parseInt(limit));

      return res.json({
        success: true,
        data: paginatedRecords,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

    // Original MongoDB logic
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { accountNumber: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { meterNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const bills = await Electricity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean()
      .maxTimeMS(10000)
      .exec();

    const total = await Electricity.countDocuments(query).maxTimeMS(5000);

    res.json({
      success: true,
      data: bills,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET count (MUST be before /:id to avoid route matching conflict)
router.get('/count/total', async (req, res, next) => {
  try {
    let count;
    if (process.env.USE_MOCK_DATA === 'true') {
      count = await mockDataService.count('electricity');
    } else {
      count = await Electricity.countDocuments();
    }
    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
});

// GET single electricity bill
router.get('/:id', async (req, res, next) => {
  try {
    const bill = await Electricity.findById(req.params.id);
    if (!bill) {
      return next(new AppError('Electricity bill not found', 404));
    }
    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// CREATE electricity bill
router.post('/', createElectricityValidator, validate, async (req, res, next) => {
  try {
    // Auto-calculate consumption if not provided
    if (!req.body.consumption && req.body.currentReading && req.body.previousReading) {
      req.body.consumption = req.body.currentReading - req.body.previousReading;
    }

    // Check consumption alert
    if (req.body.alertThreshold && req.body.consumption > req.body.alertThreshold) {
      req.body.consumptionAlert = true;
    }

    const bill = new Electricity(req.body);
    await bill.save();
    res.status(201).json({
      success: true,
      message: 'Electricity bill created successfully',
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE electricity bill
router.put('/:id', updateElectricityValidator, validate, async (req, res, next) => {
  try {
    // Auto-calculate consumption if readings are updated
    if (req.body.currentReading && req.body.previousReading) {
      req.body.consumption = req.body.currentReading - req.body.previousReading;
    }

    // Check consumption alert
    if (req.body.alertThreshold && req.body.consumption > req.body.alertThreshold) {
      req.body.consumptionAlert = true;
    } else {
      req.body.consumptionAlert = false;
    }

    const bill = await Electricity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bill) {
      return next(new AppError('Electricity bill not found', 404));
    }

    res.json({
      success: true,
      message: 'Electricity bill updated successfully',
      data: bill
    });
  } catch (error) {
    next(error);
  }
});

// DELETE electricity bill
router.delete('/:id', deleteElectricityValidator, validate, async (req, res, next) => {
  try {
    const bill = await Electricity.findByIdAndDelete(req.params.id);
    if (!bill) {
      return next(new AppError('Electricity bill not found', 404));
    }
    res.json({
      success: true,
      message: 'Electricity bill deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;