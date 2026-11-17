// Describes every editable field. The admin form is generated from this, so
// adding a field to default-content.ts + one line here makes it editable.

export type Field =
  | {
      type: "text" | "textarea" | "number" | "color" | "boolean" | "image" | "tags" | "strings";
      key: string;
      label: string;
      help?: string;
      /** Half-width on desktop. */
      half?: boolean;
    }
  | {
      type: "list";
      key: string;
      label: string;
      help?: string;
      /** Singular name, e.g. "project". */
      item: string;
      /** Field shown as the row title when collapsed. */
      titleKey?: string;
      fields: Field[];
    };

export type Tab = {
  id: string;
  label: string;
  group: "Page sections" | "Site";
  description: string;
  fields: Field[];
};

const t = (key: string, label: string, extra: Partial<Field> = {}): Field => ({ type: "text", key, label, ...extra }) as Field;
const half = { half: true } as const;
const visible: Field = { type: "boolean", key: "visible", label: "Show this section on the site" };
const head: Field[] = [
  t("label", "Small label", { ...half, help: "Shown after the section number, e.g. GET /about" }),
  t("heading", "Heading", half),
];

export const TABS: Tab[] = [
  {
    id: "loader",
    label: "Loading screen",
    group: "Page sections",
    description: "The boot-sequence animation shown before the page appears.",
    fields: [
      { type: "boolean", key: "enabled", label: "Show the loading screen" },
      { type: "number", key: "durationMs", label: "Duration (milliseconds)", ...half },
      t("finalLine", "Last line", half),
      t("topLeft", "Top-left text", half),
      t("topRight", "Top-right text", half),
      t("footer", "Bottom-left text", half),
      {
        type: "list",
        key: "lines",
        label: "Boot log lines",
        item: "line",
        titleKey: "text",
        fields: [t("text", "Step", half), t("detail", "Detail", half)],
      },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    group: "Page sections",
    description: "The first screen: name, tagline, buttons and the live request log.",
    fields: [
      t("status", "Status line"),
      t("firstLine", "Name — first line", half),
      t("outlineWord", "Name — outlined word", half),
      t("lastWord", "Name — last word", half),
      t("scrollHint", "Scroll hint", half),
      { type: "textarea", key: "tagline", label: "Tagline" },
      t("primaryLabel", "Primary button label", half),
      t("primaryHref", "Primary button link", half),
      t("secondaryLabel", "Secondary button label", half),
      t("secondaryHref", "Secondary button link", half),
      t("logTitle", "Request log title", half),
      t("logFooter", "Request log footer", half),
      {
        type: "list",
        key: "logLines",
        label: "Request log lines",
        help: "Four are visible at a time; the rest rotate in.",
        item: "request",
        titleKey: "path",
        fields: [t("method", "Method", half), t("path", "Path", half), t("meta", "Status and time", half)],
      },
    ],
  },
  {
    id: "stats",
    label: "Stats",
    group: "Page sections",
    description: "Numbers that count up when scrolled into view.",
    fields: [
      visible,
      {
        type: "list",
        key: "items",
        label: "Stats",
        item: "stat",
        titleKey: "label",
        fields: [t("value", "Value", { ...half, help: "e.g. 490+ or 1,800+" }), t("label", "Label", half)],
      },
    ],
  },
  {
    id: "marquee",
    label: "Tech ticker",
    group: "Page sections",
    description: "The scrolling strip of technologies.",
    fields: [visible, { type: "tags", key: "items", label: "Items" }],
  },
  {
    id: "about",
    label: "About",
    group: "Page sections",
    description: "Introduction, photo and quick facts.",
    fields: [
      visible,
      t("label", "Small label"),
      { type: "textarea", key: "heading", label: "Heading", help: "Words light up one by one as the visitor scrolls." },
      { type: "strings", key: "paragraphs", label: "Paragraphs" },
      t("snippetComment", "Code card — comment line", half),
      t("snippet", "Code card — code line", half),
      { type: "image", key: "photo", label: "Photo", ...half },
      t("photoCaption", "Photo caption", half),
      {
        type: "list",
        key: "facts",
        label: "Quick facts",
        item: "fact",
        titleKey: "label",
        fields: [t("label", "Label", half), t("value", "Value", half)],
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    group: "Page sections",
    description: "Numbered list of what you offer.",
    fields: [
      visible,
      ...head,
      {
        type: "list",
        key: "items",
        label: "Services",
        item: "service",
        titleKey: "title",
        fields: [t("title", "Title"), { type: "textarea", key: "text", label: "Description" }],
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    group: "Page sections",
    description: "Stacked project cards. Each opens its own detail page with a gallery.",
    fields: [
      visible,
      ...head,
      t("detailLabel", "Detail-page button label", half),
      t("galleryLabel", "Gallery heading", { ...half, help: "Shown above the gallery on every project page." }),
      {
        type: "list",
        key: "items",
        label: "Projects",
        item: "project",
        titleKey: "title",
        fields: [
          t("title", "Title", half),
          t("kind", "Category label", half),
          { type: "textarea", key: "summary", label: "Summary" },
          { type: "image", key: "image", label: "Screenshot", ...half },
          t("frameLabel", "Browser bar text", half),
          {
            type: "list",
            key: "metrics",
            label: "Metrics",
            item: "metric",
            titleKey: "label",
            fields: [t("value", "Value", half), t("label", "Label", half)],
          },
          { type: "tags", key: "tags", label: "Tech tags" },
          { type: "strings", key: "highlights", label: "Case-study highlights" },
          {
            type: "list",
            key: "gallery",
            label: "Gallery",
            help: "Extra screens for the project page. Give each one a label, e.g. Admin dashboard.",
            item: "screen",
            titleKey: "label",
            fields: [{ type: "image", key: "image", label: "Image" }, t("label", "Label")],
          },
          t("liveUrl", "Live link", half),
          t("repoUrl", "Repository link", half),
        ],
      },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    group: "Page sections",
    description: "Work history timeline.",
    fields: [
      visible,
      ...head,
      {
        type: "list",
        key: "items",
        label: "Roles",
        item: "role",
        titleKey: "company",
        fields: [
          t("role", "Role", half),
          t("company", "Company", half),
          t("period", "Period", half),
          t("location", "Location", half),
          { type: "strings", key: "bullets", label: "Bullet points" },
          { type: "tags", key: "tags", label: "Tech tags" },
        ],
      },
    ],
  },
  {
    id: "skills",
    label: "Skills",
    group: "Page sections",
    description: "Skill groups shown as spotlight cards.",
    fields: [
      visible,
      ...head,
      {
        type: "list",
        key: "groups",
        label: "Groups",
        item: "group",
        titleKey: "title",
        fields: [t("title", "Group title"), { type: "tags", key: "items", label: "Skills" }],
      },
    ],
  },
  {
    id: "credentials",
    label: "Education and awards",
    group: "Page sections",
    description: "Degrees, awards and certifications.",
    fields: [
      visible,
      ...head,
      {
        type: "list",
        key: "education",
        label: "Education",
        item: "entry",
        titleKey: "title",
        fields: [t("title", "Degree", half), t("place", "Institution", half), t("period", "Period", half), t("location", "Location", half)],
      },
      {
        type: "list",
        key: "awards",
        label: "Awards and certifications",
        item: "award",
        titleKey: "title",
        fields: [t("title", "Title", half), t("issuer", "Issuer", half), t("year", "Year", half)],
      },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    group: "Page sections",
    description: "Quotes from clients or colleagues. Hidden until you add real ones.",
    fields: [
      visible,
      ...head,
      {
        type: "list",
        key: "items",
        label: "Quotes",
        item: "quote",
        titleKey: "name",
        fields: [
          { type: "textarea", key: "quote", label: "Quote" },
          t("name", "Name", half),
          t("role", "Role and company", half),
          { type: "image", key: "avatar", label: "Avatar", ...half },
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    group: "Page sections",
    description: "Closing call to action, links and the message form.",
    fields: [
      visible,
      t("label", "Small label"),
      t("headingLine1", "Heading — line 1", half),
      t("headingLine2", "Heading — line 2", half),
      t("headingAccent", "Heading — accent word", half),
      { type: "textarea", key: "intro", label: "Intro text" },
      t("email", "Email", half),
      t("phone", "Phone", half),
      { type: "image", key: "resumeUrl", label: "CV file (PDF) or link", help: "Upload a PDF or paste a link. Leave empty to hide the button." },
      { type: "boolean", key: "formEnabled", label: "Show the message form" },
      {
        type: "list",
        key: "socials",
        label: "Social links",
        item: "link",
        titleKey: "label",
        fields: [t("label", "Label", half), t("href", "URL", half)],
      },
    ],
  },
  {
    id: "nav",
    label: "Navigation",
    group: "Site",
    description: "Top menu links and the header button.",
    fields: [
      {
        type: "list",
        key: "links",
        label: "Menu links",
        help: "Links like #about scroll to that section.",
        item: "link",
        titleKey: "label",
        fields: [t("label", "Label", half), t("href", "Link", half)],
      },
      t("ctaLabel", "Header button label", half),
      t("ctaHref", "Header button link", half),
    ],
  },
  {
    id: "site",
    label: "Theme and SEO",
    group: "Site",
    description: "Brand, accent colour, motion options and search metadata.",
    fields: [
      t("name", "Your name"),
      t("logoText", "Logo text", half),
      t("logoAccent", "Logo accent part", half),
      { type: "image", key: "logoImage", label: "Logo image", help: "Shown in the navbar and the admin sidebar. Leave empty to show only the text." },
      { type: "color", key: "accent", label: "Accent colour" },
      { type: "boolean", key: "cursor", label: "Custom animated cursor" },
      { type: "boolean", key: "smoothScroll", label: "Smooth scrolling" },
      t("title", "Browser tab / SEO title"),
      { type: "textarea", key: "description", label: "SEO description" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    group: "Site",
    description: "The strip at the very bottom of the page.",
    fields: [
      t("left", "Left text", half),
      t("center", "Centre text", half),
      t("right", "Right text", half),
      t("timeZone", "Clock time zone", { ...half, help: "IANA name, e.g. Asia/Kolkata" }),
    ],
  },
];

export function blankFromFields(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    out[f.key] =
      f.type === "boolean" ? false : f.type === "number" ? 0 : f.type === "list" || f.type === "tags" || f.type === "strings" ? [] : "";
  }
  return out;
}
