const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireOrganiser } = require('../middleware/requireOrganiser');
const groupsController = require('../controllers/groups.controller');

router.use(authenticateToken);

router.post('/', groupsController.createGroup);
router.get('/my', groupsController.getMyGroups);
router.post('/join', groupsController.joinGroup);

// Need to define :id param specifically and place it after /my and /join
router.get('/:id', groupsController.getGroupById);
router.post('/:id/start', requireOrganiser, groupsController.startGroup);
router.get('/:id/schedule', groupsController.getGroupSchedule);
router.get('/:id/members', groupsController.getGroupMembers);

module.exports = router;
