import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const fullUrl = window.location.href;
    const search = window.location.search;
    const hash = window.location.hash;
    const params = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.substring(1));

    const returnTo = params.get("returnTo") || "/";
    const code = params.get("code");
    const accessToken = hashParams.get("access_token");

    const doRedirect = (success: boolean) => {
      window.location.replace(success ? returnTo : "/sign-in");
    };

    if (params.get("error")) {
      console.error("[AuthCallback] OAuth error:", params.get("error"), params.get("error_description"));
      doRedirect(false);
      return;
    }

    if (accessToken) {
      // Implicit flow — tokens in hash (Google)
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        doRedirect(!!session);
      }, 800);
    } else if (code) {
      // PKCE flow — exchange code
      supabase.auth.exchangeCodeForSession(fullUrl)
        .then(({ data, error }) => {
          if (!error && data?.session) {
            doRedirect(true);
          } else {
            console.error("[AuthCallback] Code exchange failed:", error);
            doRedirect(false);
          }
        });
    } else {
      // No tokens — check existing session or wait
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          doRedirect(true);
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            doRedirect(true);
          }
        });

        setTimeout(async () => {
          subscription.unsubscribe();
          const { data: { session } } = await supabase.auth.getSession();
          doRedirect(!!session);
        }, 10000);
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Completing sign in…</p>
      </div>
    </div>
  );
}
