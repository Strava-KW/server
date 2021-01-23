const express = require('express')
const router = express.Router()
const CommunityController = require('../controllers/communityController')
const AuthorizationCreateJoin = require('../middlewares/AuthorizationCreateJoin')
const AuthorizationApproveMember = require('../middlewares/AuthorizeApproveMember')
const AuthorizationCreateEvent = require('../middlewares/AuthorizationCreateEvent')

router.post('/', AuthorizationCreateJoin ,CommunityController.addCommunity)
router.get('/', CommunityController.showCommunity)
// router.get('/:id', CommunityController.findById)
router.delete('/:communityId', CommunityController.deleteCommunity)
router.patch('/:communityId', AuthorizationCreateJoin ,CommunityController.joinCommunity)
router.put('/approval/:userId', AuthorizationApproveMember,CommunityController.approveWaitingList)
router.patch('/approval/:userId', AuthorizationApproveMember,CommunityController.rejectWaiting)
router.post('/events/', CommunityController.createEvent)


module.exports = router