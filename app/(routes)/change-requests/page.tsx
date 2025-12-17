"use client";
import react, { useState, useEffect, Suspense } from "react";
import { redirect } from "next/navigation";

import { axiosInstance } from "@/utils/axios";
import { ChangeRequestsDataTable } from "./_components/data-table";

export default function AdminChangeRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/change-requests");
      setRequests(response.data.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Change Requests Management</h1>
      <ChangeRequestsDataTable initialData={requests} />
    </div>
  );
}
