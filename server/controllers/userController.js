const Allocation = require('../models/Allocation');

// @desc    Get all projects allocated to user
// @route   GET /api/user/projects
// @access  Private
const getAllocatedProjects = async (req, res) => {
    try {
        const allocations = await Allocation.find({ userId: req.user._id })
            .populate('projectId', 'projectName projectCode description startDate endDate status');
        
        // Extract project details alongside allocation details
        const assignedProjects = allocations.map(alloc => {
            return {
                allocationId: alloc._id,
                allocationPercentage: alloc.allocationPercentage,
                allocationStartDate: alloc.startDate,
                allocationEndDate: alloc.endDate,
                project: alloc.projectId
            };
        });

        res.json(assignedProjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get 4-week allocation view for user
// @route   GET /api/user/allocations/weekly
// @access  Private
const getWeeklyAllocationView = async (req, res) => {
    try {
        const allocations = await Allocation.find({ userId: req.user._id })
            .populate('projectId', 'projectName projectCode');

        // We will define "Week 1" as starting from "today"
        // Let's create an array of 4 objects representing the start/end of the continuous 4 upcoming weeks.
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize today's date

        const fourWeeks = [];
        for (let i = 0; i < 4; i++) {
            const wStart = new Date(today);
            wStart.setDate(wStart.getDate() + (i * 7));
            
            const wEnd = new Date(wStart);
            wEnd.setDate(wEnd.getDate() + 6);
            wEnd.setHours(23, 59, 59, 999);
            
            fourWeeks.push({ start: wStart, end: wEnd });
        }

        const weeklyView = allocations.map(alloc => {
            const allocStart = new Date(alloc.startDate);
            allocStart.setHours(0, 0, 0, 0);
            
            const allocEnd = new Date(alloc.endDate);
            allocEnd.setHours(23, 59, 59, 999);
            
            const weeksResult = {};
            
            // Generate standard week labels
            fourWeeks.forEach((week, index) => {
                // Determine if there is any overlap between [allocStart, allocEnd] and [week.start, week.end]
                const overlaps = (allocStart <= week.end) && (allocEnd >= week.start);
                
                // If it overlaps, the user has allocation that week. Otherwise, it's 0%.
                const percent = overlaps ? alloc.allocationPercentage : 0;
                weeksResult[`Week ${index + 1}`] = `${percent}%`;
            });
            
            weeksResult["startDate"] = alloc.startDate;
            weeksResult["endDate"] = alloc.endDate;

            return {
                projectId: alloc.projectId._id,
                projectName: alloc.projectId.projectName,
                projectCode: alloc.projectId.projectCode,
                weeklyAllocation: weeksResult
            };
        });

        res.json(weeklyView);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllocatedProjects,
    getWeeklyAllocationView
};
