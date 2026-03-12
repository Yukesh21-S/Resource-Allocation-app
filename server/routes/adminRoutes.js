const express = require('express');
const router = express.Router();
const {
    createProject,
    getAllProjects,
    allocateResource,
    getResourceUtilization,
    getAvailableResources,
    getOverallocatedUsers,
    getProjectResourceSummary
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// All admin routes need both authentication and admin role
router.use(protect, admin);

router.route('/projects')
    .post(createProject)
    .get(getAllProjects);

router.post('/projects/:projectId/allocate', allocateResource);

router.get('/reports/utilization', getResourceUtilization);
router.get('/reports/available', getAvailableResources);
router.get('/reports/overallocated', getOverallocatedUsers);
router.get('/reports/projects-summary', getProjectResourceSummary);

module.exports = router;
