/**
 * Authorize.Net Accept.js loader + tokenization.
 *
 * Loads the gateway-hosted Accept.js bundle from the sandbox or production CDN, then
 * wraps `window.Accept.dispatchData` in a Promise. The card PAN/expiry/CVV is sent
 * directly from the browser to Authorize.Net — it never touches our server.
 */

type AcceptEnv = "sandbox" | "production";

type AcceptMessage = { code: string; text: string };
type AcceptResponse = {
  messages: { resultCode: "Ok" | "Error"; message: AcceptMessage[] };
  opaqueData?: { dataDescriptor: string; dataValue: string };
};

type AcceptSecureData = {
  authData: { clientKey: string; apiLoginID: string };
  cardData: {
    cardNumber: string;
    month: string;
    year: string;
    cardCode: string;
    zip?: string;
    fullName?: string;
  };
};

declare global {
  interface Window {
    Accept?: {
      dispatchData: (data: AcceptSecureData, callback: (r: AcceptResponse) => void) => void;
    };
  }
}

const SANDBOX_SRC = "https://jstest.authorize.net/v1/Accept.js";
const PRODUCTION_SRC = "https://js.authorize.net/v1/Accept.js";

let pending: Promise<void> | null = null;

function envFromConfig(): AcceptEnv {
  const v = (import.meta.env.VITE_AUTHNET_ENVIRONMENT ?? "sandbox").toString().trim().toLowerCase();
  return v === "production" || v === "prod" || v === "live" ? "production" : "sandbox";
}

export function getAcceptJsConfig(): {
  apiLoginID: string;
  clientKey: string;
  environment: AcceptEnv;
} {
  return {
    apiLoginID: (import.meta.env.VITE_AUTHNET_API_LOGIN_ID ?? "").toString().trim(),
    clientKey: (import.meta.env.VITE_AUTHNET_PUBLIC_CLIENT_KEY ?? "").toString().trim(),
    environment: envFromConfig(),
  };
}

export function isAcceptJsConfigured(): boolean {
  const c = getAcceptJsConfig();
  return Boolean(c.apiLoginID && c.clientKey);
}

let devLogged = false;
function logConfigOnce(src: string, env: AcceptEnv): void {
  if (devLogged || !import.meta.env.DEV) return;
  devLogged = true;
  const c = getAcceptJsConfig();
  // Lengths only — no secret values. Helps diagnose env-mismatch issues like E_WC_05.
  console.info("[Accept.js] config", {
    environment: env,
    cdn: src,
    apiLoginIdLength: c.apiLoginID.length,
    clientKeyLength: c.clientKey.length,
  });
}

export async function loadAcceptJs(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Accept.js can only load in the browser.");
  }
  if (window.Accept?.dispatchData) return;
  if (pending) return pending;

  const env = envFromConfig();
  const src = env === "production" ? PRODUCTION_SRC : SANDBOX_SRC;
  logConfigOnce(src, env);

  pending = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-authnet="accept-js"]`) as
      | HTMLScriptElement
      | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = src;
      script.async = true;
      script.dataset.authnet = "accept-js";
      document.head.appendChild(script);
    }
    const onReady = () => {
      if (window.Accept?.dispatchData) {
        resolve();
      } else {
        reject(new Error("Accept.js loaded but window.Accept is missing."));
      }
    };
    script.addEventListener("load", onReady, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Accept.js.")),
      { once: true }
    );
    if (existing && window.Accept?.dispatchData) onReady();
  });

  try {
    await pending;
  } catch (e) {
    pending = null;
    throw e;
  }
}

export type AcceptTokenizeInput = {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cardCode: string;
  zip?: string;
  fullName?: string;
};

export type AcceptTokenizeResult = {
  dataDescriptor: string;
  dataValue: string;
};

export async function tokenizeCard(input: AcceptTokenizeInput): Promise<AcceptTokenizeResult> {
  const { apiLoginID, clientKey } = getAcceptJsConfig();
  if (!apiLoginID || !clientKey) {
    throw new Error(
      "Credit card tokenization is not configured. Set VITE_AUTHNET_API_LOGIN_ID and VITE_AUTHNET_PUBLIC_CLIENT_KEY."
    );
  }

  await loadAcceptJs();
  if (!window.Accept?.dispatchData) {
    throw new Error("Accept.js failed to initialize.");
  }

  // Accept.js wants 2-digit month and 2- or 4-digit year. We send 4-digit year for clarity.
  const month = input.expirationMonth.padStart(2, "0");
  const year =
    input.expirationYear.length === 2 ? `20${input.expirationYear}` : input.expirationYear;

  const secureData: AcceptSecureData = {
    authData: { apiLoginID, clientKey },
    cardData: {
      cardNumber: input.cardNumber.replace(/\s+/g, ""),
      month,
      year,
      cardCode: input.cardCode.trim(),
      zip: input.zip?.trim() || undefined,
      fullName: input.fullName?.trim() || undefined,
    },
  };

  return new Promise<AcceptTokenizeResult>((resolve, reject) => {
    window.Accept!.dispatchData(secureData, (response: AcceptResponse) => {
      if (response.messages.resultCode !== "Ok" || !response.opaqueData) {
        const m = response.messages.message?.[0];
        const code = m?.code || "";
        const text = m?.text || "Card could not be processed.";
        // E_WC_05 = clientKey/apiLoginID rejected by the loaded CDN — usually means env mismatch
        // (production keys against sandbox CDN or vice versa). Surface the code in the message.
        reject(new Error(code ? `${text} [${code}]` : text));
        return;
      }
      resolve({
        dataDescriptor: response.opaqueData.dataDescriptor,
        dataValue: response.opaqueData.dataValue,
      });
    });
  });
}
