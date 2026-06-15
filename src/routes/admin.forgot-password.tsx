import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/cohata-logo.png";

export const Route = createFileRoute("/admin/forgot-password")({
  component: ForgotPassword,
  head: () => ({
    meta: [{ title: "COHATA Admin — Forgot Password" }],
  }),
});

function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="COHATA" className="h-12 w-auto" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-soft text-center">
          <h1 className="font-display text-2xl" style={{ color: "var(--primary)" }}>Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-3">
            For security, password resets are handled by your COHATA administrator. Reach out to them directly, or email{" "}
            <a href="mailto:hello@cohatacademy.com" className="text-primary hover:underline">
              hello@cohatacademy.com
            </a>{" "}
            and they'll set a new password for your account.
          </p>
          <Link to="/admin/login" className="inline-block mt-6 text-sm font-medium text-primary hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
