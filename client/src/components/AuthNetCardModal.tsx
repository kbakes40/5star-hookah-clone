/**
 * Authorize.Net Accept.js card-entry modal.
 *
 * Tokenizes card data client-side via Accept.js; the raw PAN/CVV never leaves the browser
 * for our server. Parent provides `onCharge(nonce)` which posts the opaque nonce to our
 * tRPC `checkout.chargeAuthNet` procedure.
 *
 * Brutalist styling matches the cart modal in CartDrawer.tsx.
 */

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { isAcceptJsConfigured, tokenizeCard } from "@/lib/acceptjs";

type CardFlow = "idle" | "tokenizing" | "charging" | "success" | "error";

export type AuthNetChargeNonce = { dataDescriptor: string; dataValue: string };

export type AuthNetChargeOk = {
  orderId: string;
  transactionId: string | null;
  accountLast4: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Display-formatted total (e.g. "$42.00"). */
  totalLabel: string;
  /** Optional default to prefill the cardholder name input. */
  defaultCardholderName?: string;
  /**
   * Parent runs the tRPC charge against the opaque nonce.
   * Resolves on approval; throws/rejects on decline or gateway error.
   */
  onCharge: (nonce: AuthNetChargeNonce, billingZip: string) => Promise<AuthNetChargeOk>;
  /** Called after the user dismisses the success state — parent should close the cart. */
  onSuccess?: (result: AuthNetChargeOk) => void;
};

function formatCardNumberDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiryDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function AuthNetCardModal({
  open,
  onClose,
  totalLabel,
  defaultCardholderName,
  onCharge,
  onSuccess,
}: Props) {
  const [cardholderName, setCardholderName] = useState(defaultCardholderName ?? "");
  const [cardNumberDisplay, setCardNumberDisplay] = useState("");
  const [expiryDisplay, setExpiryDisplay] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [flow, setFlow] = useState<CardFlow>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chargeResult, setChargeResult] = useState<AuthNetChargeOk | null>(null);

  const configured = useMemo(() => isAcceptJsConfigured(), []);

  useEffect(() => {
    if (open) return;
    // Reset state when the modal closes so the next open starts clean.
    setCardholderName(defaultCardholderName ?? "");
    setCardNumberDisplay("");
    setExpiryDisplay("");
    setCvv("");
    setBillingZip("");
    setFlow("idle");
    setErrorMessage(null);
    setChargeResult(null);
  }, [open, defaultCardholderName]);

  if (!open) return null;

  const busy = flow === "tokenizing" || flow === "charging";

  const canSubmit =
    configured &&
    !busy &&
    cardNumberDisplay.replace(/\s/g, "").length >= 13 &&
    /^\d{2}\/\d{2}$/.test(expiryDisplay) &&
    cvv.length >= 3 &&
    billingZip.length >= 3;

  async function handleSubmit() {
    setErrorMessage(null);

    const [mm, yy] = expiryDisplay.split("/");

    try {
      setFlow("tokenizing");
      const nonce = await tokenizeCard({
        cardNumber: cardNumberDisplay,
        expirationMonth: mm,
        expirationYear: yy,
        cardCode: cvv,
        zip: billingZip,
        fullName: cardholderName.trim() || undefined,
      });

      setFlow("charging");
      const ok = await onCharge(nonce, billingZip);
      setChargeResult(ok);
      setFlow("success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Card payment failed.";
      setErrorMessage(msg);
      setFlow("error");
    }
  }

  function handleBackdropClick() {
    if (busy) return;
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="w-full max-w-lg bg-background border-3 border-border brutalist-border brutalist-shadow p-8"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-card-title"
      >
        <h3
          id="cart-card-title"
          className="font-display font-black text-xl md:text-2xl text-center mb-2 tracking-tight"
        >
          CREDIT CARD
        </h3>
        <p className="text-xs text-center text-muted-foreground mb-6">
          Total <span className="font-bold text-foreground">{totalLabel}</span> · Processed
          securely by Authorize.Net
        </p>

        {!configured && (
          <p className="text-sm text-center text-destructive mb-4 leading-relaxed">
            Card payments are not fully configured. Set VITE_AUTHNET_API_LOGIN_ID and
            VITE_AUTHNET_PUBLIC_CLIENT_KEY.
          </p>
        )}

        {flow === "success" && chargeResult ? (
          <div className="space-y-6">
            <p className="text-sm text-center text-foreground leading-relaxed">
              Payment approved. Order reference{" "}
              <span className="font-bold">{chargeResult.orderId.slice(0, 8)}</span>.
              {chargeResult.accountLast4 && (
                <>
                  {" "}
                  Charged to card ending in{" "}
                  <span className="font-bold">{chargeResult.accountLast4}</span>.
                </>
              )}
            </p>
            <Button
              type="button"
              className="w-full h-14 brutalist-border brutalist-shadow bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-lg font-black"
              onClick={() => {
                onSuccess?.(chargeResult);
                onClose();
              }}
            >
              DONE
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-display font-bold text-xs block">CARDHOLDER NAME</label>
              <Input
                value={cardholderName}
                onChange={e => setCardholderName(e.target.value)}
                placeholder="Name on card"
                disabled={busy}
                autoComplete="cc-name"
              />
            </div>

            <div className="space-y-2">
              <label className="font-display font-bold text-xs block">CARD NUMBER</label>
              <Input
                value={cardNumberDisplay}
                onChange={e => setCardNumberDisplay(formatCardNumberDisplay(e.target.value))}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                disabled={busy}
                autoComplete="cc-number"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2 col-span-1">
                <label className="font-display font-bold text-xs block">EXP</label>
                <Input
                  value={expiryDisplay}
                  onChange={e => setExpiryDisplay(formatExpiryDisplay(e.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  disabled={busy}
                  autoComplete="cc-exp"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <label className="font-display font-bold text-xs block">CVV</label>
                <Input
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  disabled={busy}
                  autoComplete="cc-csc"
                />
              </div>
              <div className="space-y-2 col-span-1">
                <label className="font-display font-bold text-xs block">ZIP</label>
                <Input
                  value={billingZip}
                  onChange={e =>
                    setBillingZip(e.target.value.replace(/[^A-Za-z0-9\- ]/g, "").slice(0, 10))
                  }
                  placeholder="12345"
                  inputMode="numeric"
                  disabled={busy}
                  autoComplete="postal-code"
                />
              </div>
            </div>

            {flow === "tokenizing" && (
              <p className="text-xs text-center text-muted-foreground">
                Securing card with Authorize.Net…
              </p>
            )}
            {flow === "charging" && (
              <p className="text-xs text-center text-muted-foreground">
                Authorizing payment…
              </p>
            )}
            {flow === "error" && errorMessage && (
              <p className="text-sm text-center text-destructive leading-relaxed">
                {errorMessage}
              </p>
            )}

            <Button
              type="button"
              disabled={!canSubmit}
              className="w-full h-14 brutalist-border brutalist-shadow bg-primary text-primary-foreground hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-lg font-black"
              onClick={handleSubmit}
            >
              {busy ? "PROCESSING..." : `PAY ${totalLabel}`}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              className="w-full h-10 text-xs font-bold tracking-wider"
              onClick={onClose}
            >
              CANCEL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
