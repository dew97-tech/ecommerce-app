import { resolveCategoryIconKey } from "@/lib/catalog/category-icon-map";
import { cn } from "@/lib/utils";

const ICONS = {
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  motherboard: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <rect x="6" y="7" width="5" height="5" rx="1" />
      <path d="M14.5 8H18M14.5 11H17M6 16h12" />
    </>
  ),
  gpu: (
    <>
      <rect x="2.5" y="7" width="19" height="10" rx="2" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M14 10h5M14 14h5M6 17v2" />
    </>
  ),
  ram: (
    <>
      <rect x="3" y="7" width="18" height="9" rx="1.5" />
      <path d="M6.5 10v3M10 10v3M13.5 10v3M17 10v3M7 16v2M12 16v2M17 16v2" />
    </>
  ),
  ssd: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <rect x="7" y="9" width="10" height="6" rx="1" />
      <path d="M9.5 9V7.5M12 9V7.5M14.5 9V7.5" />
    </>
  ),
  hdd: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="16" cy="12" r="2.5" />
      <path d="M6 12h5" />
    </>
  ),
  "optical-drive": (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="11" cy="12" r="3.5" />
      <circle cx="11" cy="12" r="1" />
      <path d="M17 10h1M17 14h1" />
    </>
  ),
  psu: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <circle cx="9" cy="12" r="3" />
      <path d="M15.5 10H18M15.5 14H18" />
    </>
  ),
  casing: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 6.5h6M9 9.5h6" />
      <circle cx="12" cy="16.5" r="1.5" />
    </>
  ),
  cooler: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4c2 3 2 5 0 8M20 12c-3 2-5 2-8 0M12 20c-2-3-2-5 0-8M4 12c3-2 5-2 8 0" />
    </>
  ),
  "liquid-cooling": (
    <>
      <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z" />
      <path d="M9 14c1 .8 2 .8 3 0s2-.8 3 0" />
    </>
  ),
  fan: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 4c1.5 3 1.5 6 0 8M20 12c-3 1.5-6 1.5-8 0M12 20c-1.5-3-1.5-6 0-8M4 12c3-1.5 6-1.5 8 0" />
    </>
  ),
  "gaming-pc": (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 6.5h6M9 9.5h6" />
      <path d="M10 16h4M12 14v4" />
    </>
  ),
  "desktop-pc": (
    <>
      <rect x="3" y="5" width="13" height="9" rx="1.5" />
      <path d="M7 18h5M9.5 14v4" />
      <rect x="18" y="7" width="3" height="12" rx="1" />
    </>
  ),
  aio: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M10 16l-1 4M14 16l1 4" />
    </>
  ),
  "mini-pc": (
    <>
      <rect x="4" y="8" width="16" height="8" rx="2" />
      <circle cx="8" cy="12" r="1" />
      <path d="M13.5 11H18M13.5 13H17" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="3.5" width="16" height="7" rx="1.5" />
      <rect x="4" y="13.5" width="16" height="7" rx="1.5" />
      <path d="M8 7h1M8 17h1M13 7h4M13 17h4" />
    </>
  ),
  "server-rack": (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 12h8M8 17h8" />
      <path d="M7 7h.01M7 12h.01M7 17h.01" />
    </>
  ),
  laptop: (
    <>
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path d="M2 18h20l-1.5-3H3.5L2 18z" />
    </>
  ),
  "laptop-bag": (
    <>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M4 13h16" />
    </>
  ),
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4M8 2l4 3 4-3" />
    </>
  ),
  projector: (
    <>
      <rect x="3" y="8" width="14" height="8" rx="2" />
      <circle cx="9" cy="12" r="2" />
      <path d="M20 10l2-2M20 14l2 2M17 12h3" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M7 8h6M7 11h4" />
      <path d="M8 20h8" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2.5" y="7" width="19" height="10" rx="2" />
      <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 13.5h10" />
    </>
  ),
  mouse: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="5" />
      <path d="M12 3v6" />
    </>
  ),
  "mouse-pad": (
    <>
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <path d="M8 18v2M16 18v2M12 11v4" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.5 8h9a5 5 0 0 1 5 5v.5a3 3 0 0 1-5.4 1.8L15 14H9l-1.1 1.3A3 3 0 0 1 2.5 13.5V13a5 5 0 0 1 5-5z" />
      <path d="M7.5 10.5v2M6.5 11.5h2" />
      <path d="M15.5 10.5h.01M17.5 12.5h.01" />
    </>
  ),
  console: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h5M7 14h3" />
      <circle cx="17" cy="12" r="2" />
    </>
  ),
  "gaming-chair": (
    <>
      <path d="M7 3h10v8a5 5 0 0 1-10 0V3z" />
      <path d="M12 16v5M8 21h8M4.5 10h2.5M17 10h2.5" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
    </>
  ),
  earbuds: (
    <>
      <path d="M8 4a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0V7" />
      <path d="M8 12v6a2 2 0 0 0 4 0" />
      <path d="M16 4a3 3 0 0 1 3 3v2a3 3 0 0 1-6 0V7" />
      <path d="M16 12v6a2 2 0 0 1-4 0" />
    </>
  ),
  speaker: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="9" r="2.5" />
      <circle cx="12" cy="16" r="1.5" />
    </>
  ),
  microphone: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </>
  ),
  webcam: (
    <>
      <circle cx="12" cy="10" r="6" />
      <circle cx="12" cy="10" r="2" />
      <path d="M12 16v4M8 21h8" />
    </>
  ),
  presenter: (
    <>
      <rect x="8" y="3" width="8" height="18" rx="4" />
      <circle cx="12" cy="8" r="1.5" />
      <path d="M12 12v4" />
    </>
  ),
  recorder: (
    <>
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M9 6V4h6v2" />
    </>
  ),
  "capture-card": (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14l2.5 2 5-4" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10 5h4M12 18.5h.01" />
    </>
  ),
  "phone-office": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 6h8M8 9h8" />
      <circle cx="12" cy="15" r="2" />
    </>
  ),
  tablet: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M12 18h.01" />
    </>
  ),
  "graphics-tablet": (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M17 3l4 4-6.5 6.5-3.5 1 1-3.5L18.5 4.5" />
    </>
  ),
  smartwatch: (
    <>
      <rect x="7" y="6" width="10" height="12" rx="3" />
      <path d="M9 6V3h6v3M9 18v3h6v-3M12 10v3l2 1" />
    </>
  ),
  "power-bank": (
    <>
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <path d="M20 10.5v3M7 12h6M16 11h.01" />
    </>
  ),
  "power-strip": (
    <>
      <rect x="3" y="9" width="18" height="7" rx="2" />
      <path d="M7 12.5h.01M12 12.5h.01M17 12.5h.01M6 9V6h4" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="8" width="16" height="8" rx="2" />
      <path d="M21 11v2M6.5 11v2M10 11v2M13.5 11v2" />
    </>
  ),
  ups: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <path d="M12 8.5l-2 4h3l-1.5 3.5" />
      <path d="M9 5V3h6v2" />
    </>
  ),
  router: (
    <>
      <rect x="3" y="11" width="18" height="7" rx="2" />
      <path d="M12 11V7M9 6l3-3 3 3" />
      <path d="M7 14.5h.01M10 14.5h.01M14.5 14.5H18" />
    </>
  ),
  switch: (
    <>
      <rect x="3" y="9" width="18" height="7" rx="2" />
      <path d="M7 12.5h.01M10 12.5h.01M13 12.5h.01M16 12.5h.01M16 9V6" />
    </>
  ),
  "access-point": (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9" />
      <path d="M4.5 4.5a11 11 0 0 0 0 15M19.5 4.5a11 11 0 0 1 0 15" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="4.5" cy="5" r="2" />
      <circle cx="19.5" cy="5" r="2" />
      <circle cx="4.5" cy="19" r="2" />
      <circle cx="19.5" cy="19" r="2" />
      <path d="M6 6.5l3.5 3.5M18 6.5L14.5 10M6 17.5l3.5-3.5M18 17.5L14.5 14" />
    </>
  ),
  cable: (
    <>
      <path d="M9 2.5v5M15 2.5v5" />
      <path d="M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0v-3z" />
      <path d="M12 16v5.5" />
    </>
  ),
  hub: (
    <>
      <rect x="3" y="10" width="18" height="7" rx="2" />
      <path d="M7 10V6M12 10V5M17 10V6" />
      <path d="M7 10v0M12 10v0M17 10v0" />
    </>
  ),
  pendrive: (
    <>
      <path d="M8 3h8v7l-1.5 2.5V21h-5v-8.5L8 10V3z" />
      <path d="M10 6.5h4" />
    </>
  ),
  "memory-card": (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 3v4M12 3v4M15 3v4" />
    </>
  ),
  cctv: (
    <>
      <path d="M3.5 8.5l14-4 1.5 5-14 4z" />
      <path d="M6.5 13.5V17a2 2 0 0 0 2 2h3" />
      <path d="M18.5 6.5l2.5-1M9 15.5l1 3" />
    </>
  ),
  "access-control": (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3M12 14v2" />
    </>
  ),
  printer: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <rect x="7" y="15" width="10" height="6" />
    </>
  ),
  toner: (
    <>
      <rect x="5" y="7" width="14" height="10" rx="2" />
      <path d="M9 7V4.5h6V7M9 17v2.5h6V17" />
      <path d="M9 12h6" />
    </>
  ),
  scanner: (
    <>
      <rect x="3" y="5" width="18" height="8" rx="2" />
      <path d="M3 17h18M7 9h6" />
    </>
  ),
  barcode: (
    <>
      <path d="M4 5v14M7 5v14M10 5v11M13 5v14M16 5v11M20 5v14" />
    </>
  ),
  copier: (
    <>
      <path d="M7 8V4h8l3 3v1" />
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <rect x="8" y="16" width="8" height="5" />
    </>
  ),
  shredder: (
    <>
      <rect x="4" y="6" width="16" height="6" rx="1.5" />
      <path d="M7 12v4M10 12v6M14 12v5M17 12v3" />
      <path d="M8 6V3.5h8V6" />
    </>
  ),
  "money-counter": (
    <>
      <rect x="3" y="6" width="18" height="10" rx="2" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="M6 19h12" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <rect x="8" y="6" width="8" height="3" />
      <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  lens: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  tripod: (
    <>
      <circle cx="12" cy="4" r="1.5" />
      <path d="M12 5.5V13M8 21l4-8 4 8M6 21h12" />
    </>
  ),
  gimbal: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M7 12H3.5M20.5 12H17M12 7V3.5M12 20.5V17" />
    </>
  ),
  drone: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M8.5 8.5l2 2M15.5 8.5l-2 2M8.5 15.5l2-2M15.5 15.5l-2-2" />
    </>
  ),
  piano: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 5v9M12 5v9M16 5v9M3 14h18" />
    </>
  ),
  software: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </>
  ),
  thermal: (
    <>
      <path d="M8.5 3h7v4.5l-1 2V21h-5V9.5l-1-2V3z" />
      <path d="M10.5 6h3" />
    </>
  ),
  lighting: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />
    </>
  ),
  gadget: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="3" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M10 6h4" />
    </>
  ),
  accessories: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <circle cx="17.5" cy="17.5" r="3.5" />
    </>
  ),
  brand: (
    <>
      <path d="M3 11l8-8h9v9l-8 8a2 2 0 0 1-2.8 0L3 13.8A2 2 0 0 1 3 11z" />
      <circle cx="15" cy="9" r="1.5" />
    </>
  ),
  appliance: (
    <>
      <rect x="4" y="7" width="16" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <circle cx="12" cy="13.5" r="3" />
    </>
  ),
};

function hashHue(name) {
  let hash = 0;
  for (const character of String(name)) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360;
  }
  return hash;
}

export function CategoryIcon({ name, className }) {
  const key = resolveCategoryIconKey(name);
  const content = key ? ICONS[key] : null;

  if (!content) {
    const hue = hashHue(name);
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-md text-xs font-bold uppercase",
          className
        )}
        style={{
          backgroundColor: `hsl(${hue} 70% 92%)`,
          color: `hsl(${hue} 45% 32%)`,
        }}
      >
        {String(name ?? "?").trim().charAt(0) || "?"}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {content}
    </svg>
  );
}

export function CategoryIconBadge({ name, className, iconClassName }) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
        className
      )}
    >
      <CategoryIcon name={name} className={iconClassName ?? "h-5 w-5"} />
    </span>
  );
}
