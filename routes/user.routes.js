const express = require('express');
const { loginUser } = require('../controller/user.controller');
const router = express.Router();

router.route('/')
    .post(loginUser)

module.exports = router