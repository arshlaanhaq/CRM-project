const express = require('express');
const router = express.Router();
const { getTicketReports } = require('../controllers/reportController');
const { protect ,isAdminOrStaff} = require('../middleware/authMiddleware'); 

// GET /api/reports?from=2024-01-01&to=2024-01-31&status=open&assignedTo=techId&createdBy=staffId&page=2&limit=5
router.get('/', protect,isAdminOrStaff, getTicketReports);

module.exports = router;
