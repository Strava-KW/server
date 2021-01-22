const express = require('express')
const router = express.Router()
const UserRouter = require('./userRouter')
const CommunityRouter = require('./communityRouter')
const Authentication = require('../middlewares/Authentication')

router.use('/', UserRouter)

router.use(Authentication)
router.use('/community', CommunityRouter)

module.exports = router