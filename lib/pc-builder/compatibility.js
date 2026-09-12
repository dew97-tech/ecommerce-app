const DDR_PATTERN = /\bDDR\s?([345])/i;
const SOCKET_PATTERN = /(AM\d+|LGA\s?\d{3,4}|FM\d)/i;

const SPEC_KEYS = {
  socket: ["Socket", "CPU Socket", "Socket Type", "Processor Socket", "Supported Socket", "Supported CPU"],
  memoryType: ["Memory Type", "RAM Type", "Supported Memory", "Memory Standard", "Type"],
  wattage: ["Continuous Power", "Total Power", "Wattage", "Output Power", "Max Power", "Power", "Peak Power"],
  tdp: ["Default TDP", "TDP", "Power Consumption", "Consumption", "Max TDP", "Thermal Design Power"],
  gpuLength: ["Card Length", "GPU Length", "Length", "Dimensions"],
  maxGpuLength: [
    "Maximum Graphics Card Length",
    "Maximum GPU Length",
    "Max GPU Length",
    "GPU Clearance",
    "VGA Length",
    "Maximum VGA Length",
  ],
  recommendedPsu: ["Recommended PSU", "Power Supply Requirement", "PSU Requirement"],
  coolerSockets: ["Socket", "CPU Socket", "Supported Socket", "Intel", "AMD"],
  formFactor: ["Form Factor", "Motherboard Form Factor"],
  coolerHeight: ["Dimension", "Dimensions", "Height", "CPU Cooler Height"],
  maxCoolerHeight: [
    "Maximum CPU Cooler Height",
    "Max CPU Cooler Height",
    "CPU Cooler Height Clearance",
  ],
  motherboardSupport: [
    "Motherboard Support",
    "Supported Motherboard",
    "Form Factor Support",
  ],
};

const CHIP_KEYS = {
  cpu: ["Cores", "Threads", "Base Frequency", "Default TDP"],
  motherboard: ["Type", "Form Factor", "Chipset"],
  ram: ["Type", "Capacity", "Frequency"],
  gpu: ["Type", "Dimensions", "Core Clock"],
  storage: ["Capacity", "Form Factor", "Flash Type", "Interface"],
  psu: ["Continuous Power", "Modular Type", "Certification"],
  casing: ["Type", "Motherboard Support", "Maximum Graphics Card Length"],
  cooler: ["Type", "Dimension"],
  os: ["Type", "License", "Version"],
  monitor: ["Display Size", "Resolution", "Panel Type"],
  keyboard: ["Type", "Interface", "Connectivity"],
  mouse: ["Type", "Interface", "Connectivity"],
  headset: ["Type", "Interface", "Connectivity"],
  ups: ["Power", "Type", "Capacity"],
};

function readAttribute(attributes, keys) {
  if (!attributes || typeof attributes !== "object") return null;

  for (const key of keys) {
    const rawValue = attributes[key];
    if (rawValue === undefined || rawValue === null) continue;

    const text = String(rawValue).replace(/\s+/g, " ").trim();
    if (text) return text;
  }

  return null;
}

function readUsableAttribute(attributes, keys, isUsable) {
  if (!attributes || typeof attributes !== "object") return null;

  for (const key of keys) {
    const rawValue = attributes[key];
    if (rawValue === undefined || rawValue === null) continue;

    const text = String(rawValue).replace(/\s+/g, " ").trim();
    if (text && isUsable(text)) return text;
  }

  return null;
}

function firstNumber(value) {
  if (!value) return null;
  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function extractLength(value) {
  if (!value) return null;

  const text = String(value);
  const lengthMatch = text.match(/\(L\)\s*(\d+(?:\.\d+)?)/i);
  if (lengthMatch) return Number(lengthMatch[1]);

  const labelled = text.match(/length[:\s]*(\d+(?:\.\d+)?)/i);
  if (labelled) return Number(labelled[1]);

  return firstNumber(text);
}

export function extractSocket(value) {
  if (!value) return null;
  const match = String(value).match(SOCKET_PATTERN);
  return match ? match[1].replace(/\s+/g, "").toUpperCase() : null;
}

function normalizeSocket(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

const SOCKET_TOKEN_PATTERN = /(AM[345]\+?|FM\d|LGA\s?\d{3,4}|\b\d{3,4}\b)/gi;

function socketTokens(value) {
  const tokens = new Set();

  for (const match of String(value ?? "").matchAll(SOCKET_TOKEN_PATTERN)) {
    tokens.add(normalizeSocket(match[1]));
  }

  return tokens;
}

function socketSupported(target, supportText) {
  const normalizedTarget = normalizeSocket(target);
  const tokens = socketTokens(supportText);

  if (tokens.has(normalizedTarget)) return true;

  const numericTarget = normalizedTarget.replace(/^(LGA|FM)/, "");
  return (
    tokens.has(numericTarget) ||
    tokens.has(`LGA${numericTarget}`) ||
    tokens.has(`FM${numericTarget}`)
  );
}

const FORM_FACTOR_PATTERNS = [
  ["E-ATX", /\be[\s-]?atx\b/i],
  ["Micro-ATX", /\b(?:micro[\s-]?atx|m[\s-]?atx|uatx)\b/i],
  ["Mini-ITX", /\bmini[\s-]?itx\b/i],
  ["ITX", /\bitx\b/i],
  ["ATX", /\batx\b/i],
];

const FORM_FACTOR_RANK = {
  "Mini-ITX": 1,
  "Micro-ATX": 2,
  ATX: 3,
  "E-ATX": 4,
};

function detectFormFactor(value) {
  const text = String(value ?? "");

  for (const [label, pattern] of FORM_FACTOR_PATTERNS) {
    if (pattern.test(text)) return label;
  }

  return null;
}

function getCaseFormFactorSupport(value) {
  const text = String(value ?? "");
  const supported = new Set();

  const upTo = text.match(
    /up\s*to\s*(e[\s-]?atx|micro[\s-]?atx|m[\s-]?atx|mini[\s-]?itx|itx|atx)/i
  );
  if (upTo) {
    const label = detectFormFactor(upTo[1]);
    if (label) {
      for (const [candidate, rank] of Object.entries(FORM_FACTOR_RANK)) {
        if (rank <= FORM_FACTOR_RANK[label]) supported.add(candidate);
      }
      return supported;
    }
  }

  for (const [label, pattern] of FORM_FACTOR_PATTERNS) {
    if (pattern.test(text)) supported.add(label);
  }

  if (supported.has("E-ATX") || supported.has("ATX")) {
    supported.add("Micro-ATX");
    supported.add("Mini-ITX");
  }

  return supported;
}

const HOLD_TIME_PATTERN = /\bms\b|millisecond|hold[\s-]?up/i;

function readWattage(product) {
  const source = readUsableAttribute(
    product?.attributes,
    SPEC_KEYS.wattage,
    (text) => !HOLD_TIME_PATTERN.test(text) && firstNumber(text) !== null
  );
  if (source) return firstNumber(source);

  const nameMatch = String(product?.name ?? "").match(/\b(\d{3,4})\s?w(?:att)?s?\b/i);
  return nameMatch ? Number(nameMatch[1]) : null;
}

function readCoolerSockets(attributes) {
  if (!attributes || typeof attributes !== "object") return null;

  const values = [];
  for (const key of SPEC_KEYS.coolerSockets) {
    const rawValue = attributes[key];
    if (rawValue === undefined || rawValue === null) continue;

    const text = String(rawValue).replace(/\s+/g, " ").trim();
    if (text) values.push(text);
  }

  return values.length > 0 ? values.join(" / ") : null;
}

function extractCoolerHeight(value) {
  if (!value) return null;

  const text = String(value);
  if (/radiator/i.test(text)) return null;

  const anchored = text.match(
    /product\s*dimensions?:?\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i
  );
  if (anchored) return Number(anchored[3]);

  const numbers = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) =>
    Number(match[1])
  );
  return numbers.length > 0 ? Math.max(...numbers) : null;
}

function isLiquidCooler(product) {
  const text = `${product?.name ?? ""} ${product?.attributes?.Type ?? ""}`;
  return /liquid|aio|water\s*cool/i.test(text);
}

function readCasingCoolerClearance(attributes) {
  const text = readAttribute(attributes, SPEC_KEYS.maxCoolerHeight);
  if (!text) return null;

  if (/(top|bottom|side|radiator|fan|front|rear)/i.test(text)) return null;

  return firstNumber(text);
}

export function getProductSpecs(product) {
  const attributes = product?.attributes;
  const memorySource = readUsableAttribute(
    attributes,
    SPEC_KEYS.memoryType,
    (text) => DDR_PATTERN.test(text)
  );
  const memoryMatch = memorySource ? memorySource.match(DDR_PATTERN) : null;
  const coolerDimension = readAttribute(attributes, SPEC_KEYS.coolerHeight);

  return {
    socket:
      extractSocket(readAttribute(attributes, SPEC_KEYS.socket)) ??
      extractSocket(product?.name),
    memoryType: memoryMatch ? `DDR${memoryMatch[1]}` : null,
    wattage: readWattage(product),
    tdp: firstNumber(readAttribute(attributes, SPEC_KEYS.tdp)),
    gpuLength: extractLength(readAttribute(attributes, SPEC_KEYS.gpuLength)),
    maxGpuLength: firstNumber(readAttribute(attributes, SPEC_KEYS.maxGpuLength)),
    recommendedPsu: firstNumber(readAttribute(attributes, SPEC_KEYS.recommendedPsu)),
    coolerSockets: readCoolerSockets(attributes),
    formFactor: detectFormFactor(readAttribute(attributes, SPEC_KEYS.formFactor)),
    isLiquid: isLiquidCooler(product),
    coolerHeight: isLiquidCooler(product) ? null : extractCoolerHeight(coolerDimension),
    maxCoolerHeight: readCasingCoolerClearance(attributes),
    motherboardSupport: readAttribute(attributes, SPEC_KEYS.motherboardSupport),
  };
}

export function getSpecChips(slotKey, product, limit = 3) {
  const keys = CHIP_KEYS[slotKey] ?? [];
  const chips = [];

  for (const key of keys) {
    const value = readAttribute(product?.attributes, [key]);
    if (!value) continue;
    chips.push(value.length > 30 ? `${value.slice(0, 30)}…` : value);
    if (chips.length >= limit) break;
  }

  if (chips.length === 0 && product?.brand) {
    chips.push(product.brand);
  }

  return chips;
}

export function estimateWattage(selectedProducts = {}) {
  const cpu = selectedProducts.cpu ? getProductSpecs(selectedProducts.cpu) : null;
  const gpu = selectedProducts.gpu ? getProductSpecs(selectedProducts.gpu) : null;

  const cpuLoad = cpu?.tdp ?? (selectedProducts.cpu ? 95 : 0);
  const gpuLoad = gpu?.tdp ?? (selectedProducts.gpu ? 180 : 0);
  const baseline = 80;

  return Math.round(baseline + cpuLoad + gpuLoad);
}

export function checkCompatibility(selectedProducts = {}) {
  const issues = [];
  const specs = {};

  for (const [slotKey, product] of Object.entries(selectedProducts)) {
    if (product) specs[slotKey] = getProductSpecs(product);
  }

  const { cpu, motherboard, ram, gpu, psu, casing, cooler } = specs;

  if (
    cpu?.socket &&
    motherboard?.socket &&
    normalizeSocket(cpu.socket) !== normalizeSocket(motherboard.socket)
  ) {
    issues.push({
      level: "blocker",
      code: "socket",
      message: `CPU socket (${cpu.socket}) does not match the motherboard socket (${motherboard.socket}).`,
      slots: ["cpu", "motherboard"],
    });
  }

  if (
    ram?.memoryType &&
    motherboard?.memoryType &&
    ram.memoryType !== motherboard.memoryType
  ) {
    issues.push({
      level: "blocker",
      code: "memoryType",
      message: `Selected memory is ${ram.memoryType} but the motherboard supports ${motherboard.memoryType}.`,
      slots: ["ram", "motherboard"],
    });
  }

  if (
    cpu?.memoryType &&
    motherboard?.memoryType &&
    cpu.memoryType !== motherboard.memoryType
  ) {
    issues.push({
      level: "warning",
      code: "cpuMemoryType",
      message: `The processor is designed for ${cpu.memoryType} memory but the motherboard is ${motherboard.memoryType}.`,
      slots: ["cpu", "motherboard"],
    });
  }

  const estimatedWattage = estimateWattage(selectedProducts);
  if (psu?.wattage) {
    if (psu.wattage < estimatedWattage) {
      issues.push({
        level: "blocker",
        code: "psuCapacity",
        message: `Estimated load is ~${estimatedWattage}W but the power supply is only ${psu.wattage}W.`,
        slots: ["psu"],
      });
    } else if (psu.wattage < estimatedWattage * 1.25) {
      issues.push({
        level: "warning",
        code: "psuHeadroom",
        message: `Power supply headroom is low (~${estimatedWattage}W load on a ${psu.wattage}W unit). A larger unit is recommended.`,
        slots: ["psu"],
      });
    }
  }

  if (
    gpu?.recommendedPsu &&
    psu?.wattage &&
    psu.wattage < gpu.recommendedPsu
  ) {
    issues.push({
      level: "warning",
      code: "gpuPsu",
      message: `The graphics card recommends at least a ${gpu.recommendedPsu}W power supply.`,
      slots: ["gpu", "psu"],
    });
  }

  if (
    gpu?.gpuLength &&
    casing?.maxGpuLength &&
    gpu.gpuLength > casing.maxGpuLength
  ) {
    issues.push({
      level: "blocker",
      code: "gpuLength",
      message: `Graphics card length (${gpu.gpuLength}mm) exceeds the case clearance (${casing.maxGpuLength}mm).`,
      slots: ["gpu", "casing"],
    });
  }

  if (cpu?.socket && cooler?.coolerSockets) {
    if (!socketSupported(cpu.socket, cooler.coolerSockets)) {
      issues.push({
        level: "warning",
        code: "coolerSocket",
        message: `The cooler may not support the ${cpu.socket} socket. Please confirm compatibility.`,
        slots: ["cooler", "cpu"],
      });
    }
  }

  if (
    cooler?.coolerHeight &&
    casing?.maxCoolerHeight &&
    cooler.coolerHeight > casing.maxCoolerHeight
  ) {
    issues.push({
      level: "warning",
      code: "coolerHeight",
      message: `CPU cooler height (${cooler.coolerHeight}mm) exceeds the case clearance (${casing.maxCoolerHeight}mm).`,
      slots: ["cooler", "casing"],
    });
  }

  if (
    motherboard?.formFactor &&
    casing?.motherboardSupport &&
    !getCaseFormFactorSupport(casing.motherboardSupport).has(
      motherboard.formFactor
    )
  ) {
    issues.push({
      level: "warning",
      code: "formFactor",
      message: `The ${motherboard.formFactor} motherboard may not fit the selected case.`,
      slots: ["motherboard", "casing"],
    });
  }

  const selectedIds = Object.values(selectedProducts)
    .filter(Boolean)
    .map((product) => product.id);
  if (new Set(selectedIds).size !== selectedIds.length) {
    issues.push({
      level: "warning",
      code: "duplicate",
      message: "The same product is selected in more than one slot.",
    });
  }

  const unverified = [];
  const selected = (slot) => Boolean(selectedProducts[slot]);

  if (
    selected("cpu") &&
    selected("motherboard") &&
    (!cpu?.socket || !motherboard?.socket)
  ) {
    unverified.push("CPU socket");
  }
  if (
    selected("ram") &&
    selected("motherboard") &&
    (!ram?.memoryType || !motherboard?.memoryType)
  ) {
    unverified.push("memory type");
  }
  if (
    selected("gpu") &&
    selected("casing") &&
    (!gpu?.gpuLength || !casing?.maxGpuLength)
  ) {
    unverified.push("GPU clearance");
  }
  if (
    selected("cooler") &&
    selected("casing") &&
    !cooler?.isLiquid &&
    (!cooler?.coolerHeight || !casing?.maxCoolerHeight)
  ) {
    unverified.push("cooler height");
  }
  if (
    selected("motherboard") &&
    selected("casing") &&
    (!motherboard?.formFactor || !casing?.motherboardSupport)
  ) {
    unverified.push("form factor");
  }
  if (selected("psu") && !psu?.wattage) {
    unverified.push("power supply wattage");
  }

  if (unverified.length > 0) {
    issues.push({
      level: "info",
      code: "unverified",
      message: `Could not verify: ${unverified.join(", ")} (specs missing).`,
      slots: [],
    });
  }

  return issues;
}

export function hasBlockingIssues(issues = []) {
  return issues.some((issue) => issue.level === "blocker");
}
