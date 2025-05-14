const express = require('express');
const {
  register, login, deleteUser, getAllTechnicians,
  getAllStaff, registerCustomer, getTechnicianById,
  getStaffById, getAllCustomers, getCustomerById,
  updateCustomerProfile, updateTechnicianProfile, updateStaffProfile,
  getCustomerProfile,getTechnicianProfile, getStaffProfile,
  getAdminProfile, updateAdminProfile,forgotPassword,resetPassword
} = require('../controllers/authController');

const {
  protect, isAdmin, isAdminOrStaff, isCustomer, isTechnician, isStaff
} = require('../middleware/authMiddleware');

const router = express.Router();

//  Public routes
// router.post('/register-customer', registerCustomer);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


//  Staff/Admin shared routes
// router.get('/customers', protect, isAdminOrStaff, getAllCustomers);
// router.get('/customers/:id', protect, isAdminOrStaff, getCustomerById);
router.get('/technicians', protect, isAdminOrStaff, getAllTechnicians);
router.get('/technicians/:id', protect, isAdminOrStaff, getTechnicianById);


// //  Customer-only routes
// router.get('/customer/profile', protect, isCustomer, getCustomerProfile);
// router.put('/customer/update-profile', protect, isCustomer, updateCustomerProfile);

// Technician-only routes
router.get('/technician/profile', protect, isTechnician, getTechnicianProfile);
router.put('/technician/update-profile', protect, isTechnician, updateTechnicianProfile);

// Staff-only routes
router.get('/staff/profile', protect, isStaff, getStaffProfile);
router.put('/staff/update-profile', protect, isStaff, updateStaffProfile);


//  Admin-only routes
router.post('/register', protect, isAdminOrStaff, register);
router.get('/staff', protect, isAdmin, getAllStaff);
router.get('/staff/:id', protect, isAdmin, getStaffById);
router.delete('/:id', protect, isAdmin, deleteUser);
router.get('/admin/profile', protect, getAdminProfile);
router.put('/admin/update-profile', protect, updateAdminProfile);
module.exports = router;
