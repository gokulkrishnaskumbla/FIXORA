const express = require('express');
const { register, login, logout, getAllUsers } = require('../../Controllers/userController');
const { authAdmin } = require('../../Middlewares/auth');

const router = express.Router();


router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/all-users', authAdmin, getAllUsers);

module.exports = router;
