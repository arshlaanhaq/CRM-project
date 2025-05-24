const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Complaint = require("../models/CustomerComplaint");
const sendEmail = require("../utils/sendEmails");

const getAllTickets = async (req, res) => {
  const { status, sort } = req.query;
  let query = {};

  if (status) {
    query.status = status;
  }
  let tickets = Ticket.find(query).populate("assignedTo createdBy");

  if (sort) {
    tickets = tickets.sort(sort);
  }
  const results = await tickets;
  res.status(200).json(results);
};
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");
    // console.log(ticket)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    //  Customer can view only their own ticket
    if (userRole === "customer" && ticket.customer._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this ticket" });
    }

    // Technician can view only assigned tickets
    if (
      userRole === "technician" &&
      ticket.assignedTo._id.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this ticket" });
    }

    // Staff and admin can view any ticket
    // updatedAt for showing the last update time
    const ticketData = {
      ...ticket.toObject(),
      updatedAt: ticket.updatedAt,
    };

    ticketData.history = ticket.history;

    res.json(ticketData);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ error: "Server error" });
  }
};
const createTicket = async (req, res) => {
  const { title, description, assignedTo, customer, priority } = req.body;
  const customerEmail = customer?.email;

  try {
    // console.log("customerEmail:", customerEmail);

    const complaint = await Complaint.findOne({
      email: customerEmail,
      status: "Pending",
    }).sort({ createdAt: -1 });

    // console.log("complaint", complaint);

    if (!complaint) {
      return res
        .status(404)
        .json({ message: "No pending complaint found for this customer" });
    }

    const ticket = await Ticket.create({
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      priority,
      customer: {
        _id: complaint._id,
        name: complaint.name,
        email: complaint.email,
        phone: complaint.phone,
      },
      customerComplaint: complaint._id,
    });

    complaint.status = "Ticket Created";
    await complaint.save();

    const technician = await User.findById(assignedTo);
    if (technician) {
      sendEmail(
        technician.email,
        `New Ticket Assigned: ${title}`,
        `Hi ${technician.name},\n\nYou have been assigned a new ticket:\n\nTitle: ${title}\nCustomer: ${complaint.name} (${complaint.email})\n\nThanks`
      ).catch((err) => console.error("Technician Email failed:", err));
    }

    sendEmail(
      complaint.email,
      `Ticket Created: ${title}`,
      `Hi ${complaint.name},\n\nYour ticket has been created successfully.\n\nThanks`
    ).catch((err) => console.error("Customer Email failed:", err));

    res.status(201).json(ticket);
  } catch (err) {
    console.error("Ticket creation failed:", err);
    res.status(500).json({ message: "Server error while creating ticket" });
  }
};

const getCustomerTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ "customer._id": req.user.id })
      .populate("assignedTo", "_id name email role")
      .exec();
    console.log("backend ", tickets);

    if (tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this customer" });
    }

    res.json(tickets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ assignedTo: req.user.id });
    res.json(tickets);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateTicketByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    let historyEntry = null;
    let assignedChanged = false;

    if (status && status !== ticket.status) {
      historyEntry = {
        status,
        updatedBy: req.user._id,
      };
      ticket.status = status;
    }

    if (assignedTo && assignedTo.toString() !== ticket.assignedTo?.toString()) {
      ticket.assignedTo = assignedTo;
      assignedChanged = true;

      // Add to history if only assignedTo changed
      if (!historyEntry) {
        historyEntry = {
          status: ticket.status,
          updatedBy: req.user._id,
        };
      }
    }

    if (historyEntry) {
      ticket.history.push(historyEntry);
    }

    const updatedTicket = await ticket.save();

    // ✅ Send mail ONLY if assignedTo changed
    if (assignedChanged) {
      const technician = await User.findById(assignedTo);
      if (technician) {
        await sendEmail(
          technician.email,
          `New Ticket Assigned: ${ticket.title}`,
          `Hi ${technician.name},\n\nYou have been assigned a new ticket titled "${ticket.title}".\n\nPlease check and proceed accordingly.\n\nThanks`
        );
      }
    }

    res.status(200).json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating ticket" });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await ticket.deleteOne();
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const markTicketResolved = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("customerComplaint", "email");
    // console.log("Ticket ID:", req.params.id);
    // console.log("Populated Ticket:", ticket);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to resolve this ticket" });
    }

    ticket.status = "resolved";
    ticket.resolvedAt = new Date();

    ticket.history.push({
      status: "resolved",
      updatedBy: req.user.id,
      updatedAt: ticket.resolvedAt,
    });

    await ticket.save();

    if (ticket.createdBy?.email) {
      sendEmail(
        ticket.createdBy.email,
        `Ticket Resolved: ${ticket.title}`,
        `Hi ${ticket.createdBy.name},\n\nThe ticket you created has been marked as resolved by ${ticket.assignedTo.name}.\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\n\nThanks`
      ).catch((err) => console.error("Email send failed to staff:", err));
    }

    if (ticket.customerComplaint) {
      const complaintId = ticket.customerComplaint._id || ticket.customerComplaint;
      const complaint = await Complaint.findById(complaintId);
      // console.log("Complaint fetched manually:", complaint);

      if (complaint?.email) {
        try {
          await sendEmail(
            complaint.email,
            `Your Complaint Resolved: ${ticket.title}`,
            `Hi,\n\nYour complaint associated with the ticket titled "${ticket.title}" has been marked as resolved.\n\nThanks`
          );
        } catch (err) {
          console.error("Email send failed to customer:", err);
        }
      } else {
        console.log("❌ Complaint found but no email.");
      }
    }

    res.status(200).json({ message: "Ticket marked as resolved", ticket });
  } catch (error) {
    console.error("Error resolving ticket:", error);
    res.status(500).json({ message: "Server error", error: error.message, stack: error.stack });
  }
};




// Mark ticket as in-progress

const setTicketInProgress = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.assignedTo.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ticket" });
    }

    ticket.status = "in-progress";

    // 👇 Add to history array
    ticket.history.push({
      status: "in-progress",
      changedBy: req.user._id,
      note: "Marked as in-progress by technician",
    });

    await ticket.save();

    res.status(200).json({ message: "Ticket marked as in-progress", ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to update ticket status" });
  }
};

const closeTicketByStaff = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.createdBy._id.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this ticket" });
    }

    ticket.status = "closed";
    ticket.closedAt = new Date();
    ticket.history.push({
      status: "closed",
      updatedBy: req.user.id,
      updatedAt: ticket.closedAt,
    });

    //  Update linked complaint's status
    // console.log("ticket.complaintId", ticket.customerComplaint);
    if (ticket.customerComplaint) {
      const complaint = await Complaint.findById(ticket.customerComplaint);
      if (complaint) {
        complaint.status = "Closed";
        await complaint.save();
      }
    }

    await ticket.save();

    // 📧 Send Email
    if (ticket.createdBy?.email) {
      sendEmail(
        ticket.createdBy.email,
        `Ticket Closed: ${ticket.title}`,
        `Hi ${ticket.createdBy.name},\n\nThe ticket you created is closed.\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\n\nThanks`
      ).catch((err) => console.error("Email send failed:", err));
    }

    res.status(200).json({ message: "Ticket marked as closed", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  getTicketById,
  getAllTickets,
  createTicket,
  getAssignedTickets,
  updateTicketByAdmin,
  deleteTicket,
  markTicketResolved,
  closeTicketByStaff,
  getCustomerTickets,
  setTicketInProgress,
};
