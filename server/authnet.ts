/**
 * Authorize.Net SDK wrapper — Accept.js opaque-data authCaptureTransaction.
 *
 * BOSS HOOKAH merchant (Fiserv/First Data gateway, MCC 5993).
 * Sandbox by default until the merchant account is flipped to live; controlled by AUTHNET_ENVIRONMENT.
 *
 * The official `authorizenet` SDK is callback-style and ships no types — we wrap it in a Promise
 * and surface a stable result shape for callers (see `AuthNetChargeResult`).
 */

// @ts-expect-error — authorizenet SDK ships no .d.ts; we narrow via local types below.
import authorizenet from "authorizenet";
import { ENV } from "./_core/env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { APIContracts, APIControllers, Constants } = authorizenet as any;

export class AuthNetConfigError extends Error {}
export class AuthNetTransactionError extends Error {
  readonly responseCode: string | null;
  readonly messages: AuthNetMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly raw: any;
  constructor(
    message: string,
    responseCode: string | null,
    messages: AuthNetMessage[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw: any
  ) {
    super(message);
    this.responseCode = responseCode;
    this.messages = messages;
    this.raw = raw;
  }
}

export type AuthNetMessage = { code: string; description: string };

export type AuthNetBillTo = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  phoneNumber?: string;
};

export type AuthNetLineItem = {
  /** Stable identifier per line — Authorize.Net requires max 31 chars. */
  itemId: string;
  /** Display name — max 31 chars per API. */
  name: string;
  /** Optional description — max 255 chars. */
  description?: string;
  quantity: number;
  /** Per-unit price in cents; we convert to decimal-USD strings for the API. */
  unitPriceCents: number;
};

export type AuthNetChargeInput = {
  /** From Accept.js: `response.opaqueData.dataDescriptor` */
  opaqueDataDescriptor: string;
  /** From Accept.js: `response.opaqueData.dataValue` */
  opaqueDataValue: string;
  /** Total to charge in cents (server-recomputed, never trust the client). */
  amountCents: number;
  /** Free-form reference — appears in merchant portal. Max 20 chars. */
  invoiceNumber?: string;
  /** Description — max 255 chars. */
  description?: string;
  customer?: { email?: string | null; id?: string };
  billTo?: AuthNetBillTo;
  /** Up to 30 line items per Authorize.Net spec. */
  lineItems?: AuthNetLineItem[];
};

export type AuthNetChargeResult = {
  approved: boolean;
  /** Authorize.Net transaction id (`transId`). Persist this in `bh_orders`. */
  transactionId: string | null;
  authCode: string | null;
  /** `1`=Approved, `2`=Declined, `3`=Error, `4`=Held for review. */
  responseCode: string | null;
  /** Last 4 of the funding card returned by the gateway. */
  accountNumberLast4: string | null;
  accountType: string | null;
  messages: AuthNetMessage[];
  /** Untouched JSON from the API for forensic storage in payment_metadata. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any;
};

export function isAuthNetConfigured(): boolean {
  return Boolean(ENV.authnetApiLoginId && ENV.authnetTransactionKey);
}

function assertAuthNetReady(): void {
  if (!isAuthNetConfigured()) {
    throw new AuthNetConfigError(
      "Authorize.Net is not configured. Set AUTHNET_API_LOGIN_ID and AUTHNET_TRANSACTION_KEY."
    );
  }
}

function centsToDecimalString(cents: number): string {
  const v = Math.max(0, Math.round(cents)) / 100;
  return v.toFixed(2);
}

/** Authorize.Net field caps — silently truncate rather than reject the entire charge. */
function clip(value: string | undefined | null, max: number): string | undefined {
  if (value == null) return undefined;
  const t = String(value).trim();
  if (!t) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}

function endpointFor(env: "sandbox" | "production"): string {
  return env === "production" ? Constants.endpoint.production : Constants.endpoint.sandbox;
}

/**
 * Submit an Accept.js nonce as an authCaptureTransaction (auth + capture in one call).
 *
 * Resolves with a normalized result for any complete API response (approved or declined).
 * Rejects with AuthNetConfigError if env is missing, or AuthNetTransactionError if the API
 * itself errored / returned no transaction response at all.
 */
export async function chargeWithAcceptJsNonce(
  input: AuthNetChargeInput
): Promise<AuthNetChargeResult> {
  assertAuthNetReady();

  if (!input.opaqueDataDescriptor || !input.opaqueDataValue) {
    throw new AuthNetTransactionError(
      "Missing Accept.js payment nonce.",
      null,
      [],
      null
    );
  }
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    throw new AuthNetTransactionError(
      "Invalid charge amount.",
      null,
      [],
      null
    );
  }

  const merchantAuth = new APIContracts.MerchantAuthenticationType();
  merchantAuth.setName(ENV.authnetApiLoginId);
  merchantAuth.setTransactionKey(ENV.authnetTransactionKey);

  const opaqueData = new APIContracts.OpaqueDataType();
  opaqueData.setDataDescriptor(input.opaqueDataDescriptor);
  opaqueData.setDataValue(input.opaqueDataValue);

  const payment = new APIContracts.PaymentType();
  payment.setOpaqueData(opaqueData);

  const txReq = new APIContracts.TransactionRequestType();
  txReq.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
  txReq.setAmount(centsToDecimalString(input.amountCents));
  txReq.setPayment(payment);

  const invoice = clip(input.invoiceNumber, 20);
  const description = clip(input.description, 255);
  if (invoice || description) {
    const order = new APIContracts.OrderType();
    if (invoice) order.setInvoiceNumber(invoice);
    if (description) order.setDescription(description);
    txReq.setOrder(order);
  }

  if (input.customer?.email || input.customer?.id) {
    const cust = new APIContracts.CustomerDataType();
    if (input.customer.id) cust.setId(clip(input.customer.id, 20));
    if (input.customer.email) cust.setEmail(clip(input.customer.email, 255));
    txReq.setCustomer(cust);
  }

  if (input.billTo) {
    const billTo = new APIContracts.CustomerAddressType();
    const fn = clip(input.billTo.firstName, 50);
    const ln = clip(input.billTo.lastName, 50);
    if (fn) billTo.setFirstName(fn);
    if (ln) billTo.setLastName(ln);
    const addr = clip(input.billTo.address, 60);
    const city = clip(input.billTo.city, 40);
    const state = clip(input.billTo.state, 40);
    const zip = clip(input.billTo.zip, 20);
    if (addr) billTo.setAddress(addr);
    if (city) billTo.setCity(city);
    if (state) billTo.setState(state);
    if (zip) billTo.setZip(zip);
    billTo.setCountry(clip(input.billTo.country, 60) ?? "US");
    const phone = clip(input.billTo.phoneNumber, 25);
    if (phone) billTo.setPhoneNumber(phone);
    txReq.setBillTo(billTo);
  }

  if (input.lineItems && input.lineItems.length > 0) {
    const list = new APIContracts.ArrayOfLineItem();
    const lineItems = input.lineItems.slice(0, 30).map(li => {
      const item = new APIContracts.LineItemType();
      item.setItemId(clip(li.itemId, 31) ?? "item");
      item.setName(clip(li.name, 31) ?? li.itemId.slice(0, 31));
      if (li.description) item.setDescription(clip(li.description, 255));
      item.setQuantity(Math.max(1, Math.round(li.quantity)));
      item.setUnitPrice(centsToDecimalString(li.unitPriceCents));
      return item;
    });
    list.setLineItem(lineItems);
    txReq.setLineItems(list);
  }

  const request = new APIContracts.CreateTransactionRequest();
  request.setMerchantAuthentication(merchantAuth);
  request.setTransactionRequest(txReq);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrl: any = new APIControllers.CreateTransactionController(request.getJSON());
  ctrl.setEnvironment(endpointFor(ENV.authnetEnvironment));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiResponse: any = await new Promise((resolve, reject) => {
    ctrl.execute(() => {
      const err = ctrl.getError?.();
      if (err) {
        reject(err);
        return;
      }
      const r = ctrl.getResponse();
      if (!r) {
        reject(new Error("Empty response from Authorize.Net."));
        return;
      }
      resolve(r);
    });
  });

  const response = new APIContracts.CreateTransactionResponse(apiResponse);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const top = response.getMessages?.() as any;
  const topResultCode: string | null = top?.getResultCode?.() ?? null;
  const topMsgs: AuthNetMessage[] = collectMessages(top?.getMessage?.());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txResp: any = response.getTransactionResponse?.();
  if (!txResp) {
    throw new AuthNetTransactionError(
      topMsgs[0]?.description || "Authorize.Net returned no transaction response.",
      topResultCode,
      topMsgs,
      apiResponse
    );
  }

  const responseCode: string | null = txResp.getResponseCode?.() ?? null;
  const transactionId: string | null = txResp.getTransId?.() ?? null;
  const authCode: string | null = txResp.getAuthCode?.() ?? null;
  const accountNumber: string | null = txResp.getAccountNumber?.() ?? null;
  const accountType: string | null = txResp.getAccountType?.() ?? null;

  const txMsgs: AuthNetMessage[] = collectMessages(txResp.getMessages?.()?.getMessage?.());
  const txErrors: AuthNetMessage[] = collectMessages(txResp.getErrors?.()?.getError?.(), "error");

  const approved = responseCode === "1";

  // Last 4 — Authorize.Net returns "XXXX1111" or similar.
  const last4 =
    typeof accountNumber === "string" && accountNumber.length >= 4
      ? accountNumber.slice(-4)
      : null;

  return {
    approved,
    transactionId: transactionId || null,
    authCode: authCode || null,
    responseCode,
    accountNumberLast4: last4,
    accountType: accountType || null,
    messages: txMsgs.length > 0 ? txMsgs : txErrors.length > 0 ? txErrors : topMsgs,
    raw: apiResponse,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectMessages(list: any, fieldStyle: "message" | "error" = "message"): AuthNetMessage[] {
  if (!Array.isArray(list)) return [];
  return list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => {
      const code =
        fieldStyle === "error" ? m.getErrorCode?.() : m.getCode?.();
      const description =
        fieldStyle === "error" ? m.getErrorText?.() : m.getText?.();
      return { code: code ?? "", description: description ?? "" };
    })
    .filter(m => m.code || m.description);
}
