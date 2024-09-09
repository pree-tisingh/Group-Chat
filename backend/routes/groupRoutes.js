const express = require('express');
const router = express.Router();
const groupController = require('../controllers/GroupController');

router.post('/', groupController.createGroup);
router.post('/:groupId/invite', groupController.inviteUser);
router.put('/:groupId/make-admin/:userId', groupController.makeAdmin);
router.delete('/:groupId/remove/:userId', groupController.removeUser); 
router.get('/user/:userId/groups', groupController.getUserGroups);
router.post('/:groupId/messages', groupController.sendMessage);
router.get('/:groupId/messages', groupController.getGroupMessages);
router.get('/search-users', groupController.searchUsers);
router.get('/:groupId/members', groupController.getGroupMembers);

module.exports = router;
