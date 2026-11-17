// Browser helpers shared by the lead form scripts (QuoteForm, CampaignFormScript) for Cloudflare Turnstile.

type TurnstileApi = { reset: (widget?: string | HTMLElement) => void };

/** Get a fresh token after a submit: Turnstile tokens are single-use, and a failed check needs a new one. */
export function resetTurnstile(form: HTMLFormElement) {
  const widget = form.querySelector<HTMLElement>('.cf-turnstile');
  const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
  if (!widget || !api) return;
  try {
    api.reset(widget);
  } catch {
    // The widget may not have rendered (script blocked); the server then rejects the form with a message.
  }
}
