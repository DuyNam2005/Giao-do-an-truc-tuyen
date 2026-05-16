const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const controllerPreview = require('../controllers/preview.controller');

router.post('/create', authUser, asyncHandler(controllerPreview.createPreview));
router.get('/get-by-user', authUser, asyncHandler(controllerPreview.getPreviewByUser));
router.post('/update', authUser, asyncHandler(controllerPreview.updatePreview));
router.post('/delete', authUser, asyncHandler(controllerPreview.deletePreview));

module.exports = router;
