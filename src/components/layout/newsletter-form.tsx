"use client";

import { useActionState } from "react";
import { useI18n } from "@/i18n/client";
import { subscribe, type NewsletterState } from "./newsletter-action";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const { locale, dict } = useI18n();
  const [state, action, pending] = useActionState(subscribe, initial);

  const message = {
    idle: null,
    success: dict.footer.subscribed,
    invalid: dict.footer.invalidEmail,
    error: dict.footer.subscribeFailed,
  }[state.status];

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="locale" value={locale} />
      <div className="flex">
        <input
          type="email"
          name="email"
          required
          placeholder={dict.footer.email}
          aria-label={dict.footer.email}
          className="h-11 min-w-0 flex-1 rounded-l-[3px] border border-white/20 bg-white px-3.5 text-[15px] text-ink outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-r-[3px] bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "…" : dict.footer.subscribe}
        </button>
      </div>
      {message && (
        <p role="status" className={state.status === "success" ? "text-sm text-brand" : "text-sm text-sale"}>
          {message}
        </p>
      )}
    </form>
  );
}
