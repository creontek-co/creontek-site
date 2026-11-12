/** The services a visitor can ask about, grouped by offer in the dropdown. */
export const INTEREST_GROUPS = [
  {
    label: "Studio",
    options: [
      "Premium website",
      "Web application",
      "E-commerce store",
      "Website care plan",
    ],
  },
  {
    label: "Growth Engine",
    options: [
      "Lead generation & outreach",
      "AI qualification & booking",
      "Follow-up sequences",
      "AI agents & automation",
      "CRM & reporting",
      "Full growth system",
    ],
  },
];
export const NOT_SURE = "Not sure yet";
const INTERESTS = [...INTEREST_GROUPS.flatMap((g) => g.options), NOT_SURE];

export const BUDGETS = [
  "Under $5k",
  "$5–15k",
  "$15–40k",
  "$40k+",
  "Not sure",
] as const;

export type EnquiryField =
  | "name"
  | "email"
  | "company"
  | "website"
  | "interest"
  | "budget"
  | "message";

export type EnquiryValues = Record<EnquiryField, string>;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: EnquiryErrors;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Runs in the browser for inline errors and again on the server. */
export function validateField(field: EnquiryField, raw: string) {
  const v = raw.trim();
  switch (field) {
    case "name":
      return v ? undefined : "Please tell us your name.";
    case "email":
      return EMAIL.test(v) ? undefined : "Please enter a valid email address.";
    case "company":
      return v ? undefined : "Please tell us your company.";
    case "website":
      if (!v) return undefined;
      return /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v)
        ? undefined
        : "Please enter a valid website, or leave this blank.";
    case "interest":
      return INTERESTS.includes(v) ? undefined : "Please choose one.";
    case "budget":
      return (BUDGETS as readonly string[]).includes(v)
        ? undefined
        : "Please choose one.";
    case "message":
      return v.length >= 20
        ? undefined
        : "Please write at least 20 characters.";
  }
}

export function validateEnquiry(values: EnquiryValues) {
  const errors: EnquiryErrors = {};
  (Object.keys(values) as EnquiryField[]).forEach((f) => {
    const e = validateField(f, values[f]);
    if (e) errors[f] = e;
  });
  return errors;
}
