const CustomerComplaint = require('../models/CustomerComplaint');

//  Create new complaint
const createComplaint = async (req, res) => {
  try {
    const complaint = await CustomerComplaint.create(req.body);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: 'Failed to submit complaint', error: err.message });
  }
};

//  Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await CustomerComplaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

//  Get single complaint
const getComplaintById = async (req, res) => {
  try {
    const complaint = await CustomerComplaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.status(200).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching complaint' });
  }
};


const getCustomerEmailsFromComplaints = async (req, res) => {
  try {
    const emails = await CustomerComplaint.distinct("email");
    res.status(200).json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Server error while fetching customer emails" });
  }
};
const getCustomerDetailsByEmail = async (req, res) => {
  try {
    const email = req.params.email;

    const complaint = await CustomerComplaint.findOne({ email });

    if (!complaint) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({
      name: complaint.name,
      phone: complaint.phone,
    });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({ message: "Server error while fetching customer details" });
  }
};

const updateComplaintStatus = async (req, res) => {
    try {
      const complaint = await CustomerComplaint.findById(req.params.id);
  
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
  
      // Only staff or admin can update
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      complaint.status = req.body.status || complaint.status;
      const updatedComplaint = await complaint.save();
  
      res.status(200).json(updatedComplaint);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update complaint status' });
    }
  };

  
const deleteComplaint = async (req, res) => {
    try {
      const complaint = await CustomerComplaint.findById(req.params.id);
  
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
  
      // Only staff or admin allowed
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      await complaint.deleteOne();
      res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete complaint' });
    }
  };

module.exports = { createComplaint, getAllComplaints, getComplaintById,
   updateComplaintStatus ,deleteComplaint, getCustomerEmailsFromComplaints,getCustomerDetailsByEmail };
