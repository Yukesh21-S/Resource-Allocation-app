const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/admin/projects
// @access  Private/Admin
const createProject = async (req, res) => {
    try {
        const { projectName, projectCode, description, startDate, endDate } = req.body;

        if (!projectName || !projectCode || !startDate || !endDate) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const projectExists = await Project.findOne({ projectCode });
        if (projectExists) {
            return res.status(400).json({ message: 'Project code already exists' });
        }

        const project = await Project.create({
            projectName,
            projectCode,
            description,
            startDate,
            endDate,
            createdBy: req.user._id,
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private/Admin
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Allocate user(s) to a project
// @route   POST /api/admin/projects/:id/allocate
// @access  Private/Admin
const allocateResource = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, allocationPercentage, startDate, endDate } = req.body;

        // Note: The prompt mentioned "admin can specify multiple users to a single project".
        // It's often handled by sending an array or calling this endpoint multiple times.
        // We will handle a single allocation here, or multiple if an array is passed.
        // Let's assume the body contains an array of allocations to process them together, or a single one
        const allocations = Array.isArray(req.body) ? req.body : [req.body];

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // We fetch current total allocation for this project to check against Rule 1
        const existingProjectAllocations = await Allocation.find({ projectId });
        let totalProjectAllocation = existingProjectAllocations.reduce((acc, curr) => acc + curr.allocationPercentage, 0);

        const results = [];
        const errors = [];

        for (const alloc of allocations) {
            const allocEmpId = alloc.userId; // Based on prompt, admin passes employeeId
            const allocStart = new Date(alloc.startDate);
            const allocEnd = new Date(alloc.endDate);
            const percentage = Number(alloc.allocationPercentage);

            // Fetch the user using employeeId
            const user = await User.findOne({ employeeId: allocEmpId });
            if (!user) {
                errors.push({ employeeId: allocEmpId, message: 'User not found' });
                continue;
            }

            // --- Rule 3: Date Validation ---
            if (allocStart < project.startDate || allocEnd > project.endDate) {
                errors.push({ employeeId: allocEmpId, message: 'Allocation dates must be within project dates' });
                continue;
            }
            if (allocStart >= allocEnd) {
                errors.push({ employeeId: allocEmpId, message: 'Allocation start date must be before end date' });
                continue;
            }

            // --- Rule 1: Project Allocation Limit ---
            if (totalProjectAllocation + percentage > 100) {
                errors.push({ employeeId: allocEmpId, message: 'Project allocation limit exceeded (100%)' });
                continue;
            }

            // --- Rule 2: User Allocation Limit ---
            const existingUserAllocations = await Allocation.find({ userId: user._id });
            const totalUserAllocation = existingUserAllocations.reduce((acc, curr) => acc + curr.allocationPercentage, 0);
            
            if (totalUserAllocation + percentage > 100) {
                errors.push({ employeeId: allocEmpId, message: `User allocation limit exceeded. Current total: ${totalUserAllocation}%` });
                continue;
            }

            // Create Allocation
            const newAllocation = await Allocation.create({
                projectId,
                userId: user._id,
                allocationPercentage: percentage,
                startDate: allocStart,
                endDate: allocEnd,
                createdBy: req.user._id
            });

            totalProjectAllocation += percentage; // update running total
            results.push(newAllocation);
        }

        if (errors.length > 0 && results.length === 0) {
            return res.status(400).json({ message: 'Allocations failed', errors });
        }

        res.status(201).json({ 
            message: 'Allocations completed', 
            successes: results, 
            errors: errors.length > 0 ? errors : undefined 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get resource utilization (percentage per user)
// @route   GET /api/admin/reports/utilization
// @access  Private/Admin
const getResourceUtilization = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }, 'username employeeId');
        const allocations = await Allocation.find({});

        const utilization = users.map(user => {
            const userAllocs = allocations.filter(a => a.userId.toString() === user._id.toString());
            const totalPercent = userAllocs.reduce((acc, curr) => acc + curr.allocationPercentage, 0);
            return {
                userId: user._id,
                username: user.username,
                employeeId: user.employeeId,
                totalAllocationPercentage: totalPercent
            };
        });

        res.json(utilization);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available resources (< 100%)
// @route   GET /api/admin/reports/available
// @access  Private/Admin
const getAvailableResources = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }, 'username employeeId');
        const allocations = await Allocation.find({});

        const available = users.map(user => {
            const userAllocs = allocations.filter(a => a.userId.toString() === user._id.toString());
            const totalPercent = userAllocs.reduce((acc, curr) => acc + curr.allocationPercentage, 0);
            return {
                ...user.toObject(),
                totalAllocationPercentage: totalPercent
            };
        }).filter(u => u.totalAllocationPercentage < 100);

        res.json(available);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get overallocated users (> 100%)
// @route   GET /api/admin/reports/overallocated
// @access  Private/Admin
const getOverallocatedUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }, 'username employeeId');
        const allocations = await Allocation.find({});

        const overallocated = users.map(user => {
            const userAllocs = allocations.filter(a => a.userId.toString() === user._id.toString());
            const totalPercent = userAllocs.reduce((acc, curr) => acc + curr.allocationPercentage, 0);
            return {
                ...user.toObject(),
                totalAllocationPercentage: totalPercent
            };
        }).filter(u => u.totalAllocationPercentage > 100);

        res.json(overallocated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project resource summary
// @route   GET /api/admin/reports/projects-summary
// @access  Private/Admin
const getProjectResourceSummary = async (req, res) => {
    try {
        const projects = await Project.find({});
        const allocations = await Allocation.find({}).populate('userId', 'username employeeId');

        const summary = projects.map(proj => {
            const projAllocs = allocations.filter(a => a.projectId.toString() === proj._id.toString());
            const totalPercent = projAllocs.reduce((acc, curr) => acc + curr.allocationPercentage, 0);
            
            return {
                projectId: proj._id,
                projectName: proj.projectName,
                projectCode: proj.projectCode,
                totalAllocatedPercentage: totalPercent,
                remainingPercentage: 100 - totalPercent,
                assignedUsers: projAllocs.map(a => ({
                    userId: a.userId._id,
                    username: a.userId.username,
                    employeeId: a.userId.employeeId,
                    allocationPercentage: a.allocationPercentage
                }))
            };
        });

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    allocateResource,
    getResourceUtilization,
    getAvailableResources,
    getOverallocatedUsers,
    getProjectResourceSummary
};
