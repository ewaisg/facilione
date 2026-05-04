# SiteFolio Page Analysis — Page 14: OVERVIEW > Design Attributes

**URL:** `/Kroger/SiteBuildingDesignView.sf?idProject=177956&bn=8254&idfilter=8252`
**Page Title:** Site & Building Design Attributes
**Type:** Physical building and site specifications
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

The **Design Attributes** page is the second OVERVIEW sub-page (after Classification). It contains physical building dimensions, site/building areas, construction methods/materials, and Kroger-specific custom fields for fuel center and store equipment details. **Server-rendered**, no ASMX calls.

Edit URL: `/Kroger/SiteBuildingDesignEdit.sf?idProject=177956&bn=8254&idfilter=8252`

---

## Section 1: Site & Building Design Attributes

Standard fields:

| Field | Value | Selector |
|---|---|---|
| Stories | 1 | `td[id$="tdStories"]` |
| Total Site Parking | 0 | `td[id$="tdStalls"]` |
| Facility Parking | 0 | `td[id$="tdFacilityParking"]` |
| Building Dim Width | (empty) | `td[id$="tdBuildingWidth"]` |
| Building Dim Depth | (empty) | `td[id$="tdBuildingDepth"]` |

Kroger-custom fields (using `EnterpriseCustom` prefix — different from Classification's `BusinessCustom`):

| Field | Value |
|---|---|
| Other Dock Type | (empty) |
| Fuel Multi-product Dispensers | 5MPD stacked |
| Fuel Type - Diesel? | (empty) |
| Fuel Type - E85? | (empty) |
| Fuel - Restrooms | (empty) |
| Fuel Vapor Recovery - Stage II? | (empty) |
| Apparel Department? | (empty) |
| ClickList? | (empty) |
| Natural Gas Service? | (empty) |
| Shelving Mfr. | (empty) |
| Dock Type | (empty) |
| Fuel Tank Mfr. | (empty, MultiSelect) |
| Fuel Tank Sizes | (empty, MultiSelect) |
| Fuel Dispenser Models | (empty, MultiSelect) |
| Electric Service to Store | (empty, MultiSelect) |

---

## Section 2: Site & Building Areas

| Field | Value | Size Field ID |
|---|---|---|
| F1 Gross Building Area | 135,520 SqFt | 128 |
| Site Area | 0 Acres | 256 |
| F1 Sales Area | 94,821 SqFt | 512 |
| Shopping Center Area | 0 Acres | 1024 |
| F1 Base Store Area | 0 Acres | 2048 |

Hidden inputs store the size field type IDs (128, 256, 512, 1024, 2048) — these appear to be bitmask values.

---

## Section 3: Additional Project Areas

| Field | Value | Selector |
|---|---|---|
| Building Size | 0 SqFt | `td[id$="tdBuildingSize"]` |
| Site Size | 0 Acres | `td[id$="tdSiteSize"]` |

---

## Section 4: Site & Building Methods / Materials

All fields are `(None)` for this project. Available fields:

| Field | Selector |
|---|---|
| Roof Styles | `td[id$="tdRoofStyles"]` |
| Foundation | `td[id$="tdFoundations"]` |
| Superstructure | `td[id$="tdSuperstructures"]` |
| Roof Constructions | `td[id$="tdRoofConstructions"]` |
| Roof Coverings | `td[id$="tdRoofCoverings"]` |
| Exterior Enclosure | `td[id$="tdExteriorEnclosures"]` |
| Exterior Finish | `td[id$="tdExteriorFinishes"]` |
| Storm Drainage | `td[id$="tdStormDrainage"]` |

---

## Section 5: Site Building Notes

Empty for this project. Uses `SiteBuildingNote` property page for CRUD (via `JS_WP_RL534346799`).

---

## Custom Field Prefix Difference

Design Attributes uses **`EnterpriseCustom`** prefix (`EnterpriseCustomLabel`, `EnterpriseCustomDropDown`, `EnterpriseCustomMultiSelect`) — distinct from Classification's **`BusinessCustom`** prefix. This reflects two separate custom field scopes in SiteFolio: enterprise-level (shared across all enterprises) vs. business-level (Kroger-specific).

---

## Notes

- **Server-rendered**, no new ASMX endpoints.
- The key data here for a new store project is the building area: **F1 Gross Building Area = 135,520 SqFt** and **F1 Sales Area = 94,821 SqFt**.
- The fuel center fields (dispensers, tanks, diesel, E85, vapor recovery) are mostly empty — likely populated later in the project lifecycle or on fuel-specific projects.
- Construction methods/materials are all `(None)` — may be populated on completed projects or remodel projects where existing conditions matter.
- The `bn=8254` value is shared with Photos - Work-in-Progress — different page types sharing bn values.
- This completes all pages in scope: FILES (Text Documents) and OVERVIEW (Classification + Design Attributes).
