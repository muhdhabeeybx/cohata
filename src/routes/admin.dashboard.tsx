import { createFileRoute } from "@tanstack/react-router";
import { BookingsDashboard } from "@/components/BookingsDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  component: BookingsDashboard,
  head: () => ({
    meta: [
      { title: "COHATA Admin — Bookings & Enrollments" },
    ],
  }),
});
