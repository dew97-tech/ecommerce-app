const COLLATOR = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

export const GROUPS = {
  type: { label: "Type", keys: ["Type", "Types", "Product Type", "Printer Type"] },
  socket: {
    label: "Socket",
    keys: ["Socket", "CPU Socket", "Socket Type", "Processor Socket", "Supported Socket"],
  },
  chipset: { label: "Chipset", keys: ["Chipset", "Chipset Model", "Chipset Type"] },
  cores: { label: "Cores", keys: ["Cores", "Core", "Number of Cores", "Total Cores"] },
  threads: { label: "Threads", keys: ["Threads", "Thread", "Number of Threads"] },
  processorBrand: {
    label: "Processor Brand",
    keys: ["Processor Brand", "CPU Brand", "Processor"],
  },
  processorType: {
    label: "Processor Type",
    keys: ["Processor Type", "Processor Model", "Processor"],
  },
  processorSpeed: {
    label: "Processor Speed",
    keys: ["Processor Speed", "Base Frequency", "Frequency", "Speed"],
  },
  memoryType: { label: "Memory Type", keys: ["Memory Type", "RAM Type", "Type"] },
  capacity: {
    label: "Capacity",
    keys: ["Capacity", "Memory Capacity", "Storage Capacity", "Total Capacity", "Size", "RAM", "Storage", "Memory"],
  },
  frequency: {
    label: "Frequency",
    keys: ["Frequency", "Speed", "Memory Frequency", "Bus Speed"],
  },
  formFactor: { label: "Form Factor", keys: ["Form Factor", "Factor"] },
  interface: {
    label: "Interface",
    keys: ["Interface", "Connectivity", "Connection Type"],
  },
  wattage: {
    label: "Wattage",
    keys: ["Continuous Power", "Wattage", "Output Power", "Max Power", "Power", "Peak Power"],
  },
  modular: { label: "Modular Type", keys: ["Modular Type", "Modular"] },
  efficiency: { label: "Certification", keys: ["Efficiency", "Certification", "80 Plus"] },
  sidePanel: { label: "Side Panel", keys: ["Side Panel", "Side Panel Type"] },
  coolerType: {
    label: "Cooler Type",
    keys: ["Type", "Cooler Type", "Cooling Type"],
  },
  height: { label: "Height", keys: ["Height", "CPU Cooler Height"] },
  flashType: { label: "Flash Type", keys: ["Flash Type", "NAND"] },
  rpm: { label: "RPM", keys: ["RPM", "Rotation Speed", "Speed"] },
  displaySize: {
    label: "Display Size",
    keys: ["Display Size", "Screen Size", "Panel Size"],
  },
  resolution: {
    label: "Resolution",
    keys: ["Resolution", "Max Resolution", "Display Resolution", "Video Resolution"],
  },
  panelType: { label: "Panel Type", keys: ["Panel Type", "Panel"] },
  refreshRate: { label: "Refresh Rate", keys: ["Refresh Rate", "Response Time"] },
  memorySize: {
    label: "Memory Size",
    keys: ["Memory Size", "Graphics Memory", "Video Memory", "Memory"],
  },
  graphicsEngine: {
    label: "Graphics Engine",
    keys: ["Graphics Engine", "GPU", "Graphics Processor", "Graphics"],
  },
  color: { label: "Color", keys: ["Color", "Color(s)", "Colour"] },
  sensor: { label: "Sensor", keys: ["Sensor", "Image Sensor", "Sensor Type"] },
  ports: { label: "Ports", keys: ["Ports", "Port", "Number of Ports"] },
  lighting: { label: "Lighting", keys: ["Lighting", "Lighting Effect", "RGB"] },
  material: { label: "Material", keys: ["Material", "Materials", "Body Material"] },
  power: {
    label: "Power",
    keys: ["Power", "Power Output", "Output", "Power Supply"],
  },
  warranty: { label: "Warranty", keys: ["Warranty", "Manufacturing Warranty"] },
  battery: { label: "Battery", keys: ["Battery", "Battery Capacity", "Battery Type"] },
  cableLength: {
    label: "Cable Length",
    keys: ["Cable Length", "Cable length", "Cord Length"],
  },
  pageYield: { label: "Page Yield", keys: ["Page Yield", "Yield"] },
  printTechnology: {
    label: "Printing Technology",
    keys: ["Printing Technology", "Print Technology"],
  },
  printColor: { label: "Printing Color", keys: ["Printing Color"] },
  supportedPrinter: { label: "Supported Printer", keys: ["Supported Printer"] },
  tipSize: { label: "Tip Size", keys: ["Tip Size", "Connector Type"] },
  vesa: { label: "VESA Mount", keys: ["Vesa Wall Mount", "VESA", "Vesa"] },
};

export const GLOBAL_FILTER_GROUPS = ["warranty"];

const CATEGORY_FILTER_GROUPS = {
  processor: ["processorBrand", "socket", "cores", "threads", "processorSpeed", "type"],
  "ram-desktop": ["memoryType", "capacity", "frequency", "type"],
  "ram-laptop": ["memoryType", "capacity", "frequency", "type"],
  "graphics-card": ["memorySize", "memoryType", "graphicsEngine", "type"],
  ssd: ["capacity", "formFactor", "flashType", "interface"],
  "portable-ssd": ["capacity", "interface", "type"],
  "hard-disk-drive": ["capacity", "formFactor", "interface", "rpm"],
  "portable-hard-disk-drive": ["capacity", "interface", "type"],
  "power-supply": ["wattage", "modular", "efficiency", "type"],
  casing: ["type", "sidePanel", "formFactor", "color"],
  "cpu-cooler": ["coolerType", "socket", "height", "color"],
  "casing-cooler": ["type", "color", "lighting"],
  motherboard: ["socket", "formFactor", "memoryType", "chipset"],
  monitor: ["displaySize", "resolution", "panelType", "refreshRate"],
  keyboard: ["type", "interface", "color"],
  mouse: ["type", "interface", "color"],
  headphone: ["type", "interface", "color"],
  "all-laptop": [
    "processorBrand",
    "processorType",
    "processorSpeed",
    "capacity",
    "displaySize",
    "graphicsEngine",
    "type",
  ],
  "gaming-laptop": ["processorBrand", "capacity", "displaySize", "graphicsEngine"],
  "premium-ultrabook": ["processorBrand", "capacity", "displaySize"],
  "monitor-arm": ["warranty", "vesa"],
};

const ROOT_FILTER_GROUPS = {
  component: ["type", "capacity", "frequency", "formFactor", "interface", "color"],
  laptop: ["processorBrand", "processorType", "capacity", "displaySize", "graphicsEngine", "type"],
  desktop: ["processorBrand", "processorType", "graphicsEngine", "type"],
  gaming: ["type", "interface", "color", "lighting"],
  accessories: ["type", "interface", "color", "material"],
  networking: ["type", "frequency", "ports", "interface"],
  "office-equipment": ["type", "interface", "color"],
  camera: ["type", "sensor", "resolution", "interface"],
  security: ["type", "resolution", "interface", "power"],
  tv: ["displaySize", "resolution", "panelType", "refreshRate"],
  ups: ["power", "type", "warranty"],
  phone: ["capacity", "memorySize", "color", "type"],
  tablet: ["capacity", "displaySize", "color", "type"],
  appliance: ["type", "capacity", "color"],
  gadget: ["type", "interface", "color", "capacity"],
  "server-storage": ["type", "capacity", "formFactor", "interface"],
  software: ["type", "warranty"],
};

export function categorySlug(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getCategoryFilterGroupDefs({ name, rootName }) {
  const slug = categorySlug(name);
  const rootSlug = categorySlug(rootName ?? name);
  const ids = CATEGORY_FILTER_GROUPS[slug] ?? ROOT_FILTER_GROUPS[rootSlug] ?? [];

  return ids.map((id) => ({ id, ...GROUPS[id] })).filter((group) => group.keys);
}

export function normalizeFacetValue(value) {
  if (value === null || value === undefined) return null;

  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text || text.length > 60) return null;
  if (text.toLowerCase() === "null" || text.toLowerCase() === "n/a") return null;

  return text;
}

export function compareFacetValues(a, b) {
  return COLLATOR.compare(a, b);
}
