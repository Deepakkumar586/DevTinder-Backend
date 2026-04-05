const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { userRecievedConnection,userConnections,userFeed } = require('../controllers/userController');
const userRouter = express.Router()

userRouter.get('/user/requests/recieved', userAuth, userRecievedConnection)
userRouter.get('/user/connections', userAuth, userConnections)
userRouter.get('/feed', userAuth, userFeed)

module.exports = userRouter;