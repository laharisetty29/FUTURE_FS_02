const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/stats - Get dashboard stats
router.get('/', async (req, res) => {
  try {
    const [total, newLeads, contacted, converted, lost] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'new' }),
      Lead.countDocuments({ status: 'contacted' }),
      Lead.countDocuments({ status: 'converted' }),
      Lead.countDocuments({ status: 'lost' })
    ]);

    // Leads by source
    const sourceStats = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Leads per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyStats = await Lead.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        total, newLeads, contacted, converted, lost,
        conversionRate,
        sourceStats,
        dailyStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
