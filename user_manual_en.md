# Bossard Fastener Library O1.1.2A – User Manual (English)

This manual describes how to install, set‑up and use the **Bossard Fastener Library** version O1.1.2A.  This offline application helps engineers, R&D and QA teams manage sample inventories of Bossard fasteners at customer sites.  It replaces spreadsheets with a searchable, filtered card display and provides tools for importing/exporting data and managing stock levels.

## 1 Installation and Starting the App

1. **Unzip the application** – extract the contents of the provided ZIP file to a folder on your PC.  Ensure that the `index.html`, `style.css`, `app.js`, the `assets` folder and any `BNImage` or data folders remain together.
2. **Open the application** – double‑click `index.html` or open it in a modern web browser (Chrome, Edge or Firefox).  The application runs entirely in your browser; no internet connection is required except when following links to Bossard’s e‑shop.
3. **Initial data** – if the card list is empty, import your sample list as described in section 3.  The provided Excel file `example3_87items+dummy_for modify_fon1.xlsx` can be used as a template.

## 2 Overview of the Interface

The interface is divided into four areas:

| Area | Description |
|------|-------------|
| **Top bar** | Shows the app name, version `v.O1.1.2A`, current user, a **Theme Toggle** (Sun/Moon icon) for Dark/Light mode, and a link to Bossard’s corporate website. |
| **Toolbar** | Contains buttons to add items, export/save data, import data, view audit logs, create backups, open **Help**, and log into the admin panel. |
| **Sidebar filters** | Category, standard, material, grade, plating, head, recess, dimensions and location filters.  Two toggles allow you to show only samples that have physical samples (`Show items with sample only`) or that are low in stock (`Show Low‑stock items`).  Use the **Refresh** button to clear all filters. |
| **Main card area** | Displays each fastener as a card.  Each card shows the article number, quantity, location, photo (if available), name, BN number, specifications and action buttons (Manage, Note, Edit and Delete). |
| **Footer** | Shows how many items are currently filtered and the total number of items. |

## 3 Importing and Exporting Data

### Importing

1. Click **Import** in the toolbar.  A dialog appears.
2. Click **Choose File** and select an Excel (`.xlsx`) or JSON file containing your item list.  A template is provided in `example3_87items+dummy_for modify_fon1.xlsx`.
3. Choose **Replace All** to discard existing data and load the file, or **Merge (Add/Edit)** to add new items and update existing ones.
4. Confirm the prompt.  Items will appear as cards.

### Exporting

* **Export** – downloads a `.xlsx` file containing your current items.
* **Save as** – downloads a `.json` file with your items.  You can use this file for backups or to transfer data to another installation.

### Backup and Restore

* **Backup** – downloads a `.json` file including items and audit logs.  Store backups regularly.
* To restore a backup, use **Import** and select the `.json` file, then choose **Replace All**.

## 4 Managing Items

### Adding an Item

1. Click **+ Add Item**.
2. Fill in the **Article No.**, **Name (Description)** and optional fields such as category, BN, location, quantities and dimensions.  Required fields are marked.
    *   **Pack Size (Trigger)**: Sets the threshold for low-stock alerts. Also used for "Pack" based withdrawals.
    *   **Head ∅**: Use this field for head diameter.
3. **Location** codes include `00` for dummy items and `A01…Z99` for physical positions.  The system prevents duplicate locations except for `00`.
4. Click **Save** to add the item.  It will appear in the card list.

### Editing and Deleting

* **Edit** – opens the same form populated with the item’s values.  After editing, click **Save**.
* **Delete** – removes the item after confirmation.

### Notes

Use the **Note** button to attach free‑text notes to an item.  Notes appear in the item detail dialog.

### Manage Stock

Click **Manage** on a card to adjust quantities:

* **Withdraw** (`−`) – subtracts items from stock.
* **Return/Fill** (`+`) – adds items back to stock.

**Unit Selection**: You can choose to manage stock by **Pieces** (default) or **Packs**.
*   If **Packs** is selected, the system calculates the quantity based on the item's **Pack Size** (e.g., 1 Pack = 50 pieces).
*   A real-time calculator shows the total change in pieces.

Entering a negative amount is not allowed.  When the quantity reaches zero, the card background becomes grey.

### Item Detail

Click the item’s photo or the blank area to open a detail dialog.
*   **Images**: Displays both the product photo and the **technical drawing** (from `BNDwg` folder).
*   **Lightbox**: Click any image to open it in full-screen.
    *   **Zoom**: Use the `+`/`-` buttons or your mouse wheel.
    *   **Pan**: Click and drag the image when zoomed in.
    *   **Fit**: Click `Fit` to reset the view.
    *   **Background**: Images are displayed on a white background for better visibility.

From there you can edit notes, find equivalent items or edit the item.

**Find Equivalent**:
Click **Find Equivalent** to search for similar items. A dialog appears allowing you to filter by multiple criteria (Standard, Head, Recess, Thread size, Length, Material, etc.).
*   Select values from the dropdowns to narrow down the list.
*   Click **Clear conditions** to reset all filters.
*   Click on a result card to view its details.

### BN Links

In version O1.1.2A the **BN** number links directly to Bossard’s e‑shop using the new permalink format: `https://www.bossard.com/global-en/eshop/search/p/<BN>/`.
*   **Standard Items**: Displays as **BN 12345** (Blue Link).
*   **SP Items**: Items starting with "SP" (Special Parts) display as **SP 12345** (Black Text) and do **not** link to the e-shop.
*   Article numbers are no longer linked.

## 5 User Accounts and Admin Features

### Logging In

Click **Login** to open the sign‑in dialog.  Default users are:

* `admin` (password `@Bossard`) – can create new users.
* `guest` – the default role with view/edit rights.

After logging in as `admin`, an **Admin Panel** dialog appears where you can create new users.  Specify a username, password and role (`user` or `admin`).

### Audit Logs

Every action (add, edit, delete, note change, stock change) is recorded.
*   **Detailed Log**: Changes to fields show the "Before" and "After" values (e.g., `qty: 10 -> 20`).
*   **Stock Log**: Records whether the change was in "Pieces" or "Packs".
Click **Log** to open the audit log dialog.  Use **Export .txt** to download the log.

## 6 Searching and Filtering

* The search bar supports keywords across article numbers, BN, descriptions and materials.  Press **Enter** or wait momentarily to apply.
* Use the sidebar filters to narrow results.  Filters are faceted: selecting a value in one filter constrains the options shown in other filters.
* **Show items with sample only** – hide entries with location `00`.
* **Show Low‑stock items** – show only items with quantity below their minimum quantity.

## 7 Tips for Effective Use

* Use descriptive **Name (Description)** fields so items are easy to find.
* Keep your Excel master list up‑to‑date and back it up after major changes.
* Encourage staff to update quantities immediately when withdrawing or returning samples.
* When exporting, rename the file to include the date (e.g., `samplebank_2025‑11‑21.xlsx`).
* **Browser Data Warning**: This application uses the browser's local database (IndexedDB). **Clearing your browser's cache or site data will erase your inventory.** Always keep a recent **Backup (.json)** or **Export (.xlsx)** file on your computer.

## 8 Troubleshooting

| Issue | Solution |
|------|---------|
| **The BN link doesn’t open** | Verify you have an internet connection.  The BN link opens in a new browser tab.  If pop‑ups are blocked, enable pop‑ups for this site. |
| **Import fails** | Ensure the Excel file follows the correct column structure.  Required columns include `Article`, `Name`, `BN`, `Category`, `Location`, `Qty` and `Min Qty`.  Avoid merged cells. |
| **Duplicate location error** | Locations must be unique except for `00 (Dummy)`.  Edit or delete the existing item using that location. |
| **Missing photo** | Image files should be stored in the `BNImage` folder with filenames matching either the photo filename specified during entry or the article number (e.g., `1234567.jpg`). |

## 9 In-App Help

Click the **Help** button (?) in the toolbar to open this user manual directly within the application.
*   **Language Switch**: Toggle between **English** and **Thai** using the buttons at the top of the Help window.
*   **Scroll**: Scroll through the content to find the topic you need.
*   **Close**: Click the **Close** button or outside the window to exit.

## 10 Contact and Support

This application is maintained internally.  For questions, suggestions or bug reports, contact your Bossard representative or the development team.  Updates will be provided as new versions (e.g., O1.1.3) when improvements are available.
