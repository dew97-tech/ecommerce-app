

const KEY_OVERRIDES = {
  "graphics-card": "gpu",
};

const SKIP_BRAND_PATTERN =
  /\b(asus|msi|gigabyte|asrock|intel|amd|dahua|epson|logitech|edifier|1st ?player|dell|hp|lenovo|acer|samsung|walton|hikvision|uniview|xiaomi|realme|tecno|infinix|nokia|tp-?link|d-link|netgear|tenda|ubiquiti|mikrotik|cisco|canon|ricoh|brother|kyocera|sharp|panasonic|philips|sony|jbl|boat|baseus|ugreen|oraimo|anker|ravpower|awei|fantech|a4tech|razer|steelseries|hyperx|redragon|havit|delux|gamdias|cougar|nzxt|lian ?li|corsair|thermaltake|cooler ?master|deepcool|antec|arctic|id-?cooling|pccooler|seagate|western ?digital|toshiba|kingston|transcend|sandisk|lexar|teamgroup|adata|crucial|g\.?skill|patriot|apacer|netac|ezviz|imou|unv|xbox|playstation|dizo|cmf)\b/i;

const SUBJECT_OVERRIDES = {
  networking: "networking router",
  phone: "modern smartphone",
  tablet: "slim digital tablet with stylus",
  gadget: "modern smart watch gadget",
  "server-storage": "2U rackmount enterprise server chassis",
  gaming: "modern gaming console with wireless gamepad controller",
  security: "security IP camera",
  software: "modern blank retail software box packaging",
  component: "computer hardware motherboard with heatsinks",
  appliance: "modern smart kitchen appliance air fryer",
  "office-equipment": "modern all-in-one laser office printer",
  ups: "UPS unit uninterruptible power supply",
  camera: "modern mirrorless digital camera with lens",
  desktop: "sleek modern desktop tower PC case",
  tv: "ultra-slim 4K smart television",
  monitor: "widescreen LED computer monitor",
  power: "power inverter and UPS unit",
  "power-tools": "cordless power drill machine",
  cable: "braided computer cable",
  "bluetooth-speakers": "portable Bluetooth speaker",
  "accessories-mouse": "wireless computer mouse",
  "accessories-microphone": "desktop USB studio microphone",
  "accessories-keyboard": "wireless computer keyboard",
  "pen-drive": "metal USB flash drive",
  "speaker-home-theater": "home theater speaker soundbar",
  "hubs-docks": "USB-C multiport docking station hub",
  "accessories-headphone": "over-ear wireless headphones",
  converter: "compact USB-C to HDMI adapter converter",
  "memory-card": "microSD memory card with adapter",
  "power-strip": "surge protector power strip",
  "hdd-ssd-enclosure": "external drive enclosure",
  "accessories-mouse-pad": "minimalist computer mouse pad",
  webcam: "HD computer webcam",
  presenter: "wireless presentation clicker",
  "digital-voice-recorder": "handheld digital voice recorder",
  "capture-card": "video capture card",
  "accessories-conference-system": "conference room speakerphone",
  "thermal-paste": "thermal paste syringe for CPU",
  "pc-lighting-led-strips": "addressable RGB LED light strip",
  "accessories-mobile-accessories": "smartphone stand holder",
  "accessories-router": "wireless router",
  "accessories-action-camera": "compact action camera",
  "accessories-gaming": "gaming accessory controller",
  ac: "air conditioner indoor unit",
  refrigerator: "modern double-door refrigerator",
  fan: "electric standing fan",
  oven: "countertop microwave oven",
  blender: "kitchen countertop blender",
  geyser: "electric water heater geyser",
  "washing-machine": "front-load washing machine",
  "sewing-machine": "electric sewing machine",
  "air-purifier": "modern home air purifier",
  cooker: "electric induction cooker",
  "camera-accessories": "camera lens filter and accessories",
  "camera-lenses": "camera prime lens",
  "camera-action-camera": "compact action camera",
  "mirrorless-camera": "mirrorless digital camera",
  "camera-tripod": "aluminum camera tripod",
  dslr: "DSLR camera with zoom lens",
  "video-camera": "professional video camcorder",
  "dash-cam": "car dash camera",
  "digital-camera": "compact digital point-and-shoot camera",
  motherboard: "ATX gaming computer motherboard",
  ssd: "solid-state drive",
  "ram-desktop": "desktop RAM memory kit",
  "cpu-cooler": "dual-tower CPU air cooler",
  "power-supply": "modular ATX computer power supply unit",
  "casing-cooler": "120mm RGB computer casing fan",
  "hard-disk-drive": "3.5-inch internal hard disk drive",
  processor: "computer desktop processor CPU chip",
  "portable-ssd": "portable solid-state drive",
  "ram-laptop": "laptop RAM memory stick",
  "portable-hard-disk-drive": "external portable hard disk drive",
  "water-liquid-cooling": "AIO liquid CPU cooler with radiator",
  "optical-disk-drive": "internal optical DVD drive",
  "brand-pc": "branded desktop tower PC",
  "all-in-one-pc": "all-in-one desktop computer",
  "gaming-pc": "RGB gaming desktop PC tower",
  "portable-mini-pc": "compact mini PC desktop",
  "star-pc": "desktop tower PC case",
  "gadget-earbuds": "true wireless earbuds with charging case",
  "smart-watch": "smartwatch with OLED touch screen",
  "power-bank": "slim fast-charging portable power bank",
  earphone: "in-ear wired earphones with 3.5mm jack",
  drones: "quadcopter camera drone",
  neckband: "wireless neckband earphones",
  "studio-equipment": "studio broadcast microphone with boom arm",
  calculator: "scientific desktop calculator",
  gimbal: "handheld 3-axis smartphone gimbal stabilizer",
  "daily-lifestyle": "smart lifestyle gadget",
  "musical-keyboard": "electronic musical keyboard synthesizer",
  "portable-power-station": "portable outdoor power station generator",
  "gadget-headphone": "wireless bluetooth headphones",
  "gadget-microphone": "USB podcasting microphone",
  "gadget-action-camera": "rugged action camera",
  "gadget-accessories": "smart gadget accessories",
  "studio-monitors": "studio monitor audio speaker",
  "gadget-camera": "compact gadget camera",
  "smart-band": "fitness tracking smart band",
  "gaming-keyboard": "mechanical gaming keyboard with RGB backlight",
  "gaming-mouse": "ergonomic gaming mouse with RGB",
  "gaming-headphone": "gaming headset with microphone",
  gamepad: "wireless gaming gamepad controller",
  "gaming-mouse-pad": "extended gaming mouse pad mat",
  "gaming-chair": "ergonomic gaming chair",
  "gaming-console": "video game console with controller",
  "gaming-accessories": "gaming accessories setup",
  "gaming-sofa": "reclining gaming sofa chair",
  "gaming-earbuds": "low-latency gaming earbuds",
  "gaming-gadget": "gaming handheld device",
  "laptop-accessories": "aluminum laptop cooling stand",
  "all-laptop": "slim modern ultrabook laptop",
  "gaming-laptop": "high-performance gaming laptop",
  "laptop-bag": "professional laptop backpack",
  "premium-ultrabook": "premium slim ultrabook laptop",
  "network-switch": "24-port rackmount gigabit network switch",
  "networking-router": "dual-band Wi-Fi 6 router with antennas",
  "access-point-range-extender": "ceiling-mount wireless access point",
  "networking-cable": "coiled Cat6 ethernet networking cable",
  "wifi-adapter": "USB Wi-Fi adapter with antenna",
  "media-converter": "fiber optic ethernet media converter",
  "splicer-machine": "fiber optic fusion splicer machine",
  "pocket-router": "portable pocket 4G LTE Wi-Fi router",
  "network-transceivers": "SFP optical network transceiver module",
  toner: "laser printer black toner cartridge",
  projector: "digital multimedia office projector",
  "laser-printer": "compact laser monochrome printer",
  "interactive-flat-panel": "interactive touch flat panel display",
  "ip-phone": "enterprise VoIP IP desk phone",
  printer: "all-in-one color inkjet printer",
  "office-equipment-conference-system": "video conference camera and microphone system",
  "pos-printer": "thermal receipt POS printer",
  scanner: "flatbed document desktop scanner",
  photocopier: "heavy-duty multifunction office photocopier",
  "barcode-scanner": "handheld wireless laser barcode scanner",
  "ink-bottle": "printer refill ink bottle set",
  cartridge: "inkjet printer ink cartridge",
  "label-printer": "desktop thermal label printer",
  "paper-shredder": "cross-cut electric paper shredder",
  "money-counting-machine": "electronic banknote money counting machine",
  "pabx-system": "PBX phone system",
  signage: "digital commercial signage display",
  "pa-system": "public-address speaker system",
  "id-card-printer": "PVC ID card badge printer",
  kiosk: "self-service interactive digital kiosk terminal",
  "projection-screen": "retractable projector screen",
  "phone-mobile-accessories": "magnetic wireless phone charging stand",
  "ip-camera": "security IP camera",
  "cc-camera": "bullet CCTV camera",
  nvr: "network video recorder",
  "access-control": "biometric fingerprint access control terminal",
  "portable-wifi-camera": "compact indoor portable Wi-Fi security camera",
  dvr: "digital video recorder",
  "door-lock": "smart electronic biometric door lock",
  "ptz-camera": "PTZ security camera",
  xvr: "hybrid video recorder",
  "ip-camera-package": "security IP camera system kit",
  "cc-camera-package": "bullet CCTV camera surveillance package",
  server: "enterprise 2U rackmount server chassis",
  "nas-storage": "multi-bay network-attached NAS storage",
  "server-rack": "standard 42U network server rack cabinet",
  workstation: "high-performance computer workstation tower",
  "san-storage": "enterprise SAN storage array unit",
  antivirus: "cybersecurity antivirus software retail box",
  "operating-system": "computer operating system software retail box",
  "office-application": "office productivity software retail box",
  "bangla-typing-software": "typing software retail DVD box",
  "graphics-tablet": "digital drawing graphics tablet with stylus pen",
  "all-tv": "flat-screen smart television",
  "online-ups": "online UPS unit",
  "offline-ups": "offline UPS unit",
  "ups-battery": "sealed lead-acid UPS replacement battery",
  "mini-ups": "mini DC UPS unit for router",
  "laptop-battery": "laptop replacement battery",
  "charger-adapter": "phone charger and adapter",
  "patch-cord": "ethernet patch cord",
  "laptop-keyboard": "laptop replacement keyboard",
  "type-c-cable": "USB Type-C cable",
  "bluetooth-headphone": "bluetooth wireless headphone",
  fridge: "modern refrigerator",
  trimmer: "electric beard trimmer",
  "access-point": "ceiling wireless access point",
  "hdmi-cable": "HDMI cable",
  "laptop-charger-adapter": "laptop charger adapter",
  "lens-filter": "camera lens filter",
  "type-c-converter": "USB Type-C converter adapter",
  "mesh-router": "mesh Wi-Fi router system",
  "holder-stand": "phone holder and stand",
  "utp-cable": "UTP ethernet cable",
  "analog-watch": "classic analog wristwatch",
  "hdmi-converter": "HDMI converter adapter",
  "ceiling-fan": "ceiling fan",
  "mini-fan": "portable mini fan",
  "camera-bag": "camera shoulder bag",
  "audio-cable": "audio cable",
  "blender-grinder": "blender and grinder",
  "laptop-cooler": "laptop cooling pad",
  "vacuum-cleaner": "vacuum cleaner",
  "lightning-cable": "Lightning charging cable",
  "car-charger": "car phone charger",
  "feature-phone": "feature phone with keypad",
  "stylus-pen": "tablet stylus pen",
  "usb-cable": "USB cable",
  display: "portable monitor display",
  "bluetooth-adapter": "USB Bluetooth adapter",
  "audio-converter": "audio converter adapter",
  "studio-microphones": "studio condenser microphone",
  "audio-interfaces": "USB audio interface",
  "deep-freezer": "chest deep freezer",
  "laptop-stand": "aluminum laptop stand",
  "hair-dryer": "hair dryer",
  "projector-projection-screen": "retractable projector screen",
  "usb-converter": "USB converter adapter",
  "charger-fan": "rechargeable fan",
  soundbar: "TV soundbar speaker",
  "action-camera-accessories": "action camera mount accessories",
  connector: "network cable connector",
  "patch-panel": "rackmount network patch panel",
  "monitor-arm": "monitor desk arm mount",
  "lan-card": "PCIe network LAN card",
  "digital-locker-vault": "digital security locker vault",
  "entrance-control": "security entrance control gate",
  "large-format-printer": "large format inkjet printer",
  "server-hdd": "enterprise server hard disk drive",
  "studio-light": "photography studio light",
  "displayport-cable": "DisplayPort cable",
  "printer-paper": "printer paper ream",
  "coffee-maker": "coffee maker machine",
  "card-reader": "memory card reader",
  "air-fryer": "air fryer kitchen appliance",
  "portable-monitor": "portable USB-C monitor",
  "fiber-optic-cable": "fiber optic cable",
  "modular-jack": "RJ45 modular jack",
  "drill-machine": "cordless power drill machine",
  onu: "fiber optic ONU modem",
  olt: "fiber optic OLT terminal",
  "hair-straightener": "hair straightener",
  "telephone-set": "corded telephone set",
  "gaming-router": "gaming Wi-Fi router",
  "blower-machine": "electric blower machine",
  "body-camera": "body worn camera",
  "massage-gun": "percussion massage gun",
  "drone-accessories": "drone accessories",
  "vga-converter": "VGA converter adapter",
  "crimping-tool": "network crimping tool",
  "vertical-gpu-holder": "vertical GPU mounting bracket",
  "health-monitor": "digital health monitor device",
  "displayport-converter": "DisplayPort converter adapter",
  "vga-cable": "VGA cable",
  "wifi-range-extender": "WiFi range extender",
};

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildCategoryEntries(categories) {
  const baseCounts = new Map();
  const childTotals = new Map();

  for (const category of categories) {
    const base = slugify(category.name);
    baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1);

    if (category.parentId) {
      childTotals.set(
        category.parentId,
        (childTotals.get(category.parentId) ?? 0) +
          (category._count?.products ?? 0)
      );
    }
  }

  return categories.map((category) => {
    const base = slugify(category.name);
    const parentName = category.parent?.name ?? null;
    let key = base;

    if ((baseCounts.get(base) ?? 0) > 1 && parentName) {
      key = `${slugify(parentName)}-${base}`;
    }

    key = KEY_OVERRIDES[key] ?? key;

    const direct = category._count?.products ?? 0;

    const products = category.parentId
      ? direct
      : direct + (childTotals.get(category.id) ?? 0);

    return {
      id: category.id ?? null,
      key,
      name: category.name,
      parent: parentName ?? "ROOT",
      products,
      directProducts: direct,
      image: category.image ?? null,
      hasTile: (category.image ?? "").startsWith("/categories/"),
    };
  });
}

function isSkippable(name) {
  return SKIP_BRAND_PATTERN.test(String(name ?? ""));
}

function buildPrompt(subject) {
  return `Studio product photo of ${subject}, a single hero product centered on a seamless light-gray background, soft contact shadow, bright even lighting, photorealistic e-commerce style, no text, no logos, no people, no extra props. Square 1:1 composition, 2048x2048, JPEG. Negative: text, watermark, logo, people, hands, multiple products, busy/dark background, collage, border`;
}

module.exports = {
  KEY_OVERRIDES,
  SUBJECT_OVERRIDES,
  buildCategoryEntries,
  buildPrompt,
  isSkippable,
  slugify,
};
