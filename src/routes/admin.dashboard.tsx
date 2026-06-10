import { createFileRoute } from "@tanstack/react-router";
import { BookingsDashboard } from "@/components/BookingsDashboard";
import { AuthGuard } from "@/lib/auth";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (
    <AuthGuard>
      <BookingsDashboard />
    </AuthGuard>
  ),
  head: () => ({
    meta: [
      { title: "COHATA Admin — Bookings & Enrollments" },
    ],
  }),
});
