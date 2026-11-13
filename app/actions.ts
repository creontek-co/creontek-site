"use server";

import nodemailer from "nodemailer";
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

/** Where every enquiry is delivered. Server-only: never sent to the browser. */
const ENQUIRY_INBOX = "abrahamosas3@gmail.com";

/** Strip line breaks so visitor input can never add extra mail headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

async function sendEmail(v: EnquiryValues) {
  const user = process.env.SMTP_USER || ENQUIRY_INBOX;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const to = process.env.CONTACT_TO_EMAIL || ENQUIRY_INBOX;
  if (!pass) {
    console.error("Enquiry email skipped: SMTP_PASS is not set.");
    return false;
  }

  // 587 + STARTTLS: port 465 is blocked on some networks.
  const port = Number(process.env.SMTP_PORT) || 587;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    // Gmail only sends as the signed-in account, so the sender is the inbox
    // itself and replies go straight to the visitor.
    from: { name: "CreonTek website", address: user },
    to,
    replyTo: { name: oneLine(v.name), address: oneLine(v.email) },
    subject: oneLine(`New enquiry: ${v.company} (${v.interest})`),
    text: FIELDS.map((f) => `${f}:\n${v[f] || "-"}`).join("\n\n"),
    html: FIELDS.map(
      (f) =>
        `<p><strong>${f}</strong><br>${
          escapeHtml(v[f]).replace(/\n/g, "<br>") || "-"
        }</p>`,
    ).join(""),
  });
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
