/**
 * All editable site content lives here. Anything marked PLACEHOLDER needs real
 * data before launch; see the list in the project README.
 */

export const BOOKING_URL = "https://calendly.com/abrahamosas/strategy-session";
export const SITE_URL = "https://creontek.co";

/** PLACEHOLDER: the brief does not give a contact address. */
export const CONTACT_EMAIL = "hello@creontek.co";

export type SocialNetwork = "instagram" | "linkedin" | "x" | "tiktok";

/**
 * PLACEHOLDER: paste each full profile URL into `href`. A link with an empty
 * href is hidden everywhere (footer, mobile menu, contact page, search data).
 */
export const SOCIALS: { network: SocialNetwork; label: string; href: string }[] = [
  { network: "instagram", label: "Instagram", href: "https://www.instagram.com/creontek/" },
  { network: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/creontek/" },
  { network: "x", label: "X", href: "https://x.com/CreonTek" },
  { network: "tiktok", label: "TikTok", href: "https://vm.tiktok.com/ZS9fC7yFE672A-jxRSw/" },
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
    slug: "hartley-voss",
    title: "Hartley Voss",
    industry: "Architecture & interiors",
    result: "A portfolio that presents each building like a gallery piece",
    offer: "Studio",
    image: "/media/work/shot-1-architecture-home.png",
    video: "/media/work/studio-1-architecture-hartley-voss.mp4",
    placeholder: false,
    summary: "A portfolio website for an architecture and interiors practice, built around a horizontal gallery and immersive project pages.",
    challenge: "Architecture is sold on atmosphere, but most practice websites reduce years of work to a grid of thumbnails. The practice needed a site that gave each project room to breathe and made a prospective client want to keep looking.",
    approach: "We designed a horizontal gallery that scrolls like a walk through an exhibition, with each project opening into a full-screen page. Project pages pair large photography with the facts a client asks for first, and a floor plan that draws itself as you scroll.",
    delivered: ["Website", "Content system", "Scroll animation", "Care plan"],
  },
  {
    slug: "northfield-plumbing",
    title: "Northfield Plumbing & Heating",
    industry: "Home services",
    result: "Missed calls answered by text in seconds and turned into booked jobs",
    offer: "Growth Engine",
    image: "/media/work/shot-5-home-services-live-desk.png",
    video: "/media/work/growth-1-home-services-live-desk.mp4",
    placeholder: false,
    summary: "A live desk for a plumbing and heating company, where an AI assistant answers missed calls by text, qualifies the job and books a technician.",
    challenge: "Emergency calls arrive when every technician is on a job or the office is closed. Each unanswered call was a customer who rang the next company on the list.",
    approach: "We built an assistant that texts back as soon as a call is missed, finds out what is wrong and how urgent it is, and offers a real arrival window. The office sees the conversation, a drafted job and the best-placed technician, and confirms with one click.",
    delivered: ["AI qualification & booking", "Missed-call text back", "Dispatch schedule", "CRM & reporting"],
  },
  {
    slug: "halden",
    title: "Halden",
    industry: "E-commerce brands",
    result: "A storefront that feels as considered as the product",
    offer: "Studio",
    image: "/media/work/shot-2-ecommerce-home.png",
    video: "/media/work/studio-2-ecommerce-halden.mp4",
    placeholder: false,
    summary: "An online store for a small-batch fragrance house, designed to sell a premium product without discount-store clutter.",
    challenge: "A fragrance cannot be smelled through a screen, so the store has to carry the whole impression of quality. Template storefronts made a carefully made product look like everything else on the shelf.",
    approach: "We led with photography and quiet typography, then kept the buying path short: collection, product, size, bag. Notes and delivery details sit in expandable sections, and a slide-in bag lets shoppers confirm an order without leaving the page.",
    delivered: ["Storefront", "Checkout", "Product pages", "Follow-up email sequences", "Care plan"],
  },
  {
    slug: "carrow-and-finch",
    title: "Carrow and Finch",
    industry: "Real estate",
    result: "A new listing in front of every matching buyer on day one",
    offer: "Growth Engine",
    image: "/media/work/shot-6-real-estate-launch-kit.png",
    video: "/media/work/growth-2-real-estate-listing-launch.mp4",
    placeholder: false,
    summary: "A listing launch system for an estate agency that writes the marketing, matches past enquiries to the property and fills the first open house.",
    challenge: "Every new instruction meant hours of writing descriptions, posts and emails, while thousands of past buyer enquiries sat unused in the database. Good buyers only heard about a property once it reached the portals.",
    approach: "We built a launch kit that turns photos and the agent's notes into a portal description, a social post and a personal email for each matched buyer. One click sends it, and a live view tracks opens, replies and viewing slots as they fill.",
    delivered: ["Lead generation & outreach", "AI content generation", "Viewing booking", "Campaign reporting"],
  },
  {
    slug: "linden-health",
    title: "Linden Health",
    industry: "Healthcare",
    result: "Booking a clinician in three steps, without a phone call",
    offer: "Studio",
    image: "/media/work/shot-3-clinic-app-home.png",
    video: "/media/work/studio-3-clinic-web-app-linden-health.mp4",
    placeholder: false,
    summary: "A patient web application for a private clinic, combining a personal health dashboard with a three-step booking flow.",
    challenge: "Patients were booking by phone and chasing results by email, which tied up the front desk and made a premium clinic feel dated. The clinic wanted one calm place for visits, results and messages.",
    approach: "We built a dashboard that opens on the next visit, recent results and the care team, with booking one click away. The booking flow asks for a reason, a clinician and a time, and a running summary shows the patient exactly what they are confirming.",
    delivered: ["Web application", "Patient dashboard", "Booking flow", "Care plan"],
  },
  {
    slug: "aldgate-advisory",
    title: "Aldgate Advisory",
    industry: "Professional services",
    result: "Client onboarding reduced to one approval",
    offer: "Growth Engine",
    image: "/media/work/shot-8-professional-services-automation.png",
    video: "/media/work/growth-3-professional-services-automation.mp4",
    placeholder: false,
    summary: "An onboarding automation for an accountancy firm that takes a new enquiry from web form to signed client with one human approval.",
    challenge: "Winning a client meant days of manual work: researching the company, drafting a proposal, chasing signatures and documents, setting up billing. Enquiries cooled while the paperwork caught up.",
    approach: "We mapped the process into eight steps and automated seven of them. AI reads the enquiry, drafts the proposal from the firm's own fee table and sends it to a partner to approve, then signature, document requests, billing and the kickoff call follow on their own.",
    delivered: ["AI agents & automation", "Proposal drafting", "E-signature and document collection", "Automation dashboard"],
  },
];

export const INDUSTRIES = [
  {
    name: "Real estate",
    line: "Sites that sell the listing and systems that chase every lead.",
    image: "/media/work/shot-7-real-estate-live-results.png",
  },
  {
    name: "Home services",
    line: "Systems that answer every enquiry and fill the calendar.",
    image: "/media/work/shot-5-home-services-live-desk.png",
  },
  {
    name: "Healthcare",
    line: "Better patient experiences and smarter systems that keep care moving.",
    image: "/media/work/shot-3-clinic-app-home.png",
  },
  {
    name: "Professional services",
    line: "A sharper first impression and a pipeline that qualifies itself.",
    image: "/media/work/shot-8-professional-services-automation.png",
  },
  {
    name: "Architecture & interiors",
    line: "Portfolios crafted to the standard of the work inside them.",
    image: "/media/work/shot-1-architecture-home.png",
  },
  {
    name: "E-commerce brands",
    line: "Storefronts engineered to turn visitors into customers.",
    image: "/media/work/shot-4-ecommerce-product-page.png",
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
    image: "/media/work/shot-luxury-homepage-ravenmoor.png",
  },
  {
    title: "Web Applications",
    line: "Custom products and portals, engineered to last.",
    image: "/media/work/shot-saas-homepage-kestrel.png",
  },
  {
    title: "E-commerce",
    line: "Storefronts built to turn visitors into customers.",
    image: "/media/work/shot-quikprint-homepage.png",
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
    time: "Weeks 2-3",
    from: 1,
    span: 3,
  },
  {
    step: "Build",
    line: "Engineering, content and performance.",
    time: "Weeks 3-5",
    from: 3,
    span: 4,
  },
  {
    step: "Launch",
    line: "Testing, launch and handover to your care plan.",
    time: "Week 6",
    from: 7,
    span: 1,
  },
];

/** PLACEHOLDER values, as the brief specifies. */
export const CARE_PLANS = [
  {
    name: "Essential",
    price: "from $149/month",
    items: ["Managed hosting", "Security & maintenance", "Monthly updates"],
  },
  {
    name: "Growth",
    price: "from $399/month",
    items: [
      "Everything in Essential",
      "Priority updates",
      "Performance reporting",
    ],
  },
  {
    name: "Partner",
    price: "from $899/month",
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
