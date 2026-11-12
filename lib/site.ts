/**
 * All editable site content lives here. Anything marked PLACEHOLDER needs real
 * data before launch; see the list in the project README.
 */

export const BOOKING_URL = "https://calendly.com/abrahamosas/strategy-session";
export const SITE_URL = "https://creontek.co";

/** PLACEHOLDER: the brief does not give a contact address. */
export const CONTACT_EMAIL = "hello@creontek.co";

/** PLACEHOLDER: add real profile URLs. Empty entries are not rendered. */
export const SOCIALS: { label: string; href: string }[] = [
  { label: "LinkedIn", href: "" },
  { label: "Instagram", href: "" },
  { label: "X", href: "" },
];

export const NAV_LINKS = [
  { label: "Studio", href: "/studio" },
  { label: "Growth Engine", href: "/growth-engine" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Hide the Proof section until real testimonials exist (brief, scene 9). */
export const SHOW_PROOF = false;

export type Testimonial = {
  quote: string;
  name: string;
  company: string;
  project: string;
};

/** Only ever add real client quotes here. */
export const TESTIMONIALS: Testimonial[] = [];

export type Project = {
  slug: string;
  title: string;
  industry: string;
  result: string;
  offer: "Studio" | "Growth Engine";
  image: string;
  /** Screen recording in /public/media/work, when available. */
  video?: string;
  placeholder: boolean;
  summary: string;
  challenge: string;
  approach: string;
  delivered: string[];
};

/** PLACEHOLDER projects: replace with real work. */
export const PROJECTS: Project[] = [
  {
    slug: "project-one",
    title: "Project one",
    industry: "Architecture & interiors",
    result: "Placeholder result line",
    offer: "Studio",
    image: "/media/placeholders/shot-1.svg",
    placeholder: true,
    summary: "A placeholder for a premium website case study.",
    challenge: "Describe what the client needed and what stood in the way.",
    approach: "Describe how the work was designed and engineered.",
    delivered: ["Website", "Content system", "Care plan"],
  },
  {
    slug: "project-two",
    title: "Project two",
    industry: "Home services",
    result: "Placeholder result line",
    offer: "Growth Engine",
    image: "/media/placeholders/shot-2.svg",
    placeholder: true,
    summary: "A placeholder for a growth system case study.",
    challenge: "Describe where the business was losing growth.",
    approach: "Describe the system that was built to seal the leaks.",
    delivered: ["AI qualification", "Follow-up sequences", "CRM"],
  },
  {
    slug: "project-three",
    title: "Project three",
    industry: "E-commerce brands",
    result: "Placeholder result line",
    offer: "Studio",
    image: "/media/placeholders/shot-3.svg",
    placeholder: true,
    summary: "A placeholder for an e-commerce case study.",
    challenge: "Describe what the client needed and what stood in the way.",
    approach: "Describe how the work was designed and engineered.",
    delivered: ["Storefront", "Checkout", "Care plan"],
  },
  {
    slug: "project-four",
    title: "Project four",
    industry: "Real estate",
    result: "Placeholder result line",
    offer: "Growth Engine",
    image: "/media/placeholders/shot-4.svg",
    placeholder: true,
    summary: "A placeholder for a growth system case study.",
    challenge: "Describe where the business was losing growth.",
    approach: "Describe the system that was built to seal the leaks.",
    delivered: ["Lead sourcing", "Outreach", "Reporting"],
  },
  {
    slug: "project-five",
    title: "Project five",
    industry: "Hospitality",
    result: "Placeholder result line",
    offer: "Studio",
    image: "/media/placeholders/shot-5.svg",
    placeholder: true,
    summary: "A placeholder for a web application case study.",
    challenge: "Describe what the client needed and what stood in the way.",
    approach: "Describe how the work was designed and engineered.",
    delivered: ["Web application", "Booking flow", "Care plan"],
  },
  {
    slug: "project-six",
    title: "Project six",
    industry: "Professional services",
    result: "Placeholder result line",
    offer: "Growth Engine",
    image: "/media/placeholders/shot-6.svg",
    placeholder: true,
    summary: "A placeholder for a growth system case study.",
    challenge: "Describe where the business was losing growth.",
    approach: "Describe the system that was built to seal the leaks.",
    delivered: ["Automations", "CRM sync", "Live reporting"],
  },
];

export const INDUSTRIES = [
  {
    name: "Real estate",
    line: "Sites that sell the listing and systems that chase every lead.",
    image: "/media/placeholders/shot-4.svg",
  },
  {
    name: "Home services",
    line: "Systems that answer every enquiry and fill the calendar.",
    image: "/media/placeholders/shot-2.svg",
  },
  {
    name: "Hospitality",
    line: "Booking experiences guests remember before they arrive.",
    image: "/media/placeholders/shot-5.svg",
  },
  {
    name: "Professional services",
    line: "A sharper first impression and a pipeline that qualifies itself.",
    image: "/media/placeholders/shot-6.svg",
  },
  {
    name: "Architecture & interiors",
    line: "Portfolios crafted to the standard of the work inside them.",
    image: "/media/placeholders/shot-1.svg",
  },
  {
    name: "E-commerce brands",
    line: "Storefronts engineered to turn visitors into customers.",
    image: "/media/placeholders/shot-3.svg",
  },
];

export const HOW_WE_WORK = [
  { title: "Diagnose", line: "We find where growth is being lost." },
  { title: "Build", line: "We design and engineer the system or experience." },
  { title: "Operate", line: "We run, monitor and improve it every month." },
];

export const BLUEPRINT_STAGES = [
  {
    label: "00 · The blueprint",
    head: "Every business loses growth somewhere.",
    body: "Growth Engine starts with a plan of your business: where customers come in, where they convert, and where they quietly slip away.",
  },
  {
    label: "01 · The plan",
    head: "We map how your business actually runs.",
    body: "Every business has the same four rooms: how you attract customers, convert enquiries, follow up and operate. We draw yours first.",
  },
  {
    label: "02 · Diagnose",
    head: "Then we find the leaks.",
    body: "Each business leaks somewhere different. We trace exactly where customers, revenue and hours are escaping.",
  },
  {
    label: "03 · Engineer",
    head: "We build the system that seals them.",
    body: "AI agents, automations, CRM and follow-up sequences, connected into one engine and designed around your leaks.",
  },
  {
    label: "04 · Built",
    head: "Designed. Engineered. Built.",
    body: "A growth system that runs every day, and gets monitored and improved month after month.",
  },
];

export const GROWTH_PROBLEMS = [
  {
    title: "Not enough customers",
    steps: [
      "Ideal-customer map",
      "Lead sourcing",
      "Personalised outreach",
      "Booked sales calls",
    ],
    outcome: "A steady pipeline that doesn't wait on referrals.",
    loop: false,
  },
  {
    title: "Enquiries don't convert",
    steps: [
      "Instant response",
      "AI qualification",
      "Quote or proposal",
      "Booked job",
    ],
    outcome: "More enquiries turn into paying customers.",
    loop: false,
  },
  {
    title: "Nobody follows up",
    steps: [
      "Every lead logged",
      "Timed follow-ups",
      "Old-lead reactivation",
      "Back in the pipeline",
    ],
    outcome: "No customer slips through the cracks.",
    loop: true,
  },
  {
    title: "Too much manual work",
    steps: [
      "Repetitive-task audit",
      "Automations",
      "CRM sync",
      "Live reporting",
    ],
    outcome: "Hours back every week for the work that matters.",
    loop: false,
  },
];

export const GROWTH_INCLUDED = [
  {
    item: "Diagnosis & blueprint",
    scope: "A map of how your business runs and where growth is being lost.",
    phase: "Implementation",
  },
  {
    item: "System build & integration",
    scope: "The connected system, wired into the tools you already use.",
    phase: "Implementation",
  },
  {
    item: "AI agents & automations",
    scope: "Agents and workflows for outreach, qualification and follow-up.",
    phase: "Implementation",
  },
  {
    item: "CRM & reporting",
    scope: "One record of every lead, with live reporting on what's working.",
    phase: "Implementation",
  },
  {
    item: "Monthly management & optimisation",
    scope: "We run, monitor and improve the system every month.",
    phase: "Monthly",
  },
];

export const STUDIO_SERVICES = [
  {
    title: "Premium Websites",
    line: "Brand-defining sites that elevate how a business is perceived.",
    image: "/media/placeholders/shot-1.svg",
  },
  {
    title: "Web Applications",
    line: "Custom products and portals, engineered to last.",
    image: "/media/placeholders/shot-5.svg",
  },
  {
    title: "E-commerce",
    line: "Storefronts built to turn visitors into customers.",
    image: "/media/placeholders/shot-3.svg",
  },
];

/** PLACEHOLDER durations: confirm against how the studio really works. */
export const STUDIO_PROCESS = [
  {
    step: "Discover",
    line: "Business goals, audience, positioning and scope.",
    time: "Week 1",
    from: 0,
    span: 1,
  },
  {
    step: "Design",
    line: "Art direction, key pages and motion, all prototyped.",
    time: "Weeks 2–4",
    from: 1,
    span: 3,
  },
  {
    step: "Build",
    line: "Engineering, content and performance.",
    time: "Weeks 4–7",
    from: 3,
    span: 4,
  },
  {
    step: "Launch",
    line: "Testing, launch and handover to your care plan.",
    time: "Week 8",
    from: 7,
    span: 1,
  },
];

/** PLACEHOLDER values, as the brief specifies. */
export const CARE_PLANS = [
  {
    name: "Essential",
    price: "from $150/month",
    items: ["Managed hosting", "Security & maintenance", "Monthly updates"],
  },
  {
    name: "Growth",
    price: "from $400/month",
    items: [
      "Everything in Essential",
      "Priority updates",
      "Performance reporting",
    ],
  },
  {
    name: "Partner",
    price: "from $900/month",
    items: [
      "Everything in Growth",
      "Ongoing development",
      "A dedicated monthly build allowance",
    ],
  },
];

export const PAGE_META = {
  home: {
    title: "CreonTek | Technology that moves businesses forward",
    description:
      "Exceptional digital experiences and AI growth systems for businesses that refuse to stand still.",
  },
  studio: {
    title: "Studio | Premium digital experiences, engineered for business",
    description:
      "Premium websites, web applications and e-commerce that communicate a brand's value, elevate its perception and turn visitors into customers.",
  },
  growth: {
    title: "Growth Engine | AI growth systems",
    description:
      "AI growth systems that help businesses attract more customers, convert more opportunities and grow revenue.",
  },
};
