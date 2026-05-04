# SiteFolio Page Analysis — Page 5: Project Directory (Team)

**URL:** `/Kroger/ProjectDirectoryHome2.sf?idProject=131317&idfilter=0`
**Page Title:** Project Directory
**Type:** Full team directory for a single project — all companies and contacts
**Project:** 620-00152-01 KS-152 2027 New Store, Lone Tree, CO - Ridgegate (SF ID: 131317)

---

## What This Page Is

This is the **TEAM tab** on the project navigation — the full directory of all companies and contacts assigned to a project, organized by category (Owner, Professional Consultant, Contractor, Subcontractor, etc.). Unlike the summary team contacts on the Overview page (Page 3), this page shows the **complete directory** including company names, addresses, and individual contact details.

---

## Critical Finding: Lazy-Loaded Content

Unlike Pages 1–4 where data is server-rendered in the initial HTML, **this page loads its directory content dynamically via AJAX**. The initial HTML contains only an empty placeholder:

```html
<div id="pdlp_content" />
```

The actual directory data is fetched client-side after page load via:

```javascript
$.ajax({
    type: 'GET',
    url: '/' + 'Kroger' + '/Directory2/Directory/Index',
    dataType: 'html',
    data: {
        cache: false,
        projectID: '131317',
        pdetID: '0',
        enterpriseFilterID: '0',
        directoryEntryFilterID: '',
    },
    success: function (html) {
        $('#pdlp_content').html(html);
    }
});
```

This means **the initial page fetch does NOT contain any team/directory data**. To get the actual directory content, the parser must make a separate HTTP GET request to:

```
GET /Kroger/Directory2/Directory/Index?cache=false&projectID=131317&pdetID=0&enterpriseFilterID=0&directoryEntryFilterID=
```

This is a **new endpoint pattern** — it's not ASMX form-encoded POST like most SiteFolio calls. It's a standard HTTP GET that returns HTML which gets inserted into `#pdlp_content`.

---

## Team Category Filter URLs

The TEAM nav sub-menu confirms **11 category filters** plus "All" and "Send Team Notification":

| Category | `bn` Value | URL |
|---|---|---|
| All | (none) | `ProjectDirectoryHome2.sf?idProject=131317&idfilter=0` |
| Owner | 4 | `ProjectDirectoryHome2.sf?idProject=131317&bn=4&idfilter=8252` |
| Broker/Developer | 5 | `...&bn=5&idfilter=8252` |
| Professional Consultant | 2 | `...&bn=2&idfilter=8252` |
| Subconsultant | 16 | `...&bn=16&idfilter=8252` |
| Contractor | 3 | `...&bn=3&idfilter=8252` |
| Subcontractor | 6 | `...&bn=6&idfilter=8252` |
| Government Entity | 8 | `...&bn=8&idfilter=8252` |
| Equipment/Materials Vendor | 12 | `...&bn=12&idfilter=8252` |
| Other | 7 | `...&bn=7&idfilter=8252` |
| Utility Company | 20 | `...&bn=20&idfilter=8252` |

**Team Notification URL:** `/Kroger/ProjectDirectoryEmailTeam.sf?idProject=131317&bn=-1&idfilter=0`

---

## Reports on This Page

Two downloadable reports:

| Report | Format | URL Pattern |
|---|---|---|
| Project Directory Report | PDF | `/reports/idProject!131317|idfilter!0|reportname!ProjectDirectory/ProjectDirectory|...|format!2|.../ProjectDirectory.pdf` |
| GC Bidder for eSourcing | XLSM | `/reports/idProject!131317|idfilter!0|reportname!Kroger/GCBidder|...|format!14|.../GCBidder.xlsm` |

**New format code:** `format!14` = XLSM (macro-enabled Excel). The GC Bidder report is specific to this page and not on the Overview page — it's a Kroger-specific eSourcing export.

---

## JS Configuration

```javascript
ProjectDirectoryListPartUI._enterpriseUrlName = 'Kroger';
ProjectDirectoryListPartUI._projectID = '131317';
ProjectDirectoryListPartUI._pdetID = '0';          // directory entry type filter (0 = all)
ProjectDirectoryListPartUI._enterpriseFilterID = '0'; // enterprise filter (0 = all)
ProjectDirectoryListPartUI._directoryEntryFilterID = ''; // specific entry filter
```

External JS files loaded:
- `/Scripts/Directory2/directory2.js` — Directory2 UI framework
- `/Scripts/Directory2/debugconfig.js` — Debug configuration
- `/Scripts/Core/3p/spin/spin.js` + `jquery.spin.js` — Loading spinner
- `/Content/Directory2/directory2.css` — Directory2 CSS

---

## DOM Selectors

Since the content is lazy-loaded, selectors apply to the **AJAX-returned HTML** inside `#pdlp_content`, not the initial page HTML. The actual structure of the returned HTML is unknown from this page source alone — we'd need to capture the AJAX response to document the inner DOM.

**What we know from the Overview page (Page 3):** The team contacts summary on the Overview page used this structure per contact row:
- `td[id$="tdJob"]` → role
- `td[id$="tdContact"]` → name
- `td[id$="tdPhone"]` → phone
- `td[id$="tdEmail"] a` → email

The full Directory page likely uses a similar or enhanced structure with additional fields (company name, address, category grouping).

---

## What's Useful Here

### High Value
1. **AJAX endpoint for directory data** — `GET /Kroger/Directory2/Directory/Index` with query params returns the full team HTML. This is a clean API-like endpoint that can be called directly with cookies.
2. **Category `bn` IDs** — The 11 team category values (Owner=4, Contractor=3, etc.) can filter the directory by role type.
3. **GC Bidder report** — A Kroger-specific XLSM export for eSourcing, only available from this page.

### Medium Value
4. **Team Notification feature** — The "Send Team Notification" URL (`ProjectDirectoryEmailTeam.sf`) could be useful for building notification features.
5. **Category filter via `pdetID`** — The JS config shows `pdetID` as a parameter, likely corresponding to directory entry type. When `bn` is set in the URL, `pdetID` may change accordingly.

---

## Relationships to Other Pages

| From this page... | To... | How |
|---|---|---|
| AJAX endpoint | `GET /Kroger/Directory2/Directory/Index?projectID=131317` | Fetches actual directory HTML |
| Category filter | `ProjectDirectoryHome2.sf?idProject=131317&bn={categoryId}` | Filter by team category |
| Team Notification | `ProjectDirectoryEmailTeam.sf?idProject=131317` | Email team members |
| Overview summary | `ProjectOverviewView.sf?idProject=131317` | Abbreviated team list on Overview |

---

## Notes

- This is the **first page we've seen that uses lazy-loaded AJAX content** instead of server-rendered HTML. The initial page fetch returns an empty `#pdlp_content` div. All actual directory data comes from a subsequent GET request.
- The AJAX endpoint (`/Kroger/Directory2/Directory/Index`) uses a **different pattern** than ASMX endpoints. It's a standard MVC-style GET returning HTML, not XML. This is likely a newer part of the SiteFolio codebase (the "Directory2" naming suggests a v2 rewrite).
- To build a parser for this page, we need to either: (a) call the AJAX endpoint directly and parse the returned HTML, or (b) capture the AJAX response HTML to document its DOM structure. The Overview page's team summary (Page 3) gives us a preview of the data fields, but the full directory page likely has more detail per contact.
- The `pdetID` parameter in the JS config is `0` for "All" view. When filtering by category, this value likely changes. Testing with category-filtered URLs would confirm.
- The GC Bidder XLSM report introduces a new format code (`format!14` = XLSM) not seen on other pages.
