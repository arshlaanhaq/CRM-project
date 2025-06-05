"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApi } from "@/contexts/api-context";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  productName: z.string().min(2, { message: "Product name must be at least 2 characters" }),
  serialNumber: z.string().min(2, { message: "Serial number must be at least 2 characters" }),
  purchaseDate: z.date({ required_error: "Please select a date of purchase" }),
  issueDescription: z.string().min(10, { message: "Please describe the issue in at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomerComplaintForm() {
  const router = useRouter();
  const { createComplaint } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      productName: "",
      serialNumber: "",
      issueDescription: "",
      dateOfPurchase: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const complaintData = {
        subject: data.productName,
        issueDescription: data.issueDescription,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        productName: data.productName,
        serialNumber: data.serialNumber,
        dateOfPurchase: data.purchaseDate,  // Ensure this is a valid date
      };
  
      await createComplaint(complaintData); // Send JSON instead of FormData
      // console.log("Complaint submitted successfully", data);
      setIsSubmitted(true);
      form.reset();
    } catch (err) {
      console.error("Error submitting complaint:", err);
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  return (
    <div className="container mx-auto py-6">
      <Image src="/image/new.png" alt="Demo logo" width={100} height={100} />
      <h1 className="text-2xl font-bold mb-6">Submit a Complaint</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Customer Complaint Form</CardTitle>
          <CardDescription>
            Please fill out this form to submit a complaint about a product or service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmitted ? (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">Complaint Submitted</AlertTitle>
              <AlertDescription className="text-green-700">
                Thank you for submitting your complaint. We will review it and get back to you as soon as possible.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="Your email" type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="Your phone number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="Your address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField name="productName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl><Input placeholder="Product name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="serialNumber" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl><Input placeholder="Product serial number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField name="purchaseDate" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          {field.value ? format(field.value, "PPP") : "Select purchase date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="issueDescription" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe the issue" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
