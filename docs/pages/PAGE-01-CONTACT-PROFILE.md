# SiteFolio Page Analysis — Page 1: Contact Profile (PM)

**URL:** `/Kroger/ViewContactInformation.sf?idContact=83709&idBusiness=8252`
**Page Title:** Kroger (Directory > Kroger > Contacts > [Contact])
**Type:** Contact detail page — the logged-in PM's own profile

---

## What This Page Is

This is the profile/contact detail page for a specific person in SiteFolio's directory. In this case, the logged-in user (Gheiath Ewais, Contact ID 83709) viewing their own profile under the Kroger business entity (Business ID 8252). Every person in SiteFolio — internal Kroger staff, architects, contractors, vendors — has a page like this.

---

## Page Navigation Structure

**Business-level tabs** (top row — these are tabs for the Kroger business entity):

| Tab | URL | Notes |
|---|---|---|
| General | `/Kroger/ViewBusinessInformation.sf?idBusiness=8252` | Kroger company info |
| **Contacts** (active) | `/Kroger/ViewBusinessContacts.sf?idBusiness=8252` | List of all Kroger contacts |
| Locations | `/Kroger/ViewBusinessLocations.sf?idBusiness=8252` | Kroger office locations |
| Diversity | `/Kroger/ViewBusinessDiversity.sf?idBusiness=8252` | Diversity info |
| Qualifications | `/Kroger/ViewBusinessQualifications.sf?idBusiness=8252` | Business qualifications |

**Contact-level tabs** (second row — tabs specific to this person):

| Tab | URL |
|---|---|
| **General** (active) | `/Kroger/ViewContactInformation.sf?idContact=83709&idBusiness=8252` |
| Projects | `/Kroger/ViewContactProjects.sf?idContact=83709&idBusiness=8252` |

The **Projects** tab is the page that lists all projects assigned to this contact — that's a separate page we'll analyze separately.

---

## Data Found on This Page

### Section 1: Name

| Field | Selector | Value |
|---|---|---|
| Courtesy | `td[id$="tdCourtesy"]` | *(empty)* |
| First Name | `td[id$="tdFirstName"]` | Gheiath |
| Middle Initial | `td[id$="tdMiddleInitial"]` | *(empty)* |
| Last Name | `td[id$="tdLastName"]` | Ewais |
| Suffix | `td[id$="tdSuffix"]` | *(empty)* |
| Nickname | `td[id$="tdNickname"]` | *(empty)* |
| Display Name | `div[id$="spnContactName"]` | Ewais, Gheiath |

### Section 2: Information

| Field | Selector | Value |
|---|---|---|
| Title | `td[id$="tdTitle"]` | FAC ENGINEERNG/PROJECT MGR |
| Location | `td[id$="tdLocation"]` | King Soopers Division Office 65 Tejon Street Denver, Colorado United States 80223 |
| Sub-Location | `td[id$="tdSubLocation"]` | *(empty)* |

### Section 3: Digits (Contact Info)

| Field | Selector | Value |
|---|---|---|
| Direct Phone | `td[id$="tdDirectPhone"]` | 9833332222 |
| Extension | `td[id$="tdExtension"]` | *(empty)* |
| Fax | `td[id$="tdFax"]` | *(empty)* |
| Mobile | `td[id$="tdMobile"]` | *(empty)* |
| Pager | `td[id$="tdPager"]` | *(empty)* |
| Email | `td[id$="tdEmail"]` | gheiath.ewais@kroger.com |

### Section 4: Photo

No photo uploaded for this contact.

### Section 5: Personal (per-enterprise contact info)

| Field | Selector | Value |
|---|---|---|
| Phone | `td[id$="tdPhone"]` (personal) | *(empty)* |
| Mobile | `td[id$="tdMobile"]` (personal) | *(empty)* |
| Email | `td[id$="tdEmail"]` (personal) | *(empty)* |

### Section 6: Custom Fields

Empty — no custom fields defined for this contact.

### Section 7: Notes

"This enterprise has not entered any notes for this contact."

### Section 8: Associations

"There are currently no associations."

### Section 9: Status

| Field | Selector | Value |
|---|---|---|
| Status | `td[id$="tdStatus"]` | Active |
| Include | `td[id$="tdInclude"]` | Kroger |

Hidden fields confirm: Contact ID = 83709, Business ID = 8252, Enterprise ID = 8252.

---

## ASMX Endpoints / APIs Discovered

**vCard download:**
```
/ws/Directory/Contact.asmx/GetVCard?contactID=83709
```
This exports the contact as a vCard file — could be used to extract structured contact data for any person in the directory.

**Dialog functions in JS:**
- `DirectoryAssociations` — property page for managing contact associations
- `DirectoryContactPhoto` — photo upload dialog
- `DirectoryContactNote` — note management dialog

---

## URL Pattern for Any Contact

```
/Kroger/ViewContactInformation.sf?idContact={contactId}&idBusiness={businessId}
```

This same page structure applies to **any** contact in SiteFolio — not just the logged-in user. If we know someone's `contactId`, we can fetch their profile page and parse the same DOM structure.

The **Projects** tab for any contact:
```
/Kroger/ViewContactProjects.sf?idContact={contactId}&idBusiness={businessId}
```

---

## What's Useful Here

### High Value
1. **Contact identity fields** — First name, last name, title, email, phone. This is the canonical source for a person's contact info in SiteFolio.
2. **Title field** — "FAC ENGINEERNG/PROJECT MGR" tells us the person's role within Kroger. This could be used to identify PMs vs CMs vs other staff.
3. **Location** — Office address (King Soopers Division Office, Denver).
4. **Status** — Active/Inactive flag. Useful for filtering.
5. **Projects tab link** — The "Projects" tab on this page leads to the full list of projects assigned to this contact. That's a key entry point for discovering which projects a PM manages.

### Medium Value
6. **vCard endpoint** — Programmatic way to export any contact's info as a vCard.
7. **Business-level tabs** — The "Contacts" tab at the business level (`ViewBusinessContacts.sf?idBusiness=8252`) lists ALL contacts under Kroger. Could be used to enumerate the full team.

### Low Value
8. **Photo, Custom, Notes, Associations** — All empty for this contact. Other contacts (especially contractors/architects) may have more data here.

---

## Relationships to Other Pages

| From this page... | To... | Relationship |
|---|---|---|
| Contact "Projects" tab | `ViewContactProjects.sf?idContact={id}` | Lists all projects assigned to this person |
| Business "Contacts" tab | `ViewBusinessContacts.sf?idBusiness=8252` | Lists all people under Kroger |
| Business "General" tab | `ViewBusinessInformation.sf?idBusiness=8252` | Kroger company info |
| Business "Locations" tab | `ViewBusinessLocations.sf?idBusiness=8252` | Office locations |
| vCard endpoint | `/ws/Directory/Contact.asmx/GetVCard?contactID={id}` | Structured contact export |

---

## Notes

- This page is the **starting point** for identifying who a PM is and what projects they own. The pattern is: fetch this page → get contact info → click "Projects" tab → get project list.
- The same page structure works for **any contact** — architects, contractors, vendors. If we later want to build a contact directory feature, we parse this same DOM for every `contactId`.
- The `contactId` (83709) and `businessId` (8252) are the key identifiers. The `contactId` is unique per person. The `businessId` identifies the company they belong to (Kroger = 8252).
