const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const contributionsController = require('../controllers/contributions.controller');

router.use(authenticateToken);

// Custom check for POST because we need body.groupId to check organiser
// The requireOrganiser middleware looks at req.body.groupId
const { requireOrganiser } = require('../middleware/requireOrganiser');

router.post('/', requireOrganiser, contributionsController.createContribution);
router.get('/group/:groupId', contributionsController.getGroupContributions);
router.get('/my', contributionsController.getMyContributions);

// Note: DELETE /:id handles organiser verification internally to avoid middleware param conflicts
router.delete('/:id', contributionsController.deleteContribution);

module.exports = router;