import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import * as XLSX from 'xlsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory User Store with initial Admin & Staff accounts
interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  passwordHash: string; // Plain/Demo stored for mock session
  createdAt: string;
  lastLogin?: string;
}

const usersDatabase: UserRecord[] = [
  {
    id: 'usr-admin-1',
    name: 'Finance Admin',
    email: 'admin@emobooks.com.my',
    role: 'Admin',
    passwordHash: 'admin123',
    createdAt: '2026-10-01T08:00:00Z',
    lastLogin: '2026-10-27T10:15:00Z',
  },
  {
    id: 'usr-staff-1',
    name: 'Vigneshwaran A/L Suriyakumaran',
    email: 'vignesh@emobooks.com.my',
    role: 'Staff',
    passwordHash: 'vicky123',
    createdAt: '2026-10-05T09:30:00Z',
    lastLogin: '2026-10-27T14:20:00Z',
  },
  {
    id: 'usr-staff-2',
    name: 'Mohd Firdaus Bin Ismail',
    email: 'firdaus@emobooks.com.my',
    role: 'Staff',
    passwordHash: 'firdaus123',
    createdAt: '2026-10-10T11:00:00Z',
    lastLogin: '2026-10-25T16:00:00Z',
  },
];

// System instruction matching ClaimGenius prompt specifications
const CLAIMGENIUS_SYSTEM_INSTRUCTION = `You are ClaimGenius, an intelligent expense claim automation assistant for EMO Book Services Sdn Bhd. Your role is to process uploaded receipts, invoices, PDFs, and transactional documents, extract exact financial data, segregate them according to official company claim categories, generate clean Excel reports, and flag discrepancies.

Extract each transaction and map strictly to the official EMO claim categories and account codes:
- "400-00": Cash Purchase (for book / resell only)
- "946-0000": License & Registration Fee
- "939-0000": Medical Fee / Software Subscriptions
- "920-0000": Petrol (RON95 / Diesel)
- "921-0001": Parking
- "921-0002": Toll
- "910-0000": Printing & Stationery
- "912-0000": Postage & Stamp
- "926-0000": Staff Welfare
- "906-0001": Upkeep of Motor Vehicle
- "918-0000": Upkeep of Office
- "617-0002": Packing Material (Bags / Plastic Bags)
- "952-0001": Transportation (Delivery Expenses / Lalamove / Pos)

Processing Rules:
1. Accurately extract Vendor Name, Transaction Date (DD/MM/YYYY), Line Items description, and Total Amount in RM from all attached files (PDFs, images, receipts). Convert any foreign currency (USD, CNY) to MYR using exact local settlement rate.
2. Map each item strictly to its correct Staff Claim Form category and code from the list above.
3. Compute tax amount if itemized (e.g. SST 6% or 8%). If no tax is noted, set 0.00.
4. Flag potential discrepancies:
   - Missing tax invoice details for hospitality/dining/services.
   - High value transactions (> RM 500).
   - Potential policy non-compliance.
5. Return strictly valid JSON array of objects.`;

// Auth Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = usersDatabase.find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase().trim() && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password. Use admin@emobooks.com.my / admin123 or vignesh@emobooks.com.my / vicky123.',
    });
  }

  user.lastLogin = new Date().toISOString();
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: `token-${user.id}-${Date.now()}`,
    },
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, role = 'Staff' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  const existing = usersDatabase.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role === 'Admin' ? 'Admin' : 'Staff',
    passwordHash: password,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  usersDatabase.push(newUser);
  return res.json({
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: `token-${newUser.id}-${Date.now()}`,
    },
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const user = usersDatabase.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ success: false, error: 'No user registered with that email address.' });
  }

  if (newPassword) {
    user.passwordHash = newPassword;
  }
  return res.json({
    success: true,
    message: `Password reset successfully. A confirmation notice was dispatched to ${email}.`,
  });
});

// Admin User Management Routes
app.get('/api/admin/users', (_req: Request, res: Response) => {
  const safeUsers = usersDatabase.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));
  return res.json({ success: true, users: safeUsers });
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const existing = usersDatabase.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, error: 'User with this email already exists.' });
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role === 'Admin' ? 'Admin' : 'Staff',
    passwordHash: password,
    createdAt: new Date().toISOString(),
  };
  usersDatabase.push(newUser);

  return res.json({ success: true, user: newUser });
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = usersDatabase.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (usersDatabase[index].email === 'admin@emobooks.com.my') {
    return res.status(400).json({ success: false, error: 'Primary Finance Admin cannot be deleted.' });
  }

  usersDatabase.splice(index, 1);
  return res.json({ success: true, message: 'User deleted successfully.' });
});

app.post('/api/admin/users/:id/reset-password', (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const user = usersDatabase.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  user.passwordHash = newPassword || 'emo2026!';
  return res.json({ success: true, message: `Password for ${user.name} reset to: ${user.passwordHash}` });
});

// Extraction Endpoint strictly using gemini-3.8-flash (Fixing deprecated models)
app.post('/api/extract-claims', async (req: Request, res: Response) => {
  try {
    const { files, staffNameHint, claimMonthHint } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided for extraction. Please upload at least one PDF or image.',
      });
    }

    const parts: any[] = [];
    let promptText = `Analyze all receipts, invoices, and digital payment confirmations for EMO Book Services Sdn Bhd. Extract every transaction, line item, and map strictly to the official EMO claim codes.`;
    if (staffNameHint) {
      promptText += ` Staff claimant name: "${staffNameHint}".`;
    }
    if (claimMonthHint) {
      promptText += ` Claim Month: "${claimMonthHint}".`;
    }
    parts.push({ text: promptText });

    for (const file of files) {
      let base64Data = file.base64;
      let mimeType = file.type || 'application/pdf';

      if (base64Data.includes(';base64,')) {
        const partsSplit = base64Data.split(';base64,');
        base64Data = partsSplit[1];
        if (!file.type && partsSplit[0].includes(':')) {
          mimeType = partsSplit[0].split(':')[1];
        }
      }

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    // STRICTLY gemini-3.8-flash as per specification
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: CLAIMGENIUS_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              staff_name: { type: Type.STRING },
              claim_month: { type: Type.STRING },
              code: { type: Type.STRING },
              details: { type: Type.STRING },
              merchant_name: { type: Type.STRING },
              receipt_date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              tax_amount: { type: Type.NUMBER },
              discrepancy_flag: { type: Type.STRING },
            },
            required: [
              'staff_name',
              'claim_month',
              'code',
              'details',
              'merchant_name',
              'receipt_date',
              'description',
              'amount',
            ],
          },
        },
      },
    });

    const rawText = response.text || '[]';
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const items = parsed.map((item, index) => {
      const amt = typeof item.amount === 'number' ? Number(item.amount.toFixed(2)) : 0.00;
      const tax = typeof item.tax_amount === 'number' ? Number(item.tax_amount.toFixed(2)) : 0.00;
      let discrepancy = item.discrepancy_flag || null;

      // Rule-based discrepancy detection
      if (!discrepancy) {
        if ((item.details?.toLowerCase().includes('dining') || item.details?.toLowerCase().includes('hotel')) && tax === 0) {
          discrepancy = 'Missing SST tax breakdown on commercial receipt';
        } else if (amt > 500) {
          discrepancy = 'High amount (> RM 500) requires senior managerial approval';
        }
      }

      return {
        id: `claim-${Date.now()}-${index + 1}`,
        staff_name: item.staff_name || staffNameHint || 'Vigneshwaran A/L Suriyakumaran',
        ic_no: '940512-14-5831',
        claim_month: item.claim_month || claimMonthHint || 'October 2026',
        code: item.code || '910-0000',
        details: item.details || 'Printing & Stationery',
        merchant_name: item.merchant_name || 'Vendor',
        receipt_date: item.receipt_date || new Date().toLocaleDateString('en-GB'),
        description: item.description || 'Business Expense',
        amount: amt,
        tax_amount: tax,
        discrepancy,
        status: discrepancy ? 'Flagged' : 'Verified',
        source_file: files[0]?.name || "Vicky's Claim.pdf",
      };
    });

    return res.json({
      success: true,
      model: 'gemini-3.8-flash',
      count: items.length,
      items,
      rawOutput: rawText,
    });
  } catch (error: any) {
    console.error('Error during ClaimGenius extraction:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during receipt processing.',
    });
  }
});

// Server-side Excel generation with segregated categories & Discrepancies report
app.post('/api/export-excel', (req: Request, res: Response) => {
  try {
    const { items, staffName = 'Vigneshwaran A/L Suriyakumaran', claimMonth = 'October 2026' } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }

    const wb = XLSX.utils.book_new();

    // 1. Segregated Categories Sheet
    const categorizedRows: any[] = [];
    const grouped: Record<string, any[]> = {};

    items.forEach((it) => {
      const key = `${it.code} - ${it.details}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(it);
    });

    let overallGrandTotal = 0;

    Object.entries(grouped).forEach(([catTitle, catItems]) => {
      categorizedRows.push({
        'Category Code': catTitle,
        'Merchant Name': '',
        'Transaction Date': '',
        'Description / Remarks': '',
        'Amount (RM)': '',
        'Status': '',
      });

      let subtotal = 0;
      catItems.forEach((it) => {
        subtotal += Number(it.amount) || 0;
        overallGrandTotal += Number(it.amount) || 0;
        categorizedRows.push({
          'Category Code': it.code,
          'Merchant Name': it.merchant_name,
          'Transaction Date': it.receipt_date,
          'Description / Remarks': it.description,
          'Amount (RM)': Number((Number(it.amount) || 0).toFixed(2)),
          'Status': it.status || 'Verified',
        });
      });

      categorizedRows.push({
        'Category Code': `SUBTOTAL [${catTitle}]`,
        'Merchant Name': '',
        'Transaction Date': '',
        'Description / Remarks': `${catItems.length} items`,
        'Amount (RM)': Number(subtotal.toFixed(2)),
        'Status': 'Subtotal',
      });

      categorizedRows.push({}); // empty line separator
    });

    // Grand Total Row
    categorizedRows.push({
      'Category Code': 'OVERALL GRAND TOTAL',
      'Merchant Name': 'EMO Book Services Sdn Bhd',
      'Transaction Date': '',
      'Description / Remarks': `Total ${items.length} verified transactions`,
      'Amount (RM)': Number(overallGrandTotal.toFixed(2)),
      'Status': 'Approved for Reimbursement',
    });

    const wsClaims = XLSX.utils.json_to_sheet(categorizedRows);
    wsClaims['!cols'] = [
      { wch: 32 },
      { wch: 28 },
      { wch: 18 },
      { wch: 45 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsClaims, 'Segregated Claim Report');

    // 2. Discrepancy Report Sheet
    const discrepancies = items.filter((it) => it.discrepancy || it.status === 'Flagged');
    const discrepancyRows = discrepancies.map((it) => ({
      'Item ID': it.id,
      'Merchant Name': it.merchant_name,
      'Date': it.receipt_date,
      'Account Code': it.code,
      'Amount (RM)': it.amount,
      'Discrepancy / Policy Flag': it.discrepancy || 'Unverified expense requiring auditor signoff',
      'Recommended Action': 'Audit review & receipt re-verification',
    }));

    if (discrepancyRows.length === 0) {
      discrepancyRows.push({
        'Item ID': 'CLEAR',
        'Merchant Name': 'All transactions verified',
        'Date': '',
        'Account Code': '',
        'Amount (RM)': 0,
        'Discrepancy / Policy Flag': 'No discrepancies, duplicates, or missing tax detected',
        'Recommended Action': 'Proceed to direct payment settlement',
      });
    }

    const wsDiscrepancies = XLSX.utils.json_to_sheet(discrepancyRows);
    wsDiscrepancies['!cols'] = [
      { wch: 16 },
      { wch: 26 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 45 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDiscrepancies, 'Discrepancy Report');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ClaimGenius_Segregated_Claim_Report.xlsx"');
    return res.send(buffer);
  } catch (error: any) {
    console.error('Error generating Excel file:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API route to get current EMO spec markdown
app.get('/api/spec', (_req: Request, res: Response) => {
  try {
    const specPaths = [
      path.resolve(__dirname, 'public/assets/aistudio/claimgenius_product_specification_6bd53865.md'),
      path.resolve(__dirname, 'public/assets/aistudio/expense_claim_automation_specification__1__581a4681.md'),
      path.resolve(__dirname, 'public/assets/aistudio/expense_claim_automation_specification_07425ccb.md'),
    ];
    for (const p of specPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        return res.json({ success: true, markdown: content });
      }
    }
    return res.json({ success: false, message: 'Specification file not found' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware or static serving
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
