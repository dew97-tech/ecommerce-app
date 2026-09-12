export const BUILDER_SLOT_GROUPS = [
  { id: "core", label: "Core components", description: "Everything needed for a working PC" },
  { id: "optional", label: "Optional extras", description: "Peripherals and upgrades" },
];

export const BUILDER_SLOTS = [
  {
    key: "cpu",
    label: "Processor",
    group: "core",
    required: true,
    categories: ["Processor"],
  },
  {
    key: "motherboard",
    label: "Motherboard",
    group: "core",
    required: true,
    categories: ["Motherboard"],
  },
  {
    key: "ram",
    label: "Memory (RAM)",
    group: "core",
    required: true,
    categories: ["RAM (Desktop)"],
  },
  {
    key: "storage",
    label: "Storage",
    group: "core",
    required: true,
    categories: ["SSD", "Hard Disk Drive"],
  },
  {
    key: "gpu",
    label: "Graphics Card",
    group: "core",
    required: false,
    categories: ["Graphics Card"],
  },
  {
    key: "casing",
    label: "Casing",
    group: "core",
    required: true,
    categories: ["Casing"],
  },
  {
    key: "psu",
    label: "Power Supply",
    group: "core",
    required: true,
    categories: ["Power Supply"],
  },
  {
    key: "cooler",
    label: "CPU Cooler",
    group: "core",
    required: false,
    categories: ["CPU Cooler", "Water / Liquid Cooling"],
  },
  {
    key: "os",
    label: "Operating System",
    group: "optional",
    required: false,
    categories: ["Operating System"],
  },
  {
    key: "monitor",
    label: "Monitor / TV",
    group: "optional",
    required: false,
    categories: ["Monitor", "Portable Monitor", "Touch Monitor", "All TV"],
    subtree: false,
  },
  {
    key: "keyboard",
    label: "Keyboard",
    group: "optional",
    required: false,
    categories: ["Keyboard"],
  },
  {
    key: "mouse",
    label: "Mouse",
    group: "optional",
    required: false,
    categories: ["Mouse"],
  },
  {
    key: "headset",
    label: "Headphone",
    group: "optional",
    required: false,
    categories: ["Headphone"],
  },
  {
    key: "ups",
    label: "UPS",
    group: "optional",
    required: false,
    categories: ["UPS", "Online UPS", "Offline UPS"],
  },
];

export const BUILDER_SLOT_KEYS = BUILDER_SLOTS.map((slot) => slot.key);

export function getSlotDefinition(slotKey) {
  return BUILDER_SLOTS.find((slot) => slot.key === slotKey) ?? null;
}

export function getSlotsByGroup(groupId) {
  return BUILDER_SLOTS.filter((slot) => slot.group === groupId);
}
