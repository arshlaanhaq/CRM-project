"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Star,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/contexts/api-context";
import { Textarea } from "@/components/ui/textarea";
export interface ComplaintPayload {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productName: string;
  serialNumber: string;
  dateOfPurchase: Date;
  issueDescription: string;
  createdAt?: Date;
  status?: 'Pending' | 'Ticket Created' | 'Closed';
  assignedTo?: string; // New field to store assigned staff member
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString();
}

export default function CustomerTicketDetail() {
  const { id } = useParams();
   const params = useParams()
  const [role, setRole] = useState("");
  const router = useRouter();
  const { getTicketById, getComplaintById } = useApi();
  const [complaints, setComplaints] = useState<ComplaintPayload[]>([]);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
const [customerPinCode, setCustomerPinCode] = useState("");


  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role);
  }, []);

useEffect(() => {
  if (!id) return;

  const fetchDetails = async () => {
    try {
      setLoading(true);

      // Step 1: Fetch ticket by ID
      const ticketData = await getTicketById(id);
      setTicket(ticketData);

      // Step 2: If ticket includes a customerComplaint ID, fetch that
      if (ticketData.customerComplaint) {
        const complaintDetails = await getComplaintById(ticketData.customerComplaint);
        setCustomerAddress(complaintDetails.address || "");
        setCustomerPinCode(complaintDetails.zipCode || "");
      }
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Failed to load details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchDetails();
}, [id, getTicketById, getComplaintById]);



  useEffect(() => {
    if (id) {
      setLoading(true);
      getTicketById(id as string)
        .then((data) => {
          setTicket(data);
          setLoading(false);
        })

        .catch((err) => {
          console.error("Error loading ticket:", err);
          setError("Failed to load ticket.");
          setLoading(false);
        });
    }
  }, [id, getTicketById]);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) setRole(storedRole);
  }, []);

  const handleRedirect = () => {
    switch (role) {
      case "admin":
        router.push("/dashboard");
        break;
      case "staff":
        router.push("/staff-dashboard");
        break;
      case "technician":
        router.push("/technician-dashboard");
        break;
      default:
        router.push("/"); // fallback
    }
  };
  const handleSubmitFeedback = async () => {
    try {
      const newFeedback = {
        rating,
        comment: feedbackText,
        submittedAt: new Date().toISOString(),
      };

      const newComment = {
        id: Date.now().toString(),
        user: localStorage.getItem("userName") || "Customer",
        role: userRole,
        text: `Submitted feedback with rating: ${rating}/5`,
        timestamp: new Date().toISOString(),
      };

      setTicket((prev) => ({
        ...prev,
        feedback: newFeedback,
        comments: [...(prev.comments || []), newComment], // ✅ safe spread
      }));

      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
      "in-progress": "bg-yellow-50 text-yellow-700 border-yellow-200",
      resolved: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <Badge className={styles[status] || ""}>
        {status.replace("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return (
      <Badge className={styles[priority] || ""}>
        {priority[0].toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => handleRedirect()}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  const StarRating = ({
    rating,
    setRating,
    disabled = false,
  }: {
    rating: number;
    setRating: (rating: number) => void;
    disabled?: boolean;
  }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => setRating(star)}
            className={`${
              disabled
                ? "cursor-default"
                : "cursor-pointer hover:text-yellow-400"
            } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleRedirect}>
            ← Back to Dashboard
          </Button>

          <div className="mt-2">
            <h1 className="text-2xl font-bold">
              Ticket #{ticket.formattedId || ticket._id}
            </h1>
            <div className="flex gap-2 mt-1">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>{ticket.title}</CardTitle>
                    <CardDescription>
                      Created on {formatDate(ticket.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Description
                        </h3>
                        <p className="text-sm">{ticket.description}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Customer Name
                        </h3>
                        <p className="text-sm">{ticket.customer?.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Customer Email
                        </h3>
                        <p className="text-sm">{ticket.customer?.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Customer Phone
                        </h3>
                        <p className="text-sm">{ticket.customer?.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Customer Addess
                        </h3>
                         <p className="text-sm">Address: {customerAddress}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Status
                          </h3>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Priority
                          </h3>
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Assigned To
                          </h3>
                          <p className="text-sm">
                            {ticket.assignedTo?.name || "Unassigned"}
                          </p>
                        </div>
                        {ticket.scheduledDate && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Scheduled Date
                            </h3>
                            <p className="text-sm">
                              {formatDate(ticket.scheduledDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Timeline Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Technician Assignment Updated (if applicable) */}
                  {ticket.history?.find(
                    (h: any) => h.updatedBy === ticket.assignedTo?._id
                  ) && (
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100">
                          <User className="h-5 w-5 text-purple-700" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">
                          Technician Assignment Updated
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(
                            ticket.history.find(
                              (h: any) => h.updatedBy === ticket.assignedTo?._id
                            )?.updatedAt
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assigned Technician */}
                  {ticket.assignedTo && (
                    <div className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100">
                          <User className="h-5 w-5 text-green-700" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">
                          Assigned to Technician: {ticket.assignedTo.name}
                          
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Email: {ticket.assignedTo.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Change History - Newest First */}
                  {[...ticket.history]
                    ?.reverse()
                    .map((entry: any, index: number) => (
                      <div key={entry._id || index} className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-yellow-100">
                            <Clock className="h-5 w-5 text-yellow-700" />
                          </div>
                          {index < ticket.history.length - 1 && (
                            <div className="h-full w-px bg-border" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            Status changed to:{" "}
                            {entry.status.replace("-", " ").toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(entry.updatedAt)}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Ticket Created - Show at Bottom */}
                  <div className="flex">
                    <div className="mr-4 flex flex-col items-center">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Ticket Created</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {userRole === "customer" && ticket.status === "resolved" && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback</CardTitle>
                <CardDescription>
                  Please rate your experience with this service request
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticket.feedback || feedbackSubmitted ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Your Rating
                      </h3>
                      <StarRating
                        rating={ticket.feedback?.rating || rating}
                        setRating={() => {}}
                        disabled
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Your Comments
                      </h3>
                      <p className="text-sm">
                        {ticket.feedback?.comment || feedbackText}
                      </p>
                    </div>
                    <div className="bg-green-50 text-green-700 p-3 rounded-md">
                      Thank you for your feedback! It helps us improve our
                      service.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Rate your experience
                      </h3>
                      <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Additional comments
                      </h3>
                      <Textarea
                        placeholder="Share your experience with our service..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={rating === 0}
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
