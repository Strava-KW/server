const express = require('express')
const router = express.Router()
const CommunityController = require('../controllers/communityController')
const AuthorizationCreateJoin = require('../middlewares/AuthorizationCreateJoin')

router.post('/', AuthorizationCreateJoin ,CommunityController.addCommunity)
router.get('/', CommunityController.showCommunity)
// router.get('/:id', CommunityController.findById)
router.delete('/:communityId', CommunityController.deleteCommunity)
router.patch('/:communityId', AuthorizationCreateJoin ,CommunityController.joinCommunity)
router.patch('/:userId', CommunityController.approveWaitingList)


module.exports = router