const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const cyclesController = require('../controllers/cycles.controller');

router.use(authenticateToken);

router.get('/group/:groupId', cyclesController.getCyclesByGroup);
router.get('/:id', cyclesController.getCycleById);
router.put('/:id/complete', cyclesController.completeCycle);

module.exports = router;
