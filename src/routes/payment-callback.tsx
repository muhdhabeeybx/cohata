import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Check, X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/payment-callback")({
  component: PaymentCallback,
  validateSearch: (search: Record<string, unknown>) => ({
    reference: (search.reference ?? search.trxref) as string | undefined,
  }),
  head: () => ({
    meta: [{ title: "Payment Status | COHATA" }],
  }),
});

type VerifyResult = { status: string; program?: string; amount?: number; sessionDate?: string; sessionTime?: string; hours?: number };

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function PaymentCallback() {
  const { reference } = Route.useSearch();
  const [state, setState] = useState<"loading" | "success" | "failed" | "error">("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    if (!reference) {
      setState("error");
      return;
    }
    api.get<VerifyResult>(`/api/payments/verify/${encodeURIComponent(reference)}`)
      .then((data) => {
        setResult(data);
        setState(data.status === "success" ? "success" : "failed");
      })
      .catch(() => setState("error"));
  }, [reference]);

  return (
    <Layout>
      <section className="max-w-xl mx-auto px-6 py-24 text-center">
        {state === "loading" && (
          <>
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-6">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <h1 className="font-display text-3xl text-primary mb-3">Confirming your payment…</h1>
            <p className="text-foreground/70">Please wait while we verify your payment with Paystack.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-6">
              <Check size={24} />
            </div>
            <h1 className="font-display text-3xl text-primary mb-3">JazākAllāhu khayran!</h1>
            <p className="text-foreground/70 mb-2">
              Your payment{result?.amount ? ` of ${formatNaira(result.amount)}` : ""} was successful
              {result?.program ? <> — <strong>{result.program}</strong></> : ""} is confirmed.
            </p>
            {result?.sessionDate && (
              <p className="text-foreground/70 mb-2">
                Scheduled for <strong>{result.sessionDate}</strong> at <strong>{result.sessionTime}</strong>
                {result.hours ? ` · ${result.hours} ${result.hours === 1 ? "hour" : "hours"}` : ""}
              </p>
            )}
            <p className="text-foreground/70 mb-8">Our team will reach out shortly In Shā' Allāh.</p>
            <Link to="/" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium inline-block hover:opacity-90 transition-opacity">
              Back to Home
            </Link>
          </>
        )}

        {(state === "failed" || state === "error") && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-6">
              <X size={24} />
            </div>
            <h1 className="font-display text-3xl text-primary mb-3">
              {state === "failed" ? "Payment not completed" : "Something went wrong"}
            </h1>
            <p className="text-foreground/70 mb-8">
              {state === "failed"
                ? "Your payment could not be confirmed. If you were charged, please contact us and we'll sort it out."
                : "We couldn't verify your payment right now. Please contact us if you were charged."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/book" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium inline-block hover:opacity-90 transition-opacity">
                Try Booking Again
              </Link>
              <Link to="/programs" className="border border-border text-foreground px-8 py-3.5 rounded-full font-medium inline-block hover:bg-muted transition-colors">
                Browse Programs
              </Link>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}
