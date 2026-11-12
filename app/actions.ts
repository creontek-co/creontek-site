"use server";

import {
  validateEnquiry,
  type EnquiryField,
  type EnquiryState,
  type EnquiryValues,
} from "@/lib/contact";

const FIELDS: EnquiryField[] = [
  "name",
  "email",
  "company",
  "website",
  "interest",
  "budget",
  "message",
];

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

async function sendEmail(v: EnquiryValues) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "CreonTek <onboarding@resend.dev>",
      to: [to],
      reply_to: v.email,
      subject: `New enquiry: ${v.company} (${v.interest})`,
      html: FIELDS.map(
        (f) => `<p><strong>${f}</strong><br>${escapeHtml(v[f]) || "-"}</p>`,
      ).join(""),
    }),
  });
  if (!res.ok) throw new Error(`Email delivery failed: ${res.status}`);
  return true;
}

async function sendToCrm(v: EnquiryValues) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...v, source: "creontek.co" }),
  });
  if (!res.ok) throw new Error(`CRM delivery failed: ${res.status}`);
  return true;
}

export async function sendEnquiry(
  _prev: EnquiryState,
  form: FormData,
): Promise<EnquiryState> {
  // Honeypot: bots fill it, people never see it.
  if (form.get("fax")) return { status: "success" };

  const values = Object.fromEntries(
    FIELDS.map((f) => [f, String(form.get(f) ?? "")]),
  ) as EnquiryValues;

  const errors = validateEnquiry(values);
  if (Object.keys(errors).length) {
    return {
      status: "error",
      errors,
      message: "Please check the highlighted fields.",
    };
  }

  try {
    const results = await Promise.all([sendEmail(values), sendToCrm(values)]);
    if (results.some(Boolean)) return { status: "success" };
    // Never report success for a message that went nowhere.
    console.error("Enquiry not delivered: no delivery channel is configured.");
  } catch (err) {
    console.error(err);
  }
  return {
    status: "error",
    message:
      "We couldn't send your enquiry just now. Please book a strategy call instead.",
  };
}
