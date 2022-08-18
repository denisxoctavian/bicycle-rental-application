const express = require("express");
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login',authController.login);
router.post('/details',authController.details);
router.post('/saveaddress',authController.saveaddress);
router.post('/locations',authController.locations);
router.post('/vehicles',authController.vehicles);
router.post('/tripprogress',authController.tripprogress);
router.post('/tripfinal',authController.tripfinal);
router.post('/pay',authController.pay);
router.post('/history',authController.history);


module.exports = router;