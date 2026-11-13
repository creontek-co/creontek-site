"use client";

import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { sendEnquiry } from "@/app/actions";
import {
  BUDGETS,
  INTEREST_GROUPS,
  NOT_SURE,
  validateField,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryState,
} from "@/lib/contact";
import { BOOKING_URL } from "@/lib/site";
import { playError, playSuccess } from "@/lib/sound";
import { getLenis } from "./SmoothScroll";

const initial: EnquiryState = { status: "idle" };

function Field({
  name,
  label,
  error,
  children,
  optional,
}: {
  name: EnquiryField;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`field ${error ? "has-error" : ""}`} data-field={name}>
      <label htmlFor={`f-${name}`}>
        {label}
        {optional ? <em> Optional</em> : null}
      </label>
      {children}
      <p className="field-error" id={`f-${name}-error`} role="alert">
        {error}
      </p>
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendEnquiry, initial);
  const [touched, setTouched] = useState<EnquiryErrors>({});
  const [dismissed, setDismissed] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  // A route hidden by Activity must not come back showing an old result.
  useLayoutEffect(() => {
    const el = form.current;
    return () => {
      el?.reset();
      setTouched({});
      setDismissed(true);
    };
  }, []);

  useEffect(() => {
    if (state.status === "success") playSuccess();
    else if (state.status === "error") playError();
  }, [state]);

  // The long form collapses into a short message, which would leave the
  // page scrolled down at the footer. Bring the thank-you into view instead.
  const showSuccess = state.status === "success" && !dismissed;
  const done = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = done.current;
    if (!showSuccess || !el) return;
    const modal = el.closest("dialog");
    if (modal) {
      modal.scrollTo({ top: 0 });
    } else {
      const top =
        el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.22;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(Math.max(0, top), { immediate: true, force: true });
      else window.scrollTo({ top: Math.max(0, top) });
    }
    el.querySelector("h3")?.focus({ preventScroll: true });
  }, [showSuccess]);

  const errorFor = (f: EnquiryField) =>
    touched[f] ?? (dismissed ? undefined : state.errors?.[f]);

  const check = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const f = e.target.name as EnquiryField;
    setTouched((t) => ({ ...t, [f]: validateField(f, e.target.value) }));
  };

  const a11y = (f: EnquiryField) => ({
    id: `f-${f}`,
    name: f,
    onBlur: check,
    "aria-invalid": errorFor(f) ? true : undefined,
    "aria-describedby": `f-${f}-error`,
  });

  if (showSuccess) {
    return (
      <div className="form-success" role="status" ref={done}>
        <h3 tabIndex={-1}>Thank you. Your enquiry is with us.</h3>
        <p>We&apos;ll be in touch soon. If it&apos;s easier, you can pick a time now.</p>
        <a
          className="btn"
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a strategy call
        </a>
      </div>
    );
  }

  return (
    <form
      ref={form}
      className="contact-form"
      noValidate
      action={(data) => {
        setDismissed(false);
        setTouched({});
        action(data);
      }}
    >
      <div className="form-grid">
        <Field name="name" label="Name" error={errorFor("name")}>
          <input type="text" autoComplete="name" {...a11y("name")} />
        </Field>
        <Field name="email" label="Email" error={errorFor("email")}>
          <input type="email" autoComplete="email" {...a11y("email")} />
        </Field>
        <Field name="company" label="Company" error={errorFor("company")}>
          <input
            type="text"
            autoComplete="organization"
            {...a11y("company")}
          />
        </Field>
        <Field
          name="website"
          label="Website"
          error={errorFor("website")}
          optional
        >
          <input type="text" autoComplete="url" {...a11y("website")} />
        </Field>
        <Field
          name="interest"
          label="I'm interested in"
          error={errorFor("interest")}
        >
          <select defaultValue="" {...a11y("interest")}>
            <option value="" disabled>
              Choose one
            </option>
            {INTEREST_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </optgroup>
            ))}
            <option>{NOT_SURE}</option>
          </select>
        </Field>
        <Field name="budget" label="Budget" error={errorFor("budget")}>
          <select defaultValue="" {...a11y("budget")}>
            <option value="" disabled>
              Choose one
            </option>
            {BUDGETS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field name="message" label="Message" error={errorFor("message")}>
        <textarea rows={5} {...a11y("message")} />
      </Field>

      <div className="hp" aria-hidden="true">
        <label>
          Fax
          <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && state.message && !dismissed ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Sending" : "Send enquiry"}
        </button>
        <a
          className="text-link"
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Or book a strategy call
        </a>
      </div>
    </form>
  );
}
