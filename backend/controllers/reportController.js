const Ticket = require('../models/Ticket');
const mongoose = require('mongoose');

const getTicketReports = async (req, res) => {
  try {
    const { from, to, status, assignedTo, createdBy, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Date range filter
    if (from || to) {
  filter.createdAt = {};
  if (from) {
    filter.createdAt.$gte = new Date(from);
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    filter.createdAt.$lte = toDate;
  }
}
    // Status filter
    if (status) {
      filter.status = status;
    }

    // Filter by technician
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      filter.assignedTo = assignedTo;
    }

    // Filter by staff (creator)
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.createdBy = createdBy;
    }

    // Pagination & Sorting
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const total = await Ticket.countDocuments(filter);

    const tickets = await Ticket.find(filter)
      .populate('assignedTo', 'name email') // Technician info
      .populate('createdBy', 'name email')   // Staff info
      .sort({ createdAt: -1 })                // Newest first
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      tickets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

module.exports = { getTicketReports };
