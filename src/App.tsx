
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clubs from "@/pages/Clubs";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import EventVouchers from "@/pages/EventVouchers";
import EventLanding from "@/pages/EventLanding";
import ClubLanding from "@/pages/ClubLanding";
import CheckIn from "@/pages/CheckIn";
import Analytics from "@/pages/Analytics";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import StaffManagement from "@/pages/StaffManagement";
import Settings from "@/pages/Settings";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/club/:clubId" element={<ClubLanding />} />
                <Route path="/event/:eventId" element={<EventLanding />} />
                
                {/* Protected routes with dashboard layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Admin & SuperAdmin routes */}
                    <Route path="/clubs" element={
                      <ProtectedRoute allowedRoles={['superadmin']}>
                        <Clubs />
                      </ProtectedRoute>
                    } />
                    <Route path="/events" element={
                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                        <Events />
                      </ProtectedRoute>
                    } />
                    <Route path="/events/:eventId" element={
                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                        <EventDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/events/:eventId/vouchers" element={
                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                        <EventVouchers />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                        <Analytics />
                      </ProtectedRoute>
                    } />
                    
                    {/* SuperAdmin only routes */}
                    <Route path="/staff-management" element={
                      <ProtectedRoute allowedRoles={['superadmin']}>
                        <StaffManagement />
                      </ProtectedRoute>
                    } />
                    
                    {/* All roles routes */}
                    <Route path="/check-in" element={<CheckIn />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
