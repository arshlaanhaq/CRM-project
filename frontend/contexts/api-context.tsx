"use client";
import { createContext, useContext, useReducer, ReactNode, useRef, useEffect } from "react";
import axios from "@/utils/axios";
import { io, Socket } from "socket.io-client";
function decodeJWT(token: string | null) {
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1]; // Get the payload part
    const decodedPayload = atob(payloadBase64); // Decode base64
    return JSON.parse(decodedPayload); // Parse JSON
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const decoded = decodeJWT(token);
console.log("Decoded token:", decoded);

// Now you can check role without jwt-decode:
if (decoded?.role === "technician") {
  console.log("User is a technician");
}
  if (!token) throw new Error("No token found");

  return { Authorization: `Bearer ${token}` };
};

// ======================
// Types
// ======================
// State types for the Forgot Password flow
interface CustomerDetails {
  name: string;
  phone: string;
}



interface ForgotPasswordState {
  email: string;
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Initial state setup
const initialState: ForgotPasswordState = {
  email: "",
  loading: false,
  error: null,
  success: null,
};

// Action types for state transitions
const actionTypes = {
  SET_EMAIL: "SET_EMAIL",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SUCCESS: "SET_SUCCESS",
};
// Reducer function that will handle state changes based on actions
const forgotPasswordReducer = (state: ForgotPasswordState, action: any): ForgotPasswordState => {
  switch (action.type) {
    case actionTypes.SET_EMAIL:
      return { ...state, email: action.payload };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.SET_SUCCESS:
      return { ...state, success: action.payload };
    default:
      return state;
  }
};

interface CustomerComplaint {
  _id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}
export interface ComplaintPayload {
  _id?: string; // Optional if you're creating a new document
  name: string;
  email: string;
  phone: string;
  address: string;
  productName: string;
  serialNumber: string;
  dateOfPurchase: Date;
  issueDescription: string;
  // billImage?: string;
  createdAt?: Date;
  status?: 'Pending' | 'Ticket Created' | 'Closed';
}


interface UpdateComplaintStatusPayload {
  status: string;
  assignedTo?: string | null;
}
interface CustomerInfo {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  role: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  role: "admin" | "staff" | "technician" | "customer";
  createdAt: string;
  updatedAt: string;
}
// TicketHistory Entry
interface TechnicianDetails {
  technician: User;
  assignedTickets: Ticket[];
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: string;
  closeCode: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  history: {
    status: string;
    updatedBy?: string;
    updatedAt: string;
    _id: string;
  }[];
}

interface AnalyticsSummary {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
}

interface RegisterPayload {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  role: "admin" | "staff" | "technician" | "customer";
  createdAt: string;
  updatedAt: string;
}

interface TicketPayload {
  subject: string;
  description: string;
  priority: string;
  assignedTo?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

interface UpdateTicketPayload {
  subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
}

interface ReportParams {
  from?: string;
  to?: string;
  technicianId?: string;
}

interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  role: "admin" | "staff" | "technician" | "customer";
  createdAt: string;
  updatedAt: string;
}

interface ApiContextType {
  
  technician: User;
  assignedTickets: Ticket[];
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (data: RegisterPayload) => Promise<{ user: User }>;
  logout: () => void;
  getTechnicians: () => Promise<User[]>;
  getStaff: () => Promise<User[]>;
  deleteUser: (id: string) => Promise<void>;
  // registerCustomer: (data: RegisterPayload) => Promise<User>;
  // getCustomerTickets: () => Promise<Ticket[]>;
  // getCustomerById: (id: string) => Promise<User>;
  // getAllCustomers: () => Promise<User[]>;
  createTicket: (data: TicketPayload) => Promise<Ticket>;
  getAllTickets: () => Promise<Ticket[]>;
  getMyTickets: () => Promise<Ticket[]>;
  updateTicket: (id: string, data: UpdateTicketPayload) => Promise<Ticket>;
  resolveTicket: (id: string) => Promise<Ticket>;
  closeTicket: (id: string, closeCode: string) => Promise<Ticket>;
  markTicketInProgress: (id: string) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  getTicketById: (id: string) => Promise<Ticket>;
  getTechnicianById: (id: string) => Promise<TechnicianDetails>;
  getTechnicianProfile: () => Promise<AdminProfile | null>;
  updateTechnicianProfile: (data: Partial<AdminProfile> & { password?: string }) => Promise<AdminProfile>;
  getStaffById: (id: string) => Promise<User>;
  getStaffProfile: () => Promise<AdminProfile | null>;
  updateStaffProfile: (data: Partial<AdminProfile> & { password?: string }) => Promise<AdminProfile>;
  getAnalyticsSummary: () => Promise<AnalyticsSummary>;
  getTicketsPerTechnician: () => Promise<any[]>;
  getReports: (params: ReportParams) => Promise<any>;
  getAdminProfile: () => Promise<AdminProfile | null>;
  updateAdminProfile: (data: Partial<AdminProfile> & { password?: string }) => Promise<AdminProfile>;
  // getCustomerProfile: () => Promise<CustomerInfo | null>;
  // updateCustomerProfile: (data: Partial<CustomerInfo> & { password?: string }) => Promise<void>;
  createComplaint: (data: ComplaintPayload) => Promise<CustomerComplaint>;
  getAllComplaints: () => Promise<CustomerComplaint[]>;
  getComplaintById: (id: string) => Promise<CustomerComplaint>;
  updateComplaintStatus: (id: string, data: UpdateComplaintStatusPayload) => Promise<CustomerComplaint>;
  deleteComplaint: (id: string) => Promise<void>;
   fetchCustomerEmails: () => Promise<string[]>;
  getCustomerDetailsByEmail: (email: string) => Promise<CustomerDetails | null>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(forgotPasswordReducer, initialState);
   const socketRef = useRef<Socket | null>(null);
  const login = async (email: string, password: string) => {
    const res = await axios.post("/auth/login", { email, password });
    const { user, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("isLoggedIn", "true");
    return { user, token };
  };

 
    useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !socketRef.current) {
      socketRef.current = io("http://localhost:5000", {
        auth: { token },
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);
 
  const register = async (data: RegisterPayload) => {
    const res = await axios.post("/auth/register", data);
    console.log(res.data);
    return res.data;
  };

  const logout = () => localStorage.clear();

  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.SET_ERROR, payload: null });
      dispatch({ type: actionTypes.SET_SUCCESS, payload: null });

      const res = await axios.post("/auth/forgot-password", { email });

      dispatch({ type: actionTypes.SET_SUCCESS, payload: res.data.message });
    } catch (err: any) {
      dispatch({ type: actionTypes.SET_ERROR, payload: err.response?.data?.message || "Something went wrong" });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };
  const resetPassword = async (token: string, password: string) => {
    try {
      console.log(token, password);
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.SET_ERROR, payload: null });
      dispatch({ type: actionTypes.SET_SUCCESS, payload: null });

      const res = await axios.post(`/auth/reset-password/${token}`, { password });

      dispatch({ type: actionTypes.SET_SUCCESS, payload: res.data.message });
    } catch (err: any) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: err.response?.data?.message || "Something went wrong"
      });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };
  const fetchCustomerEmails = async (): Promise<string[]> => {
    try {
      const response = await axios.get('/customer-complaints/emails', {
      
      });
      return response.data.emails || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  };

  const getCustomerDetailsByEmail = async (email: string): Promise<CustomerDetails | null> => {
    try {
      const response = await axios.get(`/customer-complaints/customer-details/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  };

  // const registerCustomer = async (data: RegisterPayload) => {
  //   const res = await axios.post("/auth/register-customer", data);
  //   return res.data;
  // };

  // const updateCustomerProfile = async (data: Partial<CustomerInfo> & { password?: string }) => {
  //   await axios.put("/auth/customer/update-profile", data, {
  //     headers: getAuthHeaders(),
  //   });
  // };

  // const getCustomerProfile = async () => {
  //   const res = await axios.get("/auth/customer/profile", {
  //     headers: getAuthHeaders(),
  //   });
  //   return res.data;
  // };

  // const getCustomerTickets = async () => {
  //   const res = await axios.get("/tickets/ticket", {
  //     headers: getAuthHeaders(),
  //   });
  //   return res.data;
  // };

  // const getCustomerById = async (id: string) => (await axios.get(`/auth/customers/${id}`)).data;
  // const getAllCustomers = async () => (await axios.get("/auth/customers")).data;
  const getTechnicians = async () => (await axios.get("/auth/technicians")).data;

  const getTechnicianById = async (id: string): Promise<TechnicianDetails> => {
    const response = await axios.get(`/auth/technicians/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  };

  const getTechnicianProfile = async () => {
    const res = await axios.get("/auth/technician/profile", { headers: getAuthHeaders() });
    return res.data;
  };

  const updateTechnicianProfile = async (data: Partial<AdminProfile> & { password?: string }) => {
    const res = await axios.put("/auth/technician/update-profile", data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  };

  const getStaff = async () => (await axios.get("/auth/staff")).data;
  const getStaffById = async (id: string) => (await axios.get(`/auth/staff/${id}`)).data;

  const getStaffProfile = async () => {
    const res = await axios.get("/auth/staff/profile", { headers: getAuthHeaders() });
    return res.data;
  };

  const updateStaffProfile = async (data: Partial<AdminProfile> & { password?: string }) => {
    const res = await axios.put("/auth/staff/update-profile", data, { headers: getAuthHeaders() });
    return res.data.user;
  };

  const deleteUser = async (id: string) => {
    await axios.delete(`/auth/${id}`);
  };

  const createTicket = async (data: TicketPayload) => (await axios.post("/tickets", data)).data;
  const getAllTickets = async () => (await axios.get("/tickets")).data;
  const getMyTickets = async () => {
    try {
      const response = await axios.get('/tickets/my-tickets');  // Adjust URL based on your backend route
      return response.data;  // Returns the ticket data
    } catch (error) {
      console.error("Error fetching technician tickets:", error);
      throw error;
    }
  };

  const updateTicket = async (id: string, data: UpdateTicketPayload) =>
    (await axios.put(`/tickets/${id}`, data)).data;

  const resolveTicket = async (id: string) =>
    (await axios.put(`/tickets/${id}/resolve`, { resolvedAt: new Date().toISOString() })).data;

const closeTicket = async (id: string, closeCode: string) => {
  const res = await axios.put(
    `/tickets/${id}/close`,
    {
      closeCode,
      closedAt: new Date().toISOString(),
    }
  );
  return res.data;
};

  const markTicketInProgress = async (id: string) => {
    const res = await axios.put(`/tickets/${id}/in-progress`, { inProgressAt: new Date().toISOString() });
    return res.data.ticket;
  };

  const deleteTicket = async (id: string) => {
    await axios.delete(`/tickets/${id}`);
  };

  const getTicketById = async (id: string) =>
    (await axios.get(`/tickets/${id}`, { headers: getAuthHeaders() })).data;

  const getAnalyticsSummary = async () => (await axios.get("/analytics/summary")).data;
  const getTicketsPerTechnician = async () => (await axios.get("/analytics/tickets-per-technician")).data;
  const getReports = async (params: ReportParams) =>
    (await axios.get("/reports", { params })).data;

  const getAdminProfile = async () => {
    const res = await axios.get("/auth/admin/profile", {
      headers: getAuthHeaders(),
    });
    return res.data;
  };

  const updateAdminProfile = async (data: Partial<AdminProfile> & { password?: string }) => {
    const res = await axios.put("/auth/admin/update-profile", data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  };
  
  const createComplaint = async (data: ComplaintPayload) => {
  try {
    const res = await axios.post("/customer-complaints", data);
    return res.data;
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};


  const getAllComplaints = async (data: ComplaintPayload) => {
    const res = await axios.get("/customer-complaints", {
      headers: getAuthHeaders(),
    });
   
    return res.data;
  };

  const getComplaintById = async (id: string) => {
    const res = await axios.get(`/customer-complaints/${id}`, { headers: getAuthHeaders() });
    return res.data;
  };

  const updateComplaintStatus = async (id: string, data: UpdateComplaintStatusPayload) => {
    const res = await axios.put(`/customer-complaints/${id}/status`, data, { headers: getAuthHeaders() });
    return res.data;
  };

  const deleteComplaint = async (id: string) => {
    await axios.delete(`/customer-complaints/${id}`, { headers: getAuthHeaders() });
  };

  return (
    <ApiContext.Provider
      value={{
        login,
        register,
        logout,
        getTechnicians,
        getTechnicianProfile,
        updateTechnicianProfile,
        getAdminProfile,
        updateAdminProfile,
        getStaff,
        deleteUser,
        // registerCustomer,
        // updateCustomerProfile,
        // getCustomerTickets,
        // getCustomerById,
        // getCustomerProfile,
        // getAllCustomers,
        createTicket,
        getAllTickets,
        getMyTickets,
        updateTicket,
        resolveTicket,
        closeTicket,
        markTicketInProgress,
        deleteTicket,
        getTicketById,
        getTechnicianById,
        getStaffById,
        getStaffProfile,
        updateStaffProfile,
        getAnalyticsSummary,
        getTicketsPerTechnician,
        getReports,
        createComplaint,
        getAllComplaints,
        getComplaintById,
        updateComplaintStatus,
        deleteComplaint,
        state,
        dispatch,
        forgotPassword,
        resetPassword,
        fetchCustomerEmails,
        getCustomerDetailsByEmail,
        socket: socketRef.current
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return context;
};
