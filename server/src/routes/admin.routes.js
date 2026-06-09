const express = require('express');
const router  = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { requireAdmin }      = require('../middleware/requireAdmin');
const { apiLimiter }        = require('../middleware/rateLimiter');
const {
  getPlatformStats,
  getAllUsers,
  getAllGroups,
  getGroupDetail,
  getUserDetail,
} = require('../controllers/admin.controller');

router.use(authenticateToken);
router.use(apiLimiter);
router.use(requireAdmin);

router.get('/stats',        getPlatformStats);
router.get('/users',        getAllUsers);
router.get('/users/:id',    getUserDetail);
router.get('/groups',       getAllGroups);
router.get('/groups/:id',   getGroupDetail);

module.exports = router;
