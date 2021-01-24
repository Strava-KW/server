const express = require('express')
const router = express.Router()
const UserRouter = require('./userRouter')
const CommunityRouter = require('./communityRouter')
const Authentication = require('../middlewares/Authentication')
const UserController = require('../controllers/userController')

router.use('/users', UserRouter)

router.use(Authentication)
router.get('/profile',)
router.use('/community', CommunityRouter)

module.exports = router