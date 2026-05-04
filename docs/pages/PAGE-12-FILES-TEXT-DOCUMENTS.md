# SiteFolio Page Analysis — Page 12: FILES > Text Documents

**URL:** `/Kroger/ProjectDocuments.sf?idProject=177956&bn=18751926&idfilter=8252`
**Page Title:** Text Documents
**Type:** Document management system with hierarchical folder tree, file operations, and drag-and-drop
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

The **FILES** tab is a full document management system. Unlike most other pages, the folder/file tree is **lazy-loaded via AJAX** — the initial HTML just shows a spinner. Folders and files load on-demand through the `/ws/Documents/Documents.asmx/` namespace. This page has the most complex client-side JavaScript of any page analyzed so far.

---

## FILES Tab Sub-pages

| Sub-page | bn Value | URL |
|---|---|---|
| Text Documents | 18751926 | `ProjectDocuments.sf?...&bn=18751926` |
| Drawings | 18752105 | `ProjectDocuments.sf?...&bn=18752105` |

Both sub-pages show `DISABLED` status with `RED_FOLDER_CLOSED` icons in the nav, suggesting restricted access or empty content on this project.

---

## Data Loading Pattern: Lazy-Load via ASMX

The page does NOT render documents in the initial HTML. Instead:

1. Initial render shows a spinner: "Please wait while we load your documents."
2. JavaScript calls `lazyLoadInitial()` which fetches folder tree via ASMX
3. Each folder expands on-demand with additional ASMX calls

### Key JavaScript Config Variables
```javascript
g_docs_sWSPrefix = '/ws/Documents/Documents.asmx/';
g_docs_sWSType = 'Project';
g_docs_sWSInitialFolderValue = '18751926';
g_docs_sWSParameters = 'enterpriseID=8252&projectID=177956&maxItemCount=48&includeFolderPath=false&enterpriseContextID=8252';
```

---

## ASMX Endpoints Discovered: Documents Namespace

All endpoints use the `/ws/Documents/Documents.asmx/` prefix with `POST` method and form-encoded parameters:

| Method | Purpose | Key Parameters |
|---|---|---|
| `CreateProjectDocumentFolder` | Create new folder | `parentFolderID`, `name` |
| `DeleteProjectDocumentFolder` | Delete empty folder | `folderID` |
| `ModifyProjectDocumentFolder` | Rename/reorder/recolor folder | `folderID`, `name`, `sortOrder`, `folderColorTypeID` |
| `MoveProjectDocuments` | Move files between folders | `destinationFolderID`, `fileCsv` |
| `CopyFolderToFolder` | Copy entire folder | Source/destination context params |
| `CopyFileToFolder` | Copy file to folder | Source/destination context params |
| `CopyFileToFile` | Copy file as new version | Source/destination context params |

### File Operations (from context menus)
- **View/Download**: `/files/idProject!177956|bn!18751926|...|iditem!{fileID}|itemtype!22|.../filename`
- **Upload**: Opens `DocumentUpload` property page dialog (secure connection)
- **Unzip**: `docs_unzipDocument()` for .ZIP files
- **Email**: `/Kroger/ProjDocumentEmail.sf?...&idDocument={fileID}`
- **Notes**: `/Kroger/ProjDocumentsAllNotesView.sf?...&idDocument={fileID}`
- **Activity**: `/Kroger/ProjDocumentActivity.sf?...&idDocument={fileID}`
- **Details & Versions**: `/Kroger/ProjDocumentHistoryView.sf?...&idDocument={fileID}`
- **Markup**: `/Kroger/Markup?idProject=177956&versionID={versionID}&ait=22`

### ZIP Download
Files can be selected and downloaded as ZIP: `/files/idproject!177956|iditems!{csvFileIDs}|itemtype!22|.../`
Folders can be downloaded as ZIP using the same pattern with `idfolder!{folderID}`.

---

## Folder Context Menu Actions

| Action | Description |
|---|---|
| Upload (single / ZIP extract / email) | Multiple upload modes |
| Download folder as ZIP | Bulk download |
| Move selected files to folder | File relocation |
| Create subfolder | New folder creation |
| Expand/Collapse subfolders | Tree navigation |
| Move (top/up/down/bottom) | Folder reordering |
| Check files | Select files in folder |
| Alphabetize (asc/desc) | Sort folder contents |
| Mark as read/unread | Read status tracking |
| Shortcut (subscribe/unsubscribe) | Folder bookmarking |
| Notifications (enable/disable/manage) | Email notifications |
| View Item-Level Permissions | ILP management |
| Rename | Folder rename |
| Delete folder | Only if empty |
| Folder properties | View folder details |
| Set color (Yellow/Purple/Red/Blue/Green) | Folder color coding |

## File Context Menu Actions

| Action | Description |
|---|---|
| View | Opens in markup viewer if supported |
| Download | Force download |
| Upload new version | Version management |
| Unzip on site\|folio | Extract .ZIP files |
| Details & Versions | Version history |
| Email | Send file via email |
| Notes | Document notes |
| Activity | Activity log |
| Move (top/up/down/bottom) | File reordering |
| Mark (read/unread) | Read status |
| Delete | Delete file |

### Markup-Supported Extensions
`.docx`, `.doc`, `.dot`, `.dotx`, `.docm`, `.dotm`, `.rtf`, `.pptx`, `.pptm`, `.potx`, `.potm`, `.xls`, `.xlsx`, `.jpeg`, `.jpg`, `.bmp`, `.png`, `.pdf`, `.dwf`, `.dwg`, `.dxf`, `.dwfx`, `.dgn`, `.plt`

---

## Drag and Drop System

Full drag-and-drop support for: file uploads (browser → folder), file-to-folder copy, file-to-file copy (creates new version), folder-to-folder copy. Upload endpoint: `/DragAndDropUpload.aspx` with `uploadedFile` parameter, max 1GB file size, queue size 2.

---

## Email Upload

Files can be uploaded via email to: `P=177956+=Files~Unknown~UnZip~{folderID}@kroger.sitefolio-mail.net`

Email archive: `P=177956+=Unknown~{folderID}@kroger.sitefolio-mail.net`

---

## Reports on This Page

| Report | Format |
|---|---|
| Project Document Activity | PDF (format!2) |
| Document Notification History | PDF (format!2) |
| Project Notification History | XLSX (format!11) |
| Document Notification History XLS | XLSX (format!11) |

---

## Related URLs

| Page | URL Pattern |
|---|---|
| Text Documents | `ProjectDocuments.sf?idProject={id}&bn=18751926&idfilter=8252` |
| Drawings | `ProjectDocuments.sf?idProject={id}&bn=18752105&idfilter=8252` |
| Recently Updated | `ProjDocsRecentlyUpdated.sf?idProject={id}&bn={bn}&idfilter=8252` |
| File History | `ProjDocumentHistoryView.sf?...&idDocument={fileID}` |
| Folder Properties | `ProjectFolderPropertiesView.sf?...&idFolder={folderID}` |
| Folder Subscriptions | `ProjFolderSubscriptions.sf?...&idFolder={folderID}` |
| Folder ILPs | `ProjFolderIlpsView.sf?...&idFolder={folderID}` |

---

## DOM Structure (Post-Load)

Folders render as `TABLE[_nodetype='folder']` with attributes: `_folderID`, `_fp` (folder permissions bitmask), `_loaded`, `_subscribed`, `_hasnotifications`, `_createdbyid`, `_enterpriseID`, `_projectid`, `_type`.

Files render as `TR.DOCSECTIONFILE` with attributes: `_fileID`, `_extension`, `_currentversionid`, `_isunread`, `_contextmenutitle`.

---

## Notes

- This is the **most complex page** in terms of client-side logic — full document management with CRUD, drag-and-drop, versioning, notifications, and permissions.
- The Documents ASMX namespace (`/ws/Documents/Documents.asmx/`) is entirely new and contains the richest set of methods discovered so far.
- Folder content is **lazy-loaded** — initial HTML contains no document data. The `lazyLoadInitial()` function fetches the root folder, then each subfolder loads on expand.
- The `itemtype=22` value appears consistently for project documents.
- The `_fp` attribute on folders is a **permission bitmask** — JavaScript functions like `canAddFolderFile()`, `canEditFolder()`, `canDeleteFolder()` check specific bits (0x04 = edit, 0x08 = delete, 0x10 = add).
- Email upload integration exists via `kroger.sitefolio-mail.net` — files and email archives can be sent directly to specific project folders.
