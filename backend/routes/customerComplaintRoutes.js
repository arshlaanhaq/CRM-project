const express = require('express');
const router = express.Router();
const { createComplaint,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    deleteComplaint,
    getCustomerEmailsFromComplaints,
    getCustomerDetailsByEmail } = require('../controllers/customerComplaintController');
const { protect, isAdminOrStaff, isTechnician } = require('../middleware/authMiddleware');

//  POST complaint (Public or protected, your choice)
router.post('/', createComplaint);

//  GET all complaints (Staff/Admin only)
router.get('/', protect, isAdminOrStaff, getAllComplaints);


//  GET customer emails from complaints (Staff/Admin only)
router.get("/emails", protect, isAdminOrStaff, getCustomerEmailsFromComplaints);
router.get('/customer-details/:email', getCustomerDetailsByEmail);



//  GET single complaint by ID
router.get('/:id', protect, isAdminOrStaff ,isTechnician,getComplaintById);
// DELETE route
router.delete('/:id', protect, isAdminOrStaff, deleteComplaint);

// PUT update complaint status (Staff/Admin only)
router.put('/:id/status', protect, isAdminOrStaff, updateComplaintStatus);


module.exports = router;
