const express = require('express');
const router = express.Router();
const {
    getAllocatedProjects,
    getWeeklyAllocationView
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes need authentication
router.use(protect);

router.get('/projects', getAllocatedProjects);
router.get('/allocations/weekly', getWeeklyAllocationView);

module.exports = router;
