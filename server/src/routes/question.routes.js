const express = require('express');
const router = express.Router();

const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

const controllerQuestion = require('../controllers/question.controller');

router.post('/create', authUser, asyncHandler(controllerQuestion.createQuestion));
router.get('/all', asyncHandler(controllerQuestion.getAllQuestion));
router.post('/answer', authAdmin, asyncHandler(controllerQuestion.answerQuestion));
router.post('/close', authAdmin, asyncHandler(controllerQuestion.closeQuestion));

module.exports = router;
