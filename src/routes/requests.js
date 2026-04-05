const express = require('express');
const { userAuth } = require('../middlewares/auth');
const requestRouter = express.Router();
const { sendConnectionRequest, reviewConnectionRequest } = require('../controllers/requestsController');

requestRouter.post('/request/send/:status/:toUserId', userAuth, sendConnectionRequest)
requestRouter.post('/request/respond/:status/:requestId', userAuth, reviewConnectionRequest)


module.exports = requestRouter;