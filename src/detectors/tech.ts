export interface TechInfo {
  name: string;
  version?: string;
  category: string;
}

interface DetectionRule {
  name: string;
  category: string;
  // Patterns to match against script src, link href, inline HTML, or meta tags
  patterns: RegExp[];
  // Optional: extract version from matched string
  versionPattern?: RegExp;
}

const RULES: DetectionRule[] = [
  // ── Frontend Frameworks ──────────────────────────────
  {
    name: "React",
    category: "Frontend Framework",
    patterns: [
      /react[\.\-\/][\d\.]+/i,
      /react-dom/i,
      /data-react(?:root|id)/i,
      /__NEXT_DATA__/i,
    ],
    versionPattern: /react[\.\-\/]([\d\.]+)/i,
  },
  {
    name: "Next.js",
    category: "Framework",
    patterns: [/__NEXT_DATA__/i, /_next\/static/i],
    versionPattern: /"buildId":"([^"]+)"/i,
  },
  {
    name: "Vue.js",
    category: "Frontend Framework",
    patterns: [/vue[\.\-\/][\d\.]+/i, /data-v-[a-f0-9]{8}/i, /__VUE__/i],
    versionPattern: /vue[\.\-\/]([\d\.]+)/i,
  },
  {
    name: "Nuxt.js",
    category: "Framework",
    patterns: [/__NUXT__/i, /nuxt[\.\-\/]/i],
  },
  {
    name: "Angular",
    category: "Frontend Framework",
    patterns: [/ng-version/i, /angular[\.\-\/][\d\.]+/i, /ng-controller/i],
    versionPattern: /ng-version="([\d\.]+)"/i,
  },
  {
    name: "Svelte",
    category: "Frontend Framework",
    patterns: [/svelte[\.\-\/]/i, /\[data-svelte-h\]/i],
  },
  {
    name: "SvelteKit",
    category: "Framework",
    patterns: [/__sveltekit/i],
  },
  {
    name: "jQuery",
    category: "JavaScript Library",
    patterns: [/jquery[\.\-\/][\d\.]+/i, /jquery(?:\.min)?\.js/i],
    versionPattern: /jquery[\.\-\/]?([\d\.]+)(?:\.min)?\.js/i,
  },
  {
    name: "Alpine.js",
    category: "JavaScript Library",
    patterns: [/alpinejs/i, /x-data=/i],
  },

  // ── CSS Frameworks ───────────────────────────────────
  {
    name: "Tailwind CSS",
    category: "CSS Framework",
    patterns: [/tailwindcss/i, /tw-/i, /class="[^"]*\b(flex|grid|hidden|p-\d|m-\d|text-\w+)\b/i],
  },
  {
    name: "Bootstrap",
    category: "CSS Framework",
    patterns: [/bootstrap[\.\-\/][\d\.]+/i, /bootstrap(?:\.min)?\.css/i, /class="[^"]*\bcontainer-fluid\b/i],
    versionPattern: /bootstrap[\.\-\/]?([\d\.]+)(?:\.min)?\.css/i,
  },
  {
    name: "Bulma",
    category: "CSS Framework",
    patterns: [/bulma/i, /class="[^"]*\bcolumn is-/i],
  },
  {
    name: "Material UI",
    category: "CSS Framework",
    patterns: [/material-ui/i, /mui-/i, /makeStyles/i],
  },
  {
    name: "Chakra UI",
    category: "CSS Framework",
    patterns: [/chakra-ui/i, /chakra-/i],
  },

  // ── CMS / Platforms ──────────────────────────────────
  {
    name: "WordPress",
    category: "CMS",
    patterns: [/wp-content/i, /wp-includes/i, /generator.*wordpress/i],
    versionPattern: /generator.*wordpress\s+([\d\.]+)/i,
  },
  {
    name: "Shopify",
    category: "E-commerce",
    patterns: [/cdn\.shopify\.com/i, /shopify\.com/i, /Shopify\.theme/i],
  },
  {
    name: "Webflow",
    category: "Website Builder",
    patterns: [/webflow\.io/i, /<!\-\- Start of Webflow/i],
  },
  {
    name: "Wix",
    category: "Website Builder",
    patterns: [/wixstatic\.com/i, /parastorage\.com/i, /wix\.com/i],
  },
  {
    name: "Squarespace",
    category: "Website Builder",
    patterns: [/squarespace\.com/i, /Static\.Squarespace/i],
  },
  {
    name: "Ghost",
    category: "CMS",
    patterns: [/ghost\.org/i, /content\/images\/ghost/i],
  },
  {
    name: "Contentful",
    category: "Headless CMS",
    patterns: [/cdn\.contentful\.com/i, /images\.contentful\.com/i],
  },
  {
    name: "Sanity",
    category: "Headless CMS",
    patterns: [/cdn\.sanity\.io/i, /sanity\.cloud/i],
  },

  // ── Hosting / CDN / Server ───────────────────────────
  {
    name: "Vercel",
    category: "Hosting",
    patterns: [/vercel\.app/i, /x-vercel-id/i, /vercel-insights/i],
  },
  {
    name: "Netlify",
    category: "Hosting",
    patterns: [/netlify\.app/i, /\.netlify\.com/i, /netlify\-redirects/i],
  },
  {
    name: "Cloudflare",
    category: "CDN",
    patterns: [/cdnjs\.cloudflare\.com/i, /cf-ray/i, /cloudflare/i],
  },
  {
    name: "AWS CloudFront",
    category: "CDN",
    patterns: [/cloudfront\.net/i, /x-amz-cf-id/i],
  },
  {
    name: "Firebase",
    category: "Backend",
    patterns: [/firebaseapp\.com/i, /firebaseio\.com/i, /firebasestorage/i],
  },
  {
    name: "Supabase",
    category: "Backend",
    patterns: [/supabase\.co/i],
  },

  // ── Analytics / Marketing ────────────────────────────
  {
    name: "Google Analytics",
    category: "Analytics",
    patterns: [/google-analytics\.com/i, /googletagmanager\.com/i, /gtag\(/i, /GA4|G-[A-Z0-9]+/i],
  },
  {
    name: "Hotjar",
    category: "Analytics",
    patterns: [/hotjar\.com/i, /hj\.hotjar/i],
  },
  {
    name: "Mixpanel",
    category: "Analytics",
    patterns: [/mixpanel\.com/i, /mixpanel\.init/i],
  },
  {
    name: "Segment",
    category: "Analytics",
    patterns: [/segment\.io/i, /analytics\.js/i],
  },
  {
    name: "Meta Pixel",
    category: "Advertising",
    patterns: [/connect\.facebook\.net/i, /fbq\(/i],
  },
  {
    name: "Mailchimp",
    category: "Email Marketing",
    patterns: [/chimpstatic\.com/i, /list-manage\.com/i],
  },

  // ── Fonts ────────────────────────────────────────────
  {
    name: "Google Fonts",
    category: "Font Service",
    patterns: [/fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i],
  },
  {
    name: "Adobe Fonts",
    category: "Font Service",
    patterns: [/use\.typekit\.net/i, /typekit/i],
  },

  // ── Payment ──────────────────────────────────────────
  {
    name: "Stripe",
    category: "Payment",
    patterns: [/js\.stripe\.com/i, /stripe\.com/i],
  },
  {
    name: "PayPal",
    category: "Payment",
    patterns: [/paypal\.com/i, /paypalobjects\.com/i],
  },

  // ── Testing / Dev Tools ──────────────────────────────
  {
    name: "Storybook",
    category: "Dev Tool",
    patterns: [/storybook/i],
  },
];

// ── Helper: collect all text signals from a page ──────
function collectSignals(html: string, headers: Record<string, string> | undefined | null): string {
  const parts: string[] = [];
  parts.push(html);

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      parts.push(`${key}: ${value}`);
    }
  }

  return parts.join("\n");
}

// ── Main detection function ────────────────────────────
function detectTechLocally(
  html: string,
  headers: Record<string, string>
): TechInfo[] {
  const signal = collectSignals(html, headers);
  const detected: TechInfo[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(signal)) {
        if (seen.has(rule.name)) break;
        seen.add(rule.name);

        let version: string | undefined;
        if (rule.versionPattern) {
          const match = signal.match(rule.versionPattern);
          if (match?.[1]) version = match[1];
        }

        detected.push({
          name: rule.name,
          version,
          category: rule.category,
        });
        break; // one match per rule is enough
      }
    }
  }

  return detected;
}

interface WappalyzerTechnology {
  name: string;
  versions?: string[];
  categories?: { name: string }[];
}

interface WappalyzerLookup {
  technologies?: WappalyzerTechnology[];
}

export function detectTech(
  html: string,
  headers: Record<string, string> | undefined | null
): TechInfo[] {
  try {
    const signal = collectSignals(html, headers);
    const detected: TechInfo[] = [];
    const seen = new Set<string>();

    for (const rule of RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(signal)) {
          if (seen.has(rule.name)) break;
          seen.add(rule.name);

          let version: string | undefined;
          if (rule.versionPattern) {
            const match = signal.match(rule.versionPattern);
            if (match?.[1]) version = match[1];
          }

          detected.push({
            name: rule.name,
            version,
            category: rule.category,
          });
          break;
        }
      }
    }

    return detected;
  } catch (err) {
    console.error("Tech detection error:", err);
    return [];  // ← always return array, never null
  }
}