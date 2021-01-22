const express = require('express')
const router = express.Router()
const CommunityController = require('../controllers/communityController')

router.post('/', CommunityController.addCommunity)
router.get('/', CommunityController.showCommunity)
router.get('/:id', CommunityController.findById)
router.delete('/', CommunityController.deleteCommunity)


module.exports = router