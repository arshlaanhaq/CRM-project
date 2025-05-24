const jwt = require('jsonwebtoken');
const User = require('../models/User');

    const protect = async (req, res, next) => {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        try {
          token = req.headers.authorization.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = await User.findById(decoded.id).select('-password');

          // console.log(' Authenticated user:', req.user);

          next();
        } catch (error) {
          res.status(401).json({ message: 'Not authorized, token failed' });
        }
      }

      if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
      }
    };


const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log('Socket token:', token);

    if (!token) {
      console.log('No token provided');
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found');
      return next(new Error('Authentication failed'));
    }

    socket.user = user;
    console.log('User authenticated:', user.name);
    next();
  } catch (err) {
    console.log('Token error:', err.message);
    next(new Error('Invalid token'));
  }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Admins only' });
    }
  };

const isTechnician = (req, res, next) => {
    if (req.user && req.user.role === 'technician') {
      next();
    } else {
      res.status(403).json({ message: 'Technician access only' });
    }
  };
 
  const isAdminOrStaff = (req, res, next) => {
    // console.log(' Role check:', req.user?.role);
  
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as admin/staff' });
    }
  };
  


const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403);
    throw new Error('Customer Access Only');
  }
};

const isStaff = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    res.status(403).json({ message: 'Staff access only' });
  }
};






// const isTechnicianOrAdmin = (req, res, next) => {
//   const role = req.user.role;
//   if (role === 'technician' || role === 'admin') {
//     return next();
//   }
//   return res.status(403).json({ message: 'Technician or Admin access only' });
// };
// const isTechnicianOrstaff = (req, res, next) => {
//   const role = req.user.role;
//   if (role === 'technician' || role === 'staff') {
//     return next();
//   }
//   return res.status(403).json({ message: 'Technician or Admin access only' });
// };
const isAdminOrStaffOrTechnician = (req, res, next) => {
  const role = req.user?.role;

  if (!role) {
    return res.status(401).json({ message: 'Unauthorized: No role found' });
  }

  if (['admin', 'staff', 'technician'].includes(role)) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied: Admin, Staff, Customer, or Technician only' });
};

module.exports = {
  protect,
  isAdmin,
  isTechnician,
  isAdminOrStaff,
  isCustomer,
  isStaff,
  isAdminOrStaffOrTechnician,
  socketAuth
  // isTechnicianOrAdmin,
  // isTechnicianOrstaff,
 
};

  
