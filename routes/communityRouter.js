const express = require('express')
const router = express.Router()
const CommunityController = require('../controllers/communityController')
const AuthorizationCreateJoin = require('../middlewares/AuthorizationCreateJoin')
const AuthorizationApproveMember = require('../middlewares/AuthorizeApproveMember')
const AuthorizationCreateEvent = require('../middlewares/AuthorizationCreateEvent')

router.post('/', AuthorizationCreateJoin ,CommunityController.addCommunity)
// router.get('/', CommunityController.showCommunity)
router.get('/', CommunityController.findOne)
// router.delete('/:communityId', CommunityController.deleteCommunity)
router.patch('/:communityId', AuthorizationCreateJoin ,CommunityController.joinCommunity)
router.put('/approval/:userId', AuthorizationApproveMember,CommunityController.approveWaitingList)
router.patch('/approval/:userId', AuthorizationApproveMember,CommunityController.rejectWaiting)
router.post('/events/', AuthorizationCreateEvent,CommunityController.createEvent)
router.delete('/events/:eventId', AuthorizationCreateEvent,CommunityController.deleteEvent)


module.exports = router