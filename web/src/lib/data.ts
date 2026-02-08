export const stats = [
  {
    label: "Households reached",
    value: "18.4k",
    detail: "Neighbors now confident with safe battery handling and data wipes",
  },
  {
    label: "Safe drop-offs guided",
    value: "3,120+",
    detail: "Pieces of e-waste handed to certified recyclers this year",
  },
  {
    label: "Students trained",
    value: "12.6k",
    detail: "Students introduced to repair basics and reuse ethics",
  },
];

export const ewasteImages = [
  "/uploads/battery-safety-kit.png",
  "/uploads/ewaste-bin.jpg",
  "/uploads/device-wiping.png",
  "/uploads/safe-sorting-bin.png",
  "/uploads/recycling-old-laptops.jpg",
];

export const storyImages = [
  "/uploads/IMG_4707.jpeg",
  "/uploads/IMG_4708.jpeg",
  "/uploads/IMG_4748.png",
  "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
  "https://images.unsplash.com/photo-1624508357165-87a393e91cee?w=800",
];

export const navItems = [
  { label: "Forum & Stories", href: "/stories" },
  { label: "Learning Guides", href: "/diy" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
];

export const submitCta = {
  title: "Share your story or idea",
  description: "Send the safety tip, ad, or workshop notes you're testing so neighbors can build on it.",
  email: "admin@emade.social",
  buttonText: "Send us your idea",
};

export const galleryContent = {
  hero: {
    eyebrow: "Field archive",
    title: "Community safety gallery",
    description:
      "Photos from clinics, drop-offs, and the fixes our communities run every week.",
  },
  sections: [
    {
      id: "ewaste",
      eyebrow: "E-waste scenes",
      title: "Impact & context",
      description: "Document the setup and context so others can copy it at home.",
    },
    {
      id: "story-slides",
      eyebrow: "Community stories",
      title: "Story highlights",
      description: "Spotlight lessons worth revisiting at the next forum night.",
    },
    {
      id: "story-covers",
      eyebrow: "Story covers",
      title: "Featured stories",
      description: "Pulled straight from the stories neighbors published and approved.",
    },
    {
      id: "diy-covers",
      eyebrow: "Playbook covers",
      title: "DIY safety playbooks",
      description: "Kept fresh from the DIY playbooks we maintain together.",
    },
  ],
};

export const galleryTiles = [
  {
    id: "tile-field-kit",
    title: "Battery triage bench",
    description: "Emergency bins, tape, and notes ready for the next pop-up clinic.",
    src: "/uploads/ewaste-bin.jpg",
    size: "spotlight",
  },
  {
    id: "tile-community-map",
    title: "Community recycler map",
    description: "Printed drop-off map we keep on every workshop table.",
    src: "/uploads/recycling-old-laptops.jpg",
    size: "landscape",
  },
  {
    id: "tile-safe-sort",
    title: "Safe sorting bins",
    description: "Sorting station built from recycled crates and sand buckets.",
    src: "/uploads/safe-sorting-bin.png",
    size: "portrait",
  },
  {
    id: "tile-data-wipe",
    title: "Data wipe checklist",
    description: "Checklist cards laminated for wipe clinics and libraries.",
    src: "/uploads/device-wiping.png",
    size: "square",
  },
  {
    id: "tile-youth-lab",
    title: "Youth repair lab",
    description: "Teens cataloguing chargers and labeling hazardous cells.",
    src: "/uploads/battery-safety-kit.png",
    size: "landscape",
  },
];

export const stories = [
  {
    title: "What e-waste does to air, water, and workers",
    slug: "what-e-waste-does-to-air-water-and-workers",
    category: "Learning",
    excerpt:
      "A community teach-in mapped how informal burning and acid baths harm lungs, soil, and livelihoods.",
    body:
      "Residents documented smoke patterns near dump sites, mapped wind directions, and logged which days burning was most frequent. Facilitators explained which components release toxic fumes when heated and how acids leach into groundwater, tying each hazard to visible symptoms people already felt at home.\n\nThe group collected water samples from wells and drainage canals and compared them to safe-handling guidance. Stories from workers and caregivers grounded the conversation in lived reality, and a health worker outlined immediate steps for reducing exposure—masking, avoiding open-air burning, and segregating batteries and circuit boards.\n\nThe session ended with a neighborhood plan: a phone tree for safe drop-off referrals, a public map of certified recyclers, and a monthly teach-in to track progress. Several families committed to host sorting stations and to report illegal dumping through the hotline.",
    author: "Amina Patel",
    time: "7 min read",
    status: "active",
    imageUrl: "/uploads/IMG_4707.jpeg",
    pdfUrl: "",
    tags: ["health", "awareness", "community"],
  },
  {
    title: "Data wiping and donation ethics",
    slug: "data-wiping-and-donation-ethics",
    category: "Guide",
    excerpt:
      "A step-by-step workshop helped families wipe devices safely before donating or recycling.",
    body:
      "The workshop opened with a simple truth: deleting files is not the same as removing data. Facilitators demonstrated the difference between factory reset, secure erase, and full disk encryption, and explained why SIM/SD cards can still expose personal information if left inside devices.\n\nParticipants practiced a step-by-step wipe flow for phones, laptops, and tablets, using a checklist that includes account sign-out, device encryption, and proof-of-wipe documentation. Donation centers shared what they need to accept devices safely—clear labels, device condition notes, and batteries removed or taped.\n\nThe group also covered when not to donate: swollen batteries, cracked screens with exposed cells, water damage, or unknown provenance. Every attendee left with a vetted list of certified e-waste partners and a printable card to post at community drop-offs.",
    author: "Diego Chen",
    time: "5 min read",
    status: "active",
    imageUrl: "/uploads/IMG_4708.jpeg",
    pdfUrl: "",
    tags: ["privacy", "safety", "education"],
  },
  {
    title: "Battery safety: what never to open",
    slug: "battery-safety-what-never-to-open",
    category: "Safety",
    excerpt:
      "A safety circle focused on lithium battery risks and how to recognize damage before handling e-waste.",
    body:
      "The safety circle began with real examples of damaged batteries and what to look for: swelling, punctures, leaks, and unusual heat. Participants learned how lithium cells behave under pressure and why even small punctures can trigger fires or toxic smoke.\n\nHands-on practice followed: taping battery terminals, isolating damaged cells in sand-filled containers, and labeling hazards clearly for transport. A short role-play demonstrated how to explain risks to neighbors without shaming and how to document incidents for local health teams.\n\nThe takeaway was clear: never open or crush lithium cells at home, and never toss them in household trash. The group compiled a shared list of drop-off points and scheduled a quarterly collection day with a certified recycler.",
    author: "Salvador Nnadozie",
    time: "4 min read",
    status: "active",
    imageUrl: "/uploads/IMG_4748.png",
    pdfUrl: "",
    tags: ["battery", "hazard", "care"],
  },
];

export const diyProjects = [
  {
    name: "Battery safety drop-off kit",
    difficulty: "Starter",
    time: "40 minutes",
    outcome: "Build a simple, safe bin for household battery collection and transport.",
    status: "published",
    imageUrl: "/uploads/battery-safety-kit.png",
    steps: [
      "Line a sturdy plastic container with a non-conductive liner and add a lid.",
      "Tape battery terminals, separate damaged cells in a sand-filled pouch, and label hazards.",
      "Post pickup instructions and deliver to a certified drop-off partner weekly.",
    ],
    impact: "Prevents fires, chemical exposure, and unsafe household disposal.",
    pdfUrl: "/pdfs/solar-thrift-lantern.pdf",
  },
  {
    name: "Device wipe & reset station",
    difficulty: "Starter",
    time: "60 minutes",
    outcome: "Set up a public table that helps families wipe devices before donating.",
    status: "published",
    imageUrl: "/uploads/device-wiping.png",
    steps: [
      "Print quick-start wipe cards for common phones, laptops, and tablets.",
      "Provide USB wipes, cable adapters, and a checklist to remove SIM/SD cards.",
      "Tag devices as donated or recycle-only and route to a partner org.",
    ],
    impact: "Protects privacy and improves safe reuse pathways.",
    pdfUrl: "/pdfs/mesh-node-lunchbox.pdf",
  },
  {
    name: "Home e-waste sorting station",
    difficulty: "Builder",
    time: "35 minutes",
    outcome: "Create a labeled sorting area so families separate devices safely.",
    status: "published",
    imageUrl: "/uploads/safe-sorting-bin.png",
    steps: [
      "Set up labeled bins: batteries, small devices, cords, and hazardous items.",
      "Add a printed decision guide for repair vs. recycle and a drop-off schedule.",
      "Keep a simple log to track what leaves the home and where it goes.",
    ],
    impact: "Reduces unsafe mixing and makes recycling follow-through easier.",
    pdfUrl: "/pdfs/air-quality-kiosk.pdf",
  },
];

export const teamMembers = [
  {
    name: "Vroon Tetteh",
    role: "Community Health Lead",
    focus: "Leads home visits and safety drills that cut down exposure risks",
    avatar: "IM",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    socials: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "X", url: "https://x.com" },
    ],
  },
  {
    name: "Justice Opoku Nontwiri",
    role: "Technologist & Builder",
    focus: "Builds web tools and robotics projects alongside local partners",
    avatar: "JN",
    imageUrl: "https://justiceopokunon.github.io/DSC_2866_Original.jpeg",
    socials: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/justiceopokunon" },
      { label: "GitHub", url: "https://github.com/justiceopokunon" },
      { label: "Email", url: "mailto:justiceopokunon@gmail.com" },
      { label: "X", url: "https://twitter.com/justiceopokunon" },
      { label: "Instagram", url: "https://www.instagram.com/iam.just.ice" },
    ],
  },
  {
    name: "Ghost",
    role: "Learning Experience",
    focus: "Designs materials neighbors can run without tech jargon",
    avatar: "LH",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    socials: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "GitHub", url: "https://github.com" },
    ],
  },
  {
    name: "Ravi Narang",
    role: "Field Organizer",
    focus: "Runs collection drives and keeps recycler agreements current",
    avatar: "RN",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    socials: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "Email", url: "mailto:ravi@example.com" },
    ],
  },
];

export const adminPanels = [
  {
    title: "Hero message",
    description: "Update the above-the-fold promise and CTA destinations.",
  },
  {
    title: "DIY blueprints",
    description: "Add new builds, attach safety checks, and publish bill of materials.",
  },
  {
    title: "Forum threads",
    description: "Moderate signals, escalate breakthroughs, and archive completed pilots.",
  },
  {
    title: "Impact telemetry",
    description: "Validate reported tonnage and sync with public dashboards weekly.",
  },
];

export const contactChannels = [
  {
    label: "Instagram",
    detail: "Updates from clinics, safety reminders, and quick wins",
    href: "https://instagram.com/emade.social",
  },
  {
    label: "Partnerships",
    detail: "Start a program or offer support",
    href: "mailto:admin@emade.social",
  },
  {
    label: "Press",
    detail: "Reach us for interviews or coverage",
    href: "mailto:admin@emade.social",
  },
  {
    label: "Community",
    detail: "Report unsafe dumping or request a workshop",
    href: "/stories",
  },
  {
    label: "Learning guides",
    detail: "Grab printable guides and DIY steps",
    href: "/diy",
  },
];

export async function readJsonFile<T>(filePath: string, fallbackData: T): Promise<T> {
  // Avoid importing `fs` when this module is bundled for the browser.
  if (typeof window !== "undefined") return fallbackData;
  try {
    const { promises: fs } = await import("fs");
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallbackData;
  } catch {
    return fallbackData;
  }
}
