/**
 * Estimate Preset Sections
 *
 * Extracted from FaciliTools estimate.html PRESET_SECTIONS.
 * Defines the default section templates available when building estimates.
 */

import type { PresetSectionDef } from "@/types/estimate"

function buildDeptPreset(name: string): PresetSectionDef {
  return {
    key: name.toLowerCase().replace(/[^a-z]/g, "-"),
    name,
    columns: ["item", "vendor", "qty", "unitCost", "extended"],
    contingency: false,
    contPct: 0,
    defaults: [
      { item: "Cases / Fixtures", vendor: "", qty: "", unitCost: "" },
      { item: "Shelving", vendor: "", qty: "", unitCost: "" },
      { item: "Signage", vendor: "", qty: "", unitCost: "" },
    ],
  }
}

export const PRESET_SECTIONS: PresetSectionDef[] = [
  {
    key: "soft-costs",
    name: "Soft Costs / Development",
    columns: ["item", "vendor", "amount"],
    contingency: false,
    contPct: 0,
    defaults: [
      { item: "Architectural / Design Drawings", vendor: "" },
      { item: "Permits & Fees", vendor: "" },
      { item: "In-House Engineering", vendor: "" },
      { item: "Due Diligence / ACM Survey", vendor: "" },
      { item: "Contingency \u2014 Unanticipated", vendor: "" },
    ],
  },
  {
    key: "contractor",
    name: "Contractor / GC Estimate",
    columns: ["item", "vendor", "amount"],
    contingency: true,
    contPct: 10,
    defaults: [
      { item: "General Conditions", vendor: "" },
      { item: "Demolition", vendor: "" },
      { item: "Framing / Drywall", vendor: "" },
      { item: "Electrical", vendor: "" },
      { item: "Plumbing", vendor: "" },
      { item: "HVAC", vendor: "" },
      { item: "Flooring / Finishes", vendor: "" },
      { item: "Painting", vendor: "" },
    ],
  },
  buildDeptPreset("Meat"),
  buildDeptPreset("Produce"),
  buildDeptPreset("Deli / Bakery"),
  buildDeptPreset("Dairy"),
  buildDeptPreset("Grocery"),
  buildDeptPreset("Front End"),
  buildDeptPreset("Non-Foods"),
  {
    key: "refrigeration",
    name: "Refrigeration / Direct Buy",
    columns: ["item", "vendor", "qty", "unitCost", "extended"],
    contingency: false,
    contPct: 0,
    defaults: [
      { item: "Display Cases", vendor: "Hussmann", qty: "", unitCost: "" },
      { item: "Condensing Units", vendor: "", qty: "", unitCost: "" },
      { item: "Walk-In Cooler / Freezer", vendor: "", qty: "", unitCost: "" },
    ],
  },
  {
    key: "equipment-misc",
    name: "Equipment \u2014 Miscellaneous",
    columns: ["item", "vendor", "qty", "unitCost", "extended"],
    contingency: false,
    contPct: 0,
    defaults: [
      { item: "", vendor: "", qty: "", unitCost: "" },
      { item: "", vendor: "", qty: "", unitCost: "" },
    ],
  },
  {
    key: "shipping",
    name: "Shipping & Delivery",
    columns: ["item", "vendor", "amount"],
    contingency: false,
    contPct: 0,
    defaults: [
      { item: "Shipping \u2014 Equipment", vendor: "" },
      { item: "Shipping \u2014 Fixtures", vendor: "" },
    ],
  },
]

/** Quick lookup by key */
export const PRESET_MAP = Object.fromEntries(PRESET_SECTIONS.map((p) => [p.key, p]))
