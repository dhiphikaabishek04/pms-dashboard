const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'Final Annual Compensation Revision FY27_Template_V1.xlsx');
const wb = XLSX.readFile(filePath);

// Let's parse the Main Sheet using the logic from ExcelUploadView
const mainSheet = wb.Sheets['Main Sheet'];
const rows = XLSX.utils.sheet_to_json(mainSheet, { header: 1 });

// Find the header row
let headerIndex = -1;
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  if (Array.isArray(row) && row.length > 2) {
    const s0 = String(row[0] || "").toLowerCase().trim();
    const s1 = String(row[1] || "").toLowerCase().trim();
    if ((s0 === "emp id" || s0 === "emp_id" || s0 === "employee id" || s0 === "employee_id") && s1 === "employee name") {
      headerIndex = i;
      break;
    }
  }
}

console.log('Header Index:', headerIndex);

if (headerIndex !== -1) {
  const headers = rows[headerIndex].map(h => String(h || "").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim());
  const employees = [];
  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row) || row.length === 0) continue;
    if (row.every(cell => cell === null || cell === undefined || cell === "")) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      if (header) {
        obj[header] = row[idx] !== undefined ? row[idx] : null;
      }
    });

    const empId = String(obj["Emp ID"] || "").toLowerCase().trim();
    const empName = String(obj["Employee Name"] || "").toLowerCase().trim();
    if (!empId || !empName || empId.includes("total") || empName.includes("total") || empName.includes("grand total")) {
      continue;
    }
    employees.push(obj);
  }

  console.log(`Parsed ${employees.length} employees.`);

  // Group by Department
  const deptData = {};
  employees.forEach(emp => {
    const dept = (emp["Department"] || emp["Group"] || "Unknown").toString().trim().toUpperCase();
    const current = Number(String(emp["Current CTC"] || "0").replace(/[^\d.-]/g, "")) || 0;
    const revised = Number(String(emp["Revised CTC"] || "0").replace(/[^\d.-]/g, "")) || 0;
    const increment = Number(String(emp["Total Increment"] || "0").replace(/[^\d.-]/g, "")) || 0;
    const promo = (emp["Promotion (Yes / No)"] || emp["Promotion"] || "").toString().toLowerCase().trim() === 'yes';

    if (!deptData[dept]) {
      deptData[dept] = { count: 0, currentCTC: 0, revisedCTC: 0, increment: 0, promos: 0 };
    }
    deptData[dept].count++;
    deptData[dept].currentCTC += current;
    deptData[dept].revisedCTC += revised;
    deptData[dept].increment += increment;
    if (promo) deptData[dept].promos++;
  });

  console.log('Department Summary from Excel:');
  console.log(JSON.stringify(deptData, null, 2));
}
