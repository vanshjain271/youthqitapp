/**
 * Banner Routes - MVP (Public)
 */

const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/banner.controller');

router.get('/', BannerController.getActiveBanners);
router.post('/:bannerId/view', BannerController.trackView);
router.post('/:bannerId/click', BannerController.trackClick);

module.exports = router;