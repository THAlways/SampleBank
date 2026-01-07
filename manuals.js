const MANUAL_EN = `
<div class="manual-content">
<h1>Bossard Fastener Library O1.1.2A – User Manual (English)</h1>
<p>This manual describes how to install, set‑up and use the <strong>Bossard Fastener Library</strong> version O1.1.2A. This offline application helps engineers, R&D and QA teams manage sample inventories of Bossard fasteners at customer sites. It replaces spreadsheets with a searchable, filtered card display and provides tools for importing/exporting data and managing stock levels.</p>

<h2>1 Installation and Starting the App</h2>
<ol>
<li><strong>Unzip the application</strong> – extract the contents of the provided ZIP file to a folder on your PC. Ensure that the <code>index.html</code>, <code>style.css</code>, <code>app.js</code>, the <code>assets</code> folder and any <code>BNImage</code> or data folders remain together.</li>
<li><strong>Open the application</strong> – double‑click <code>index.html</code> or open it in a modern web browser (Chrome, Edge or Firefox). The application runs entirely in your browser; no internet connection is required except when following links to Bossard’s e‑shop.</li>
<li><strong>Initial data</strong> – if the card list is empty, import your sample list as described in section 3. The provided Excel file <code>Fastener Library.xlsx</code> can be used as a template.</li>
</ol>

<h2>2 Overview of the Interface</h2>
<p>The interface is divided into four areas:</p>
<table class="manual-table">
<thead>
<tr><th>Area</th><th>Description</th></tr>
</thead>
<tbody>
<tr><td><strong>Top bar</strong></td><td>Shows the app name, version <code>v.O1.1.2A</code>, current user, a <strong>Theme Toggle</strong> (Sun/Moon icon) for Dark/Light mode, and a link to Bossard’s corporate website.</td></tr>
<tr><td><strong>Toolbar</strong></td><td>Contains buttons to add items, export/save data, import data, view audit logs, create backups, open <strong>Help</strong>, and log into the admin panel.</td></tr>
<tr><td><strong>Sidebar filters</strong></td><td>Category, standard, material, grade, plating, head, recess, dimensions and location filters. Two toggles allow you to show only samples that have physical samples (<code>Show items with sample only</code>) or that are low in stock (<code>Show Low‑stock items</code>). Use the <strong>Refresh</strong> button to clear all filters.</td></tr>
<tr><td><strong>Main card area</strong></td><td>Displays each fastener as a card. Each card shows the article number, quantity, location, photo (if available), name, BN number, specifications and action buttons (Manage, Note, Edit and Delete).</td></tr>
<tr><td><strong>Footer</strong></td><td>Shows how many items are currently filtered and the total number of items.</td></tr>
</tbody>
</table>

<h2>3 Importing and Exporting Data</h2>

<h3>Importing</h3>
<ol>
<li>Click <strong>Import</strong> in the toolbar. A dialog appears.</li>
<li>Click <strong>Choose File</strong> and select an Excel (<code>.xlsx</code>) or JSON file containing your item list. A template is provided in <code>Fastener Library.xlsx</code>.</li>
<li>Choose <strong>Replace All</strong> to discard existing data and load the file, or <strong>Merge (Add/Edit)</strong> to add new items and update existing ones.</li>
<li>Confirm the prompt. Items will appear as cards.</li>
</ol>

<h3>Exporting</h3>
<ul>
<li><strong>Export</strong> – downloads a <code>.xlsx</code> file containing your current items.</li>
<li><strong>Save as</strong> – downloads a <code>.json</code> file with your items. You can use this file for backups or to transfer data to another installation.</li>
</ul>

<h3>Backup and Restore</h3>
<ul>
<li><strong>Backup</strong> – downloads a <code>.json</code> file including items and audit logs. Store backups regularly.</li>
<li>To restore a backup, use <strong>Import</strong> and select the <code>.json</code> file, then choose <strong>Replace All</strong>.</li>
</ul>

<h2>4 Managing Items</h2>

<h3>Adding an Item</h3>
<ol>
<li>Click <strong>+ Add Item</strong>.</li>
<li>Fill in the <strong>Article No.</strong>, <strong>Name (Description)</strong> and optional fields such as category, BN, location, quantities and dimensions. Required fields are marked.
<ul>
<li><strong>Pack Size (Trigger)</strong>: Sets the threshold for low-stock alerts. Also used for "Pack" based withdrawals.</li>
<li><strong>Small Pack</strong>: Quantity for small pack withdrawals. Defaults to Pack Size if omitted.</li>
<li><strong>Head ∅</strong>: Use this field for head diameter.</li>
</ul>
</li>
<li><strong>Location</strong> codes include <code>00</code> for dummy items and <code>A01…Z99</code> for physical positions. The system prevents duplicate locations except for <code>00</code>.</li>
<li>Click <strong>Save</strong> to add the item. It will appear in the card list.</li>
</ol>

<h3>Editing and Deleting</h3>
<ul>
<li><strong>Edit</strong> – opens the same form populated with the item’s values. After editing, click <strong>Save</strong>.</li>
<li><strong>Delete</strong> – removes the item after confirmation.</li>
</ul>

<h3>Notes</h3>
<p>Use the <strong>Note</strong> button to attach free‑text notes to an item. Notes appear in the item detail dialog.</p>

<h3>Manage Stock</h3>
<p>Click <strong>Manage</strong> on a card to adjust quantities:</p>
<ul>
<li><strong>Withdraw</strong> (<code>−</code>) – subtracts items from stock.</li>
<li><strong>Return/Fill</strong> (<code>+</code>) – adds items back to stock.</li>
</ul>
<p><strong>Unit Selection</strong>: You can choose to manage stock by <strong>Pieces</strong> (default), <strong>Packs</strong>, or <strong>Small Packs</strong>.</p>
<ul>
<li>If <strong>Packs</strong> is selected, the system calculates based on the <strong>Pack Size</strong>.</li>
<li>If <strong>Small Packs</strong> is selected, the system uses the <strong>Small Pack</strong> size.</li>
<li>A real-time calculator shows the total change in pieces.</li>
</ul>
<p>Entering a negative amount is not allowed. When the quantity reaches zero, the card background becomes grey.</p>

<h3>Item Detail</h3>
<p>Click the item’s photo or the blank area to open a detail dialog.</p>
<ul>
<li><strong>Images</strong>: Displays both the product photo and the <strong>technical drawing</strong> (from <code>BNDwg</code> folder).</li>
<li><strong>Lightbox</strong>: Click any image to open it in full-screen.
<ul>
<li><strong>Zoom</strong>: Use the <code>+</code>/<code>-</code> buttons or your mouse wheel.</li>
<li><strong>Pan</strong>: Click and drag the image when zoomed in.</li>
<li><strong>Fit</strong>: Click <code>Fit</code> to reset the view.</li>
<li><strong>Background</strong>: Images are displayed on a white background for better visibility.</li>
</ul>
</li>
</ul>
<p>From there you can edit notes, find equivalent items or edit the item.</p>
<p><strong>Find Equivalent</strong>:<br>
Click <strong>Find Equivalent</strong> to search for similar items. A dialog appears allowing you to filter by multiple criteria (Standard, Head, Recess, Thread size, Length, Material, etc.).</p>
<ul>
<li>Select values from the dropdowns to narrow down the list.</li>
<li>Click <strong>Clear conditions</strong> to reset all filters.</li>
<li>Click on a result card to view its details.</li>
</ul>

<h3>BN Links</h3>
<p>In version O1.1.2A the <strong>BN</strong> number links directly to Bossard’s e‑shop using the new permalink format: <code>https://www.bossard.com/global-en/eshop/search/p/&lt;BN&gt;/</code>.</p>
<ul>
<li><strong>Standard Items</strong>: Displays as <strong>BN 12345</strong> (Blue Link).</li>
<li><strong>SP Items</strong>: Items starting with "SP" (Special Parts) display as <strong>SP 12345</strong> (Black Text) and do <strong>not</strong> link to the e-shop.</li>
<li>Article numbers are no longer linked.</li>
</ul>

<h2>5 Ordering Samples</h2>
<p>When you need to restock samples or request new items, use the <strong>Prepare Order</strong> feature.</p>
<ol>
<li><strong>Select Items</strong>:
<ul>
<li>Click on any card to select it (a green tick mark appears).</li>
<li>To select multiple items, simply click on other cards.</li>
<li><strong>Shortcut</strong>: After using filters to narrow down the list, click the <strong>Select All</strong> button (visible in the sidebar or top bar when filters are active) to select all displayed items.</li>
</ul>
</li>
<li><strong>Prepare Order</strong>:
<ul>
<li>Once items are selected, the <strong>+ Add Item</strong> button changes to <strong>Prepare Order (Count)</strong>.</li>
<li>Click <strong>Prepare Order</strong> to open the order summary dialog.</li>
</ul>
</li>
<li><strong>Review and Export</strong>:
<ul>
<li>The dialog lists your selected items, current quantity, pack size, and small pack size.</li>
<li>Enter the <strong>Order Pack</strong> or <strong>Order Small</strong>. The system calculates the total Quantity.</li>
<li><strong>Requirement</strong>: The Total Quantity must be at least the <strong>Pack Size</strong>. If less, an error message will appear and export is blocked.</li>
<li>Click <strong>Export Excel</strong> to download the order list as an Excel file.</li>
</ul>
</li>
<li><strong>Send</strong>: Email the downloaded Excel file to your Bossard contact person to place the order.</li>
</ol>

<h2>6 User Accounts and Admin Features</h2>

<h3>Logging In</h3>
<p>Click <strong>Login</strong> to open the sign‑in dialog. Default users are:</p>
<ul>
<li><code>admin</code> (password <code>@Bossard</code>) – can create new users.</li>
<li><code>guest</code> – the default role with view/edit rights.</li>
</ul>
<p>After logging in as <code>admin</code>, an <strong>Admin Panel</strong> dialog appears where you can create new users. Specify a username, password and role (<code>user</code> or <code>admin</code>).</p>

<h3>Audit Logs</h3>
<p>Every action (add, edit, delete, note change, stock change) is recorded.</p>
<ul>
<li><strong>Detailed Log</strong>: Changes to fields show the "Before" and "After" values (e.g., <code>qty: 10 -&gt; 20</code>).</li>
<li><strong>Stock Log</strong>: Records whether the change was in "Pieces" or "Packs".</li>
</ul>
<p>Click <strong>Log</strong> to open the audit log dialog. Use <strong>Export .txt</strong> to download the log.</p>

<h2>7 Searching and Filtering</h2>
<ul>
<li>The search bar supports keywords across article numbers, BN, descriptions and materials. Press <strong>Enter</strong> or wait momentarily to apply.</li>
<li>Use the sidebar filters to narrow results. Filters are faceted: selecting a value in one filter constrains the options shown in other filters.</li>
<li><strong>Show items with sample only</strong> – hide entries with location <code>00</code>.</li>
<li><strong>Show Low‑stock items</strong> – show only items with quantity below their minimum quantity.</li>
</ul>

<h2>8 Tips for Effective Use</h2>
<ul>
<li>Use descriptive <strong>Name (Description)</strong> fields so items are easy to find.</li>
<li>Keep your Excel master list up‑to‑date and back it up after major changes.</li>
<li>Encourage staff to update quantities immediately when withdrawing or returning samples.</li>
<li>When exporting, rename the file to include the date (e.g., <code>samplebank_2025‑11‑21.xlsx</code>).</li>
<li><strong>Browser Data Warning</strong>: This application uses the browser's local database (IndexedDB). <strong>Clearing your browser's cache or site data will erase your inventory.</strong> Always keep a recent <strong>Backup (.json)</strong> or <strong>Export (.xlsx)</strong> file on your computer.</li>
</ul>

<h2>9 Troubleshooting</h2>
<table class="manual-table">
<thead>
<tr><th>Issue</th><th>Solution</th></tr>
</thead>
<tbody>
<tr><td><strong>The BN link doesn’t open</strong></td><td>Verify you have an internet connection. The BN link opens in a new browser tab. If pop‑ups are blocked, enable pop‑ups for this site.</td></tr>
<tr><td><strong>Import fails</strong></td><td>Ensure the Excel file follows the correct column structure. Required columns include <code>Article</code>, <code>Name</code>, <code>BN</code>, <code>Category</code>, <code>Location</code>, <code>Qty</code> and <code>Min Qty</code>. Avoid merged cells.</td></tr>
<tr><td><strong>Duplicate location error</strong></td><td>Locations must be unique except for <code>00 (Dummy)</code>. Edit or delete the existing item using that location.</td></tr>
<tr><td><strong>Missing photo</strong></td><td>Image files should be stored in the <code>BNImage</code> folder with filenames matching either the photo filename specified during entry or the article number (e.g., <code>1234567.jpg</code>).</td></tr>
</tbody>
</table>

<h2>10 In-App Help</h2>
<p>Click the <strong>Help</strong> button (?) in the toolbar to open this user manual directly within the application.</p>
<ul>
<li><strong>Language Switch</strong>: Toggle between <strong>English</strong> and <strong>Thai</strong> using the buttons at the top of the Help window.</li>
<li><strong>Scroll</strong>: Scroll through the content to find the topic you need.</li>
<li><strong>Close</strong>: Click the <strong>Close</strong> button or outside the window to exit.</li>
</ul>

<h2>11 Contact and Support</h2>
<p>This application is maintained internally. For questions, suggestions or bug reports, contact your Bossard representative or the development team. Updates will be provided as new versions (e.g., O1.1.3) when improvements are available.</p>
</div>
`;

const MANUAL_TH = `
<div class="manual-content">
<h1>คู่มือผู้ใช้โปรแกรม Bossard Fastener Library O1.1.2A (ภาษาไทย)</h1>
<p>คู่มือนี้อธิบายการติดตั้ง การตั้งค่า และการใช้งาน <strong>Bossard Fastener Library</strong> เวอร์ชัน O1.1.2A ซึ่งเป็นโปรแกรมทำงานออฟไลน์สำหรับจัดการคลังตัวอย่างสกรู น็อต และแหวนของ Bossard สำหรับฝ่ายวิศวกรรม วิจัยและพัฒนา และทีม QA ภายในโรงงานหรือสำนักงานลูกค้า โปรแกรมนี้ช่วยแทนที่การใช้งานสเปรดชีตด้วยหน้าจอการ์ดที่ค้นหาและกรองได้ และมีเครื่องมือสำหรับนำเข้า/ส่งออกข้อมูลและบริหารสต็อก</p>

<h2>1 การติดตั้งและเริ่มโปรแกรม</h2>
<ol>
<li><strong>แตกไฟล์ ZIP</strong> – แตกไฟล์ ZIP ที่ได้รับไปยังโฟลเดอร์บนคอมพิวเตอร์ คุณจะต้องมีไฟล์ <code>index.html</code>, <code>style.css</code>, <code>app.js</code> โฟลเดอร์ <code>assets</code> และโฟลเดอร์รูปภาพ/ข้อมูลอื่น ๆ อยู่ด้วยกัน</li>
<li><strong>เปิดโปรแกรม</strong> – ดับเบิลคลิกไฟล์ <code>index.html</code> หรือเปิดผ่านเว็บเบราว์เซอร์สมัยใหม่ (เช่น Chrome, Edge หรือ Firefox) โปรแกรมจะทำงานทั้งหมดในเบราว์เซอร์ ไม่จำเป็นต้องเชื่อมต่ออินเทอร์เน็ต ยกเว้นเมื่อคลิกลิงก์ไปยัง e‑shop ของ Bossard</li>
<li><strong>ข้อมูลเริ่มต้น</strong> – หากรายการการ์ดว่าง ให้ทำการนำเข้ารายการของคุณตามคำแนะนำในหัวข้อ 3 ตัวอย่างไฟล์ Excel <code>Fastener Library.xlsx</code> มีให้ใช้เป็นแม่แบบ</li>
</ol>

<h2>2 ภาพรวมของหน้าจอ</h2>
<p>อินเทอร์เฟซแบ่งออกเป็น 4 ส่วนหลัก:</p>
<table class="manual-table">
<thead>
<tr><th>ส่วน</th><th>คำอธิบาย</th></tr>
</thead>
<tbody>
<tr><td><strong>แถบด้านบน</strong></td><td>แสดงชื่อโปรแกรม เวอร์ชัน <code>v.O1.1.2A</code> ชื่อผู้ใช้ปัจจุบัน <strong>สวิตช์เปลี่ยนธีม</strong> (ไอคอนดวงอาทิตย์/ดวงจันทร์) สำหรับโหมดมืด/สว่าง และลิงก์ไปยังเว็บไซต์หลักของ Bossard</td></tr>
<tr><td><strong>แถบเครื่องมือ</strong></td><td>มีปุ่มเพิ่มรายการ ส่งออก/บันทึก นำเข้า ดูบันทึกการทำงาน สำรองข้อมูล เปิด <strong>Help</strong> (ช่วยเหลือ) และเข้าสู่ระบบแอดมิน</td></tr>
<tr><td><strong>แถบด้านข้าง (ตัวกรอง)</strong></td><td>ตัวกรองตามประเภท มาตรฐาน วัสดุ เกรด การชุบ หัว ร่อง ขนาด (Dim1, Dim2) และตำแหน่ง นอกจากนี้มีสวิตช์ 2 ตัวคือ “แสดงรายการที่มีตัวอย่างเท่านั้น” และ “แสดงรายการสต็อกต่ำ” ปุ่ม <strong>Refresh</strong> ใช้ล้างตัวกรองทั้งหมด</td></tr>
<tr><td><strong>พื้นที่การ์ดหลัก</strong></td><td>แสดงรายการแต่ละชิ้นในรูปแบบการ์ด การ์ดจะมีเลขบทความ จำนวนคงเหลือ ตำแหน่ง รูป (ถ้ามี) ชื่อ BN รายละเอียด และปุ่มจัดการ (Manage, Note, Edit, Delete)</td></tr>
<tr><td><strong>ส่วนท้าย (Footer)</strong></td><td>แสดงจำนวนรายการที่ผ่านการกรองและจำนวนรายการทั้งหมด</td></tr>
</tbody>
</table>

<h2>3 การนำเข้าและส่งออกข้อมูล</h2>

<h3>การนำเข้า</h3>
<ol>
<li>คลิก <strong>Import</strong> ที่แถบเครื่องมือ จะปรากฏหน้าต่าง</li>
<li>คลิก <strong>Choose File</strong> แล้วเลือกไฟล์ Excel (<code>.xlsx</code>) หรือ JSON ที่มีรายการของคุณ แม่แบบไฟล์อยู่ใน <code>Fastener Library.xlsx</code></li>
<li>เลือก <strong>Replace All</strong> เพื่อแทนที่ข้อมูลเดิมทั้งหมด หรือเลือก <strong>Merge (Add/Edit)</strong> เพื่อเพิ่มรายการใหม่และอัปเดตรายการเดิม</li>
<li>ยืนยันเมื่อมีข้อความแจ้ง รายการจะถูกสร้างเป็นการ์ดบนหน้าจอ</li>
</ol>

<h3>การส่งออก</h3>
<ul>
<li><strong>Export</strong> – ดาวน์โหลดไฟล์ <code>.xlsx</code> ที่มีรายการปัจจุบันทั้งหมด</li>
<li><strong>Save as</strong> – ดาวน์โหลดไฟล์ <code>.json</code> เพื่อใช้สำรองหรือโยกย้ายข้อมูลไปยังเครื่องอื่น</li>
</ul>

<h3>การสำรองและกู้คืน</h3>
<ul>
<li><strong>Backup</strong> – ดาวน์โหลดไฟล์ <code>.json</code> ซึ่งรวมรายการและบันทึกการทำงาน ควรสำรองข้อมูลเป็นประจำ</li>
<li>เมื่อต้องการกู้คืน ให้ใช้เมนู <strong>Import</strong> แล้วเลือกไฟล์ <code>.json</code> จากนั้นเลือก <strong>Replace All</strong></li>
</ul>

<h2>4 การจัดการรายการ</h2>

<h3>เพิ่มรายการ</h3>
<ol>
<li>คลิก <strong>+ Add Item</strong></li>
<li>กรอก <strong>Article No.</strong>, <strong>Name (Description)</strong> พร้อมข้อมูลเพิ่มเติม เช่น ประเภท BN ตำแหน่ง และมิติ ช่องที่จำเป็นจะมีเครื่องหมายกำกับ
<ul>
<li><strong>Pack Size (Trigger)</strong>: กำหนดจำนวนบรรจุต่อแพ็ค ใช้สำหรับแจ้งเตือนสินค้าใกล้หมด (Low stock) และคำนวณการเบิกจ่าย</li>
<li><strong>Small Pack</strong>: จำนวนบรรจุต่อแพ็คเล็ก (ไม่บังคับ) หากไม่ระบุจะใช้ค่า Pack Size</li>
<li><strong>Head ∅</strong>: ระบุขนาดเส้นผ่านศูนย์กลางหัว</li>
</ul>
</li>
<li><strong>ตำแหน่ง (Location)</strong> ใช้รหัส <code>00</code> สำหรับรายการสมมติ และ <code>A01…Z99</code> สำหรับตำแหน่งจริง ระบบไม่ยอมให้มีตำแหน่งซ้ำ ยกเว้น <code>00</code></li>
<li>คลิก <strong>Save</strong> เพื่อบันทึก รายการจะปรากฏในพื้นที่การ์ด</li>
</ol>

<h3>แก้ไขและลบ</h3>
<ul>
<li>ปุ่ม <strong>Edit</strong> เปิดฟอร์มเดียวกันพร้อมข้อมูลเดิม แก้ไขแล้วกด <strong>Save</strong></li>
<li>ปุ่ม <strong>Delete</strong> ลบรายการนั้นหลังจากยืนยัน</li>
</ul>

<h3>บันทึกโน้ต</h3>
<p>คลิกปุ่ม <strong>Note</strong> เพื่อเขียนโน้ตข้อความให้รายการ แต่ละรายการสามารถมีโน้ตส่วนตัวได้</p>

<h3>จัดการสต็อก</h3>
<p>คลิก <strong>Manage</strong> บนการ์ดเพื่อปรับปริมาณ:</p>
<ul>
<li><strong>Withdraw (−)</strong> – หักจำนวนออกจากสต็อก</li>
<li><strong>Return/Fill (+)</strong> – เพิ่มจำนวนกลับเข้าสต็อก</li>
</ul>
<p><strong>การเลือกหน่วย (Unit Selection)</strong>: คุณสามารถเลือกตัดสต็อกเป็น <strong>ชิ้น (Pieces)</strong>, <strong>แพ็ค (Packs)</strong> หรือ <strong>แพ็คเล็ก (Small)</strong></p>
<ul>
<li>หากเลือก <strong>Packs</strong> ระบบจะคำนวณตาม <strong>Pack Size</strong></li>
<li>หากเลือก <strong>Small</strong> ระบบจะคำนวณตาม <strong>Small Pack</strong></li>
<li>ระบบจะแสดงยอดรวมการเปลี่ยนแปลงเป็นจำนวนชิ้นให้เห็นก่อนบันทึก</li>
</ul>
<p>ไม่สามารถใส่จำนวนติดลบได้ เมื่อจำนวนเหลือศูนย์ การ์ดจะเปลี่ยนพื้นหลังเป็นสีเทา</p>

<h3>รายละเอียดรายการ</h3>
<p>คลิกบริเวณรูปหรือพื้นที่ว่างของการ์ดเพื่อเปิดหน้าต่างรายละเอียด</p>
<ul>
<li><strong>รูปภาพ</strong>: แสดงทั้งรูปถ่ายสินค้าและ <strong>แบบวาดทางเทคนิค (Technical Drawing)</strong></li>
<li><strong>Lightbox</strong>: คลิกที่รูปใดก็ได้เพื่อดูขนาดใหญ่เต็มจอ
<ul>
<li><strong>Zoom</strong>: ใช้ปุ่ม <code>+</code>/<code>-</code> หรือลูกกลิ้งเมาส์เพื่อซูม</li>
<li><strong>Pan</strong>: คลิกและลากเพื่อเลื่อนดูส่วนต่าง ๆ ของรูป (เมื่อซูม)</li>
<li><strong>Fit</strong>: คลิก <code>Fit</code> เพื่อปรับขนาดให้พอดี</li>
<li><strong>Background</strong>: รูปแสดงบนพื้นหลังสีขาวเพื่อให้เห็นชัดเจนแม้มารูปพื้นโปร่งใส</li>
</ul>
</li>
</ul>
<p>คุณสามารถแก้ไขโน้ต ค้นหารายการเทียบเท่า หรือแก้ไขข้อมูลรายการได้จากหน้าต่างนี้</p>
<p><strong>ค้นหารายการเทียบเท่า (Find Equivalent)</strong>:<br>
คลิกปุ่ม <strong>Find Equivalent</strong> เพื่อค้นหาสินค้าที่มีคุณสมบัติใกล้เคียง หน้าต่างจะปรากฏขึ้นให้คุณกรองตามเกณฑ์หลายอย่าง (มาตรฐาน, หัว, ร่อง, ขนาดเกลียว, ความยาว, วัสดุ ฯลฯ)</p>
<ul>
<li>เลือกค่าจากเมนู Dropdown เพื่อกรองรายการ</li>
<li>คลิก <strong>Clear conditions</strong> เพื่อล้างตัวกรองทั้งหมด</li>
<li>คลิกที่การ์ดผลลัพธ์เพื่อดูรายละเอียดของรายการนั้น</li>
</ul>

<h3>ลิงก์ BN</h3>
<p>ในเวอร์ชัน O1.1.2A หมายเลข <strong>BN</strong> เชื่อมต่อโดยตรงไปยังหน้า e‑shop ของ Bossard:</p>
<ul>
<li><strong>รายการปกติ</strong>: แสดงเป็น <strong>BN 12345</strong> และเป็นลิงก์สีน้ำเงิน</li>
<li><strong>รายการพิเศษ (SP Items)</strong>: รายการที่ขึ้นต้นด้วย "SP" จะแสดงเป็นตัวอักษรสีดำ <strong>SP 12345</strong> และ <strong>ไม่มีลิงก์</strong></li>
<li>หมายเลขบทความ (Article No.) จะไม่เชื่อมต่ออีกต่อไป</li>
</ul>

<h2>5 การสั่งสินค้าตัวอย่าง (Ordering Samples)</h2>
<p>เมื่อต้องการเติมสต็อกสินค้าหรือขอตัวอย่างใหม่ ให้ใช้ฟีเจอร์ <strong>Prepare Order</strong>:</p>
<ol>
<li><strong>เลือกรายการ (Select items)</strong>:
<ul>
<li>คลิกที่การ์ดรายการที่ต้องการ (จะมีเครื่องหมายถูกสีเขียวปรากฏ)</li>
<li>คลิกการ์ดอื่น ๆ เพื่อเลือกเพิ่ม</li>
<li><strong>ทางลัด</strong>: หลังจากใช้ตัวกรองเพื่อค้นหากลุ่มสินค้า กดปุ่ม <strong>Select All</strong> (ที่ปรากฏในแถบด้านข้างหรือด้านบน) เพื่อเลือกสินค้าทั้งหมดที่แสดงอยู่</li>
</ul>
</li>
<li><strong>เตรียมใบสั่งซื้อ (Prepare Order)</strong>:
<ul>
<li>เมื่อมีรายการถูกเลือก ปุ่ม <strong>+ Add Item</strong> จะเปลี่ยนเป็น <strong>Prepare Order (จำนวน)</strong></li>
<li>คลิก <strong>Prepare Order</strong> เพื่อเปิดหน้าต่างสรุปรายการสั่งซื้อ</li>
</ul>
</li>
<li><strong>ตรวจสอบและส่งออก (Review and Export)</strong>:
<ul>
<li>รายการสินค้าจะแสดงพร้อมจำนวนคงเหลือ ขนาดบรรจุ (Pack size) และแพ็คเล็ก (Small Pack)</li>
<li>ระบุจำนวนที่ต้องการสั่งในช่อง <strong>Order Pack</strong> หรือ <strong>Order Small</strong> ระบบจะคำนวณจำนวนรวมให้</li>
<li><strong>ข้อกำหนด</strong>: จำนวนรวมต้องไม่ต่ำกว่า <strong>Pack Size</strong> หากต่ำกว่า จะไม่สามารถส่งออกได้และมีข้อความแจ้งเตือน</li>
<li>คลิก <strong>Export Excel</strong> เพื่อดาวน์โหลดรายการเป็นไฟล์ Excel</li>
</ul>
</li>
<li><strong>ส่งข้อมูล (Send)</strong>: ส่งไฟล์ Excel ที่ดาวน์โหลดให้พนักงานขายหรือผู้ติดต่อของ Bossard ทางอีเมลเพื่อดำเนินการสั่งซื้อ</li>
</ol>

<h2>6 บัญชีผู้ใช้และคุณสมบัติแอดมิน</h2>

<h3>การเข้าสู่ระบบ</h3>
<p>คลิก <strong>Login</strong> เพื่อเปิดหน้าต่างเข้าสู่ระบบ ผู้ใช้เริ่มต้นคือ:</p>
<ul>
<li><code>admin</code> (รหัสผ่าน <code>@Bossard</code>) – สามารถสร้างผู้ใช้ใหม่ได้</li>
<li><code>guest</code> – บทบาทพื้นฐานสำหรับการดู/แก้ไขข้อมูล</li>
</ul>
<p>เมื่อเข้าสู่ระบบในฐานะ <code>admin</code> จะมีหน้าต่าง <strong>Admin Panel</strong> ให้สร้างผู้ใช้ใหม่ ระบุชื่อผู้ใช้ รหัสผ่าน และบทบาท (<code>user</code> หรือ <code>admin</code>)</p>

<h3>บันทึกการทำงาน (Audit Log)</h3>
<p>ทุกการกระทำ เช่น การเพิ่ม แก้ไข ลบ เปลี่ยนโน้ต หรือปรับสต็อก จะถูกบันทึกไว้</p>
<ul>
<li><strong>Detailed Log</strong>: ระบุค่าเดิมและค่าใหม่ (เช่น <code>qty: 10 -&gt; 20</code>)</li>
<li><strong>Stock Log</strong>: ระบุว่าการเบิกจ่ายทำเป็น "ชิ้น" หรือ "แพ็ค"</li>
</ul>
<p>คลิก <strong>Log</strong> เพื่อดูบันทึกเหล่านี้ และคลิก <strong>Export .txt</strong> เพื่อดาวน์โหลดไฟล์ข้อความ</p>

<h2>7 การค้นหาและการกรอง</h2>
<ul>
<li>แถบ <strong>Search…</strong> รองรับการค้นหาตามบทความ BN คำอธิบาย และวัสดุ กด Enter หรือรอชั่วครู่เพื่อใช้งาน</li>
<li>ใช้ตัวกรองในแถบด้านข้างเพื่อจำกัดผลลัพธ์ การเลือกค่าหนึ่งจะกรองตัวเลือกอื่น ๆ ให้อัตโนมัติ (faceted search)</li>
<li><strong>Show items with sample only</strong> – ซ่อนรายการที่อยู่ในตำแหน่ง <code>00</code></li>
<li><strong>Show Low‑stock items</strong> – แสดงเฉพาะรายการที่จำนวนคงเหลือต่ำกว่าปริมาณแจ้งเตือน (Min Qty)</li>
</ul>

<h2>8 คำแนะนำการใช้งาน</h2>
<ul>
<li>กรอก <strong>Name (Description)</strong> ให้ชัดเจนเพื่อให้ค้นหาได้ง่าย</li>
<li>อัปเดตไฟล์ Excel ต้นฉบับและสำรองข้อมูลหลังการเปลี่ยนแปลงสำคัญ</li>
<li>ส่งเสริมให้พนักงานปรับปรุงปริมาณทันทีหลังการเบิกหรือคืนสินค้า</li>
<li>เมื่อส่งออกข้อมูล ให้เปลี่ยนชื่อไฟล์ให้มีวันที่ เช่น <code>samplebank_2025‑11‑21.xlsx</code> เพื่อความสะดวกในการย้อนกลับ</li>
<li><strong>คำเตือนเกี่ยวกับข้อมูลเบราว์เซอร์</strong>: โปรแกรมนี้ใช้ฐานข้อมูลภายในเบราว์เซอร์ (IndexedDB) <strong>การล้างแคชหรือข้อมูลไซต์ของเบราว์เซอร์จะทำให้ข้อมูลสินค้าของคุณหายไป</strong> ควรหมั่นทำ <strong>Backup (.json)</strong> หรือ <strong>Export (.xlsx)</strong> เก็บไว้ในคอมพิวเตอร์เสมอ</li>
</ul>

<h2>9 การแก้ไขปัญหา</h2>
<table class="manual-table">
<thead>
<tr><th>ปัญหา</th><th>วิธีแก้</th></tr>
</thead>
<tbody>
<tr><td><strong>คลิกลิงก์ BN ไม่ได้</strong></td><td>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต ลิงก์ BN จะเปิดในแท็บใหม่ หากเบราว์เซอร์บล็อกป็อปอัพ ให้อนุญาตป็อปอัพสำหรับไซต์นี้</td></tr>
<tr><td><strong>นำเข้าไม่สำเร็จ</strong></td><td>ตรวจสอบว่าไฟล์ Excel มีโครงสร้างคอลัมน์ถูกต้อง ต้องมีคอลัมน์ <code>Article</code>, <code>Name</code>, <code>BN</code>, <code>Category</code>, <code>Location</code>, <code>Qty</code> และ <code>Min Qty</code> ห้ามใช้เซลล์รวม</td></tr>
<tr><td><strong>เกิดข้อผิดพลาดตำแหน่งซ้ำ</strong></td><td>แต่ละตำแหน่งต้องไม่ซ้ำกัน ยกเว้น <code>00 (Dummy)</code> ให้แก้ไขหรือลบรายการที่ใช้ตำแหน่งนั้นก่อน</td></tr>
<tr><td><strong>รูปไม่แสดง</strong></td><td>ไฟล์รูปต้องอยู่ในโฟลเดอร์ <code>BNImage</code> และชื่อไฟล์ต้องตรงกับชื่อไฟล์รูปที่กำหนดตอนเพิ่มรายการ หรือใช้เลขบทความเป็นชื่อ เช่น <code>1234567.jpg</code></td></tr>
</tbody>
</table>

<h2>10 ระบบช่วยเหลือภายในแอป (In-App Help)</h2>
<p>คลิกปุ่ม <strong>Help</strong> (?) ในแถบเครื่องมือเพื่อเปิดคู่มือการใช้งานนี้ภายในโปรแกรม</p>
<ul>
<li><strong>เปลี่ยนภาษา</strong>: สลับระหว่าง <strong>English</strong> และ <strong>Thai</strong> โดยใช้ปุ่มที่ด้านบนของหน้าต่าง</li>
<li><strong>เลื่อนดู</strong>: เลื่อนอ่านเนื้อหาเพื่อค้นหาหัวข้อที่ต้องการ</li>
<li><strong>ปิด</strong>: คลิกปุ่ม <strong>Close</strong> หรือคลิกพื้นที่ว่างด้านนอกเพื่อปิดหน้าต่าง</li>
</ul>

<h2>11 ติดต่อและการสนับสนุน</h2>
<p>โปรแกรมนี้พัฒนาและดูแลโดยทีมภายใน หากมีคำถาม ข้อเสนอแนะ หรือรายงานปัญหา กรุณาติดต่อผู้ประสานงานของ Bossard หรือทีมพัฒนา จะมีการอัปเดตเวอร์ชันใหม่ (เช่น O1.1.3) เมื่อมีการปรับปรุงเพิ่มเติม</p>
</div>
`;

const UI_TOOLTIPS = {
    // Toolbar
    "categorySelect": { en: "Filter items by major category", th: "กรองสินค้าตามหมวดหมู่หลัก" },
    "searchInput": { en: "Search by Article No, BN, Description or Material", th: "ค้นหาจากเลข Article, BN, คำอธิบาย หรือวัสดุ" },
    "sortSelect": { en: "Sort the displayed item cards", th: "เรียงลำดับการ์ดสินค้า" },
    "btnAdd": { en: "Add a new item to the library", th: "เพิ่มรายการสินค้าใหม่ลงในไลบรารี" },
    "btnPrepareOrder": { en: "Review selected items and export order list", th: "ตรวจสอบรายการที่เลือกและส่งออกใบสั่งซื้อ" },
    "btnSelectAll": { en: "Select all currently visible items", th: "เลือกสินค้าทั้งหมดที่แสดงอยู่" },
    "btnExportExcel": { en: "Export current list to Excel file", th: "ส่งออกรายการปัจจุบันเป็นไฟล์ Excel" },
    "btnExportJSON": { en: "Save current data as JSON (Backup)", th: "บันทึกข้อมูลปัจจุบันเป็น JSON (สำรองข้อมูล)" },
    "btnImportExcel": { en: "Import data from Excel or JSON file", th: "นำเข้าข้อมูลจากไฟล์ Excel หรือ JSON" },
    "btnAudit": { en: "View history of changes (Audit Log)", th: "ดูประวัติการเปลี่ยนแปลง (Audit Log)" },
    "btnBackup": { en: "Download full backup (Data + Logs)", th: "ดาวน์โหลดไฟล์สำรองข้อมูลเต็มรูปแบบ (ข้อมูล + บันทึก)" },
    "btnHelp": { en: "Open User Manual and Help", th: "เปิดคู่มือการใช้งานและช่วยเหลือ" },

    // Header
    "userLoginTrigger": { en: "Click to Login or Switch User", th: "คลิกเพื่อเข้าสู่ระบบหรือเปลี่ยนผู้ใช้" },
    "themeToggle": { en: "Switch between Light and Dark mode", th: "สลับระหว่างโหมดสว่างและโหมดมืด" },

    // Sidebar
    "btnClearFilters": { en: "Reset all active filters", th: "ล้างตัวกรองทั้งหมด" },
    "onlySample": { en: "Show only items that are currently in stock (Qty > 0)", th: "แสดงเฉพาะรายการที่มีสินค้าคงเหลือ (Qty > 0)" },
    "onlyLowStock": { en: "Show items where stock is below pack size limit", th: "แสดงรายการที่จำนวนคงเหลือต่ำกว่าขนาดบรรจุ (ต้องเติม)" },
    "showDummy": { en: "Toggle to show or hide items with Location '00' (Dummy)", th: "แสดง/ซ่อนรายการที่ตำแหน่ง 00 (รายการสมมติ)" },
    "filterQtyLow": { en: "Toggle to show items with quantity less than specified limit", th: "แสดงเฉพาะสินค้าที่มีจำนวนน้อยกว่ากำหนด" },
    "qtyLowLimit": { en: "Set the quantity limit for the low stock filter", th: "กำหนดจำนวนขั้นต่ำสำหรับกรองสินค้าใกล้หมด" },
    "lbl_category": { en: "Filter by Category", th: "กรองตามหมวดหมู่" },
    "lbl_standard": { en: "Filter by Standard (e.g. DIN, ISO)", th: "กรองตามมาตรฐาน (เช่น DIN, ISO)" },
    "lbl_material": { en: "Filter by Material", th: "กรองตามวัสดุ" },
    "lbl_grade": { en: "Filter by Grade/Class", th: "กรองตามเกรด/คลาส" },
    "lbl_plating": { en: "Filter by Plating/Coating", th: "กรองตามผิวเคลือบ" },
    "lbl_head": { en: "Filter by Head Type", th: "กรองตามชนิดหัว" },
    "lbl_recess": { en: "Filter by Recess/Drive", th: "กรองตามชนิดร่องขัน" },
    "lbl_dim1": { en: "Filter by Dimension 1 (Thread/Diameter)", th: "กรองตามขนาด 1 (เกลียว/เส้นผ่านศูนย์กลาง)" },
    "lbl_dim2": { en: "Filter by Dimension 2 (Length)", th: "กรองตามขนาด 2 (ความยาว)" },
    "lbl_location": { en: "Filter by Storage Location", th: "กรองตามตำแหน่งจัดเก็บ" },
    "lbl_onlySample": { en: "Show only items with stock > 0", th: "แสดงเฉพาะรายการที่มีของ (> 0)" },
    "lbl_onlyLow": { en: "Show items needing replenishment", th: "แสดงรายการที่ต้องเติมของ" },
    "lbl_showDummy": { en: "Include items without a physical location (00)", th: "รวมรายการที่ไม่มีตำแหน่งเก็บจริง (00)" },
    "lbl_filterQtyLow": { en: "Enable quantity limit filter", th: "เปิดใช้งานตัวกรองตามจำนวน" },

    // Cards
    "card_article": { en: "Click to select item for Order", th: "คลิกเพื่อเลือกรายการสำหรับการสั่งซื้อ" },
    "card_bn": { en: "Click to open details and similar items including download CAD file", th: "คลิกเพื่อเปิดรายละเอียดและสินค้าใกล้เคียงรวมถึงดาวน์โหลดไฟล์ CAD" },
    "card_img": { en: "Click to open Item Details", th: "คลิกเพื่อดูรายละเอียดสินค้า" },
    "card_location": { en: "Storage Location (00 = Dummy)", th: "ตำแหน่งจัดเก็บ (00 = สมมติ)" },
    "card_qty": { en: "Current stock quantity in pieces", th: "จำนวนสินค้าคงเหลือ (ชิ้น)" },
    "card_btn_manage": { en: "Manage Stock (Withdraw/Result)", th: "จัดการสต็อก (เบิก/เติม)" },
    "card_btn_note": { en: "Add/Edit Note", th: "เพิ่ม/แก้ไขโน้ต" },
    "card_btn_edit": { en: "Edit Item Data", th: "แก้ไขข้อมูลสินค้า" },
    "card_btn_del": { en: "Delete Item", th: "ลบรายการนี้" },

    // Item Detail Dialog
    "btn_detail_manage": { en: "Adjust stock quantity (Withdraw/Fill)", th: "ปรับปรุงยอดสต็อก (เบิก/เติม)" },
    "btn_detail_note": { en: "Add or edit notes for this item", th: "เพิ่มหรือแก้ไขโน้ตสำหรับรายการนี้" },
    "btn_detail_find": { en: "Find similar items (Equivalents)", th: "ค้นหาสินค้าทดแทน (เทียบเท่า)" },
    "btn_detail_edit": { en: "Edit item details", th: "แก้ไขรายละเอียดสินค้า" },
    "btn_detail_close": { en: "Close detail view", th: "ปิดหน้าต่างรายละเอียด" },
    "lbl_detail_bn": { en: "Bossard Number", th: "รหัส Bossard" },
    "lbl_detail_loc": { en: "Location", th: "ตำแหน่ง" },
    "lbl_detail_qty": { en: "Quantity / Pack Size", th: "จำนวน / ขนาดบรรจุ" },

    // Find Equivalent Dialog
    "btn_cmp_clear": { en: "Clear all filters", th: "ล้างตัวกรองทั้งหมด" },
    "btn_cmp_cleardims": { en: "Clear dimension filters only", th: "ล้างตัวกรองขนาด" },
    "btn_cmp_clearmat": { en: "Clear material filters only", th: "ล้างตัวกรองวัสดุ" },
    "btn_cmp_close": { en: "Close comparison view", th: "ปิดหน้าต่างเปรียบเทียบ" },
    "lbl_cmp_std": { en: "Standard", th: "มาตรฐาน" },
    "lbl_cmp_head": { en: "Head Type", th: "ชนิดหัว" },
    "lbl_cmp_recess": { en: "Recess", th: "ร่องขัน" }
};
