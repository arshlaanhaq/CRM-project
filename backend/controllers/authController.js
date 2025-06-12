const User = require('../models/User');
const Ticket = require('../models/Ticket');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmails');
const crypto = require("crypto");


// registerCustomer = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       phone,
//       address,
//       city,
//       state,
//       country,

//     } = req.body;

//     // Check if the user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the new user
//     const user = await User.create({
//       name, // Store the single name field
//       email,
//       password: hashedPassword,
//       phone,
//       address,
//       city,
//       state,
//       country,
//       role: 'customer', // fixed role
//     });

//     console.log("Registering customer:", req.body);

//     // Send the response back to the client
//     res.status(201).json({
//       message: 'Customer registered successfully. Please login to continue.',
//       user: {
//         _id: user._id,
//         name: user.name, // Send the name in the response
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('Error during customer registration:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };



// Forgot Password Handler
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ userId: user._id }, 'JWT_SECRET', { expiresIn: '1h' });

    const resetLink = `http://82.25.109.100:3000/reset-password/${token}`;
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Click the following link to reset your password: ${resetLink}`
    );

    res.status(200).json({ message: 'Reset link sent to your email' });

  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, 'JWT_SECRET');
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;  // Password will be hashed in pre-save hook
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};



const register = async (req, res) => {
  const { name, email, password, role, phone, address, city, state, country } = req.body;


  if (role !== 'technician' && role !== 'staff') {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    
    const user = new User({
  name,
  email,
  password,
  role,
  phone,
  address,
  city,
  state,
  country,
});

    await user.save(); 
    const loginlink = `https://crm-project-frontend-hazel.vercel.app/login`;
    await sendEmail(
      email,
      'Your account has been created',
      `Hello ${name},\n\nYour account has been created.\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password.\n${loginlink}\n\nThank you!`
    );

    res.status(201).json({
      message: 'User registered and email sent successfully',
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: 'User not found' });
 
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  // Generate JWT Token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.json({ token, user });
};


const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
const getCustomerById = async (req, res) => {
  const { id } = req.params;
  // console.log(id)

  try {
    const customer = await User.findById(id);

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getCustomerProfile = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id).select('-password');

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



//get technician
const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('-password');

    const updatedTechnicians = await Promise.all(
      technicians.map(async (tech) => {
        const ticketsAssigned = await Ticket.countDocuments({ assignedTo: tech._id });
        const ticketsResolved = await Ticket.countDocuments({ assignedTo: tech._id, status: 'resolved' });
        // console.log( ticketsResolved)

        return {
          ...tech.toObject(),
          ticketsAssigned,
          ticketsResolved,
        };
      })
    );

    res.status(200).json(updatedTechnicians);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch technicians' });
  }
};

const getTechnicianById = async (req, res) => {
  try {
    const technicianId = req.params.id;

    const technician = await User.findById(technicianId).select('-password');

    if (!technician || technician.role !== 'technician') {
      return res.status(404).json({ message: 'Technician not found' });
    }
    const assignedTickets = await Ticket.find({ assignedTo: technicianId });

    res.status(200).json({
      technician,
      assignedTickets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch technician details' });
  }
};
const getTechnicianProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.role !== 'technician') {
      return res.status(404).json({ message: 'Technician not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update customer profile
const updateCustomerProfile = async (req, res) => {
  await updateUserProfile(req, res);

};
// update technician profile 
const updateTechnicianProfile = async (req, res) => {
  await updateUserProfile(req, res);
};

// update staff profile
const updateStaffProfile = async (req, res) => {
  await updateUserProfile(req, res);
};


const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      country,
    } = req.body;

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check for email uniqueness
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Update other fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;

    
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        country: updatedUser.country,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



//  get staff-admin only
const getAllStaff = async (req, res) => {
  try {
    const supportStaff = await User.find({ role: 'staff' }).select('-password');
    res.status(200).json(supportStaff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch support staff' });
  }
};
const getStaffById = async (req, res) => {
  try {
    const staffId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID format" });
    }
    const staff = await User.findById(staffId).select("-password");
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Return the staff details if found
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff details:", error);
    res.status(500).json({ message: "Failed to fetch staff details" });
  }
};
const getStaffProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.role !== 'staff') {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if email is being updated and is unique
    if (req.body.email && req.body.email !== user.email) {
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update profile fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    
    if (req.body.password) {
      user.password = req.body.password; // will be hashed automatically in pre('save')
    }

    const updatedUser = await user.save();

    // Optional: remove password from response
    const { password, ...rest } = updatedUser.toObject();

    res.status(200).json(rest);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};


// Delete User- Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  register, login, deleteUser, getAllTechnicians, getAllStaff,
  getTechnicianById, getStaffById, getCustomerById, getAllCustomers, updateCustomerProfile,
   updateTechnicianProfile, updateStaffProfile,getCustomerProfile, getTechnicianProfile,getStaffProfile,
   updateAdminProfile,getAdminProfile,forgotPassword,resetPassword
};