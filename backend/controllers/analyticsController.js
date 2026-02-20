import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

export const getAnalytics = async (req, res) => {
    try {
        const totalComplaints = await Complaint.countDocuments();
        const totalResolved = await Complaint.countDocuments({ status: 'resolved' });
        const totalClosed = await Complaint.countDocuments({ status: 'closed' });
        const totalPending = totalComplaints - (totalResolved + totalClosed);

        // Average Resolution Time (for resolved/closed complaints)
        const resolutionStats = await Complaint.aggregate([
            { $match: { status: { $in: ['resolved', 'closed'] } } },
            {
                $project: {
                    duration: { $subtract: ['$resolvedAt', '$createdAt'] },
                },
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' },
                },
            },
        ]);
        const avgResolutionTime = resolutionStats[0]?.avgDuration || 0;

        // Agent Performance
        const agentPerformance = await Complaint.aggregate([
            { $match: { assignedTo: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$assignedTo',
                    totalAssigned: { $sum: 1 },
                    resolvedCount: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
                        },
                    },
                    avgResolutionTime: {
                        $avg: {
                            $cond: [
                                { $in: ['$status', ['resolved', 'closed']] },
                                { $subtract: ['$resolvedAt', '$createdAt'] },
                                null,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'agent',
                },
            },
            { $unwind: '$agent' },
            {
                $project: {
                    agentName: '$agent.fullName',
                    totalAssigned: 1,
                    resolvedCount: 1,
                    avgResolutionTime: 1,
                },
            },
        ]);

        // Monthly Trends (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = await Complaint.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        res.json({
            totalComplaints,
            resolvedPercentage: totalComplaints ? ((totalResolved + totalClosed) / totalComplaints) * 100 : 0,
            pendingPercentage: totalComplaints ? (totalPending / totalComplaints) * 100 : 0,
            avgResolutionTime, // in milliseconds
            agentPerformance,
            monthlyTrends,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
