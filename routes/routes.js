const express = require('express')

const userController = require('../controllers/userController')

const router = express.Router()

router.post('/user/signup',userController.signUp)

router.post('/user/logIn',userController.logIn)

//completed till here


module.exports = router