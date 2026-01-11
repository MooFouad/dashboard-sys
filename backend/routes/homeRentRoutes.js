const express = require('express');
const router = express.Router();
const HomeRent = require('../models/HomeRent');
const mockDataService = require('../services/mockDataService');
const { AppError } = require('../middleware/errorHandler');
const validate = require('../middleware/validate');
const {
  createHomeRentValidator,
  updateHomeRentValidator,
  deleteHomeRentValidator
} = require('../validators/homeRentValidator');

// GET all home rents with pagination
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 25, search } = req.query;

    // Use mock data in demo mode
    if (process.env.USE_MOCK_DATA === 'true') {
      let records = await mockDataService.find('homeRents');

      // Simple search filter for mock data
      if (search) {
        const searchLower = search.toLowerCase();
        records = records.filter(r =>
          (r.name && r.name.toLowerCase().includes(searchLower)) ||
          (r.location && r.location.toLowerCase().includes(searchLower)) ||
          (r.contractNumber && r.contractNumber.toLowerCase().includes(searchLower))
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
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { contractNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const homeRents = await HomeRent.find(query)
      .sort({ contractStartingDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean()
      .maxTimeMS(10000)
      .exec();

    const total = await HomeRent.countDocuments(query).maxTimeMS(5000);

    res.json({
      success: true,
      data: homeRents,
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
      count = await mockDataService.count('homeRents');
    } else {
      count = await HomeRent.countDocuments();
    }
    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
});

// GET single home rent
router.get('/:id', async (req, res, next) => {
  try {
    const rent = await HomeRent.findById(req.params.id);
    if (!rent) {
      return next(new AppError('Home rent not found', 404));
    }
    res.json({
      success: true,
      data: rent
    });
  } catch (error) {
    next(error);
  }
});

// CREATE home rent
router.post('/', createHomeRentValidator, validate, async (req, res, next) => {
  try {
    // Use mock data in demo mode
    if (process.env.USE_MOCK_DATA === 'true') {
      const newRent = await mockDataService.create('homeRents', req.body);
      return res.status(201).json({
        success: true,
        message: 'Home rent created successfully',
        data: newRent
      });
    }

    const homeRent = new HomeRent(req.body);
    await homeRent.save();
    res.status(201).json({
      success: true,
      message: 'Home rent created successfully',
      data: homeRent
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE home rent
router.put('/:id', updateHomeRentValidator, validate, async (req, res, next) => {
  try {
    // Use mock data in demo mode
    if (process.env.USE_MOCK_DATA === 'true') {
      const updatedRent = await mockDataService.update('homeRents', req.params.id, req.body);
      if (!updatedRent) {
        return next(new AppError('Home rent not found', 404));
      }
      return res.json({
        success: true,
        message: 'Home rent updated successfully',
        data: updatedRent
      });
    }

    const existingRent = await HomeRent.findById(req.params.id);
    if (!existingRent) {
      return next(new AppError('Home rent not found', 404));
    }

    const rent = await HomeRent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, _id: req.params.id },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Home rent updated successfully',
      data: rent
    });
  } catch (error) {
    next(error);
  }
});

// DELETE home rent
router.delete('/:id', deleteHomeRentValidator, validate, async (req, res, next) => {
  try {
    // Use mock data in demo mode
    if (process.env.USE_MOCK_DATA === 'true') {
      const deleted = await mockDataService.delete('homeRents', req.params.id);
      if (!deleted) {
        return next(new AppError('Home rent not found', 404));
      }
      return res.json({
        success: true,
        message: 'Home rent deleted successfully',
        data: { id: req.params.id }
      });
    }

    const result = await HomeRent.findByIdAndDelete(req.params.id);
    if (!result) {
      return next(new AppError('Home rent not found', 404));
    }
    res.json({
      success: true,
      message: 'Home rent deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;