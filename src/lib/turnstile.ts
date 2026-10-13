// Cloudflare Turnstile (privacy-friendly CAPTCHA, usually invisible).
// Optional: without TURNSTILE_SECRET_KEY / NEXT_PUBLIC_TURNSTILE_SITE_KEY the check is skipped,
// so the site works before Cloudflare is set up. Honeypot + rate limit still apply.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(
  token: string | undefined,
  secret: string,
  remoteIp?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const res = await fetchImpl(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8_000) });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    // If Cloudflare is unreachable, don't lose a real seller: let the lead through.
    // Honeypot and rate limit still protect the form.
    console.error("verifyTurnstile: Cloudflare unreachable, allowing submission", error);
    return true;
  }
}
