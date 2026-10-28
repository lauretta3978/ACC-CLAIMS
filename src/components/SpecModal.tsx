import React, { useState } from 'react';
import { X, Copy, Check, BookOpen, Terminal, Sparkles, FileText } from 'lucide-react';
import { EMO_ACCOUNT_CODES } from '../data/sampleClaims';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'codes' | 'schema' | 'blueprint'>('prompt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const emoPrompt = `You are an expert financial auditor and automated data extraction assistant for EMO Book Services Sdn Bhd. 
Your task is to analyze the uploaded PDF containing various receipts, invoices, and payment confirmations, and map every expense item directly into EMO's official Staff Claim Form structure.

For each receipt or transaction found in the document, extract and categorize the data into the following JSON schema:

{
  "staff_name": "String (Employee name found in receipts/emails)",
  "ic_no": "String (If available, otherwise 'N/A')",
  "claim_for": "String (Claim month/period, e.g., October 2026)",
  "items": [
    {
      "code": "String (Appropriate EMO Account Code based on category, e.g., '920-0000' for fuel, '952-0001' for delivery, '910-0000' for stationery, '959-0001' for software subscriptions)",
      "details": "String (Exact claim category description from the EMO form)",
      "amount_rm": "Float (Total amount in MYR, converted if foreign currency like USD/CNY)",
      "remark": "String (Format: [Vendor Name] - [Invoice/Order ID] - [Brief Description])"
    }
  ]
}

Ensure all foreign currencies (USD, CNY) are converted to MYR using exchange rates noted on receipts/statements.`;

  const pythonScript = `import json
import pandas as pd
from google import genai

client = genai.Client()

def parse_claim_pdf(pdf_path: str, output_excel_path: str):
    # Upload PDF via File API
    uploaded_file = client.files.upload(file=pdf_path)
    
    prompt = """
    Extract all receipts and map them to EMO Book Services Staff Claim Form categories, 
    account codes, amounts, and structured remarks. Return valid JSON.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[uploaded_file, prompt],
        config={
            'response_mime_type': 'application/json',
        },
    )
    
    data = json.loads(response.text)
    
    # Flatten items for Excel export matching claim form rows
    rows = []
    staff_name = data.get("staff_name", "Vigneshwaran A/L Suriyakumaran")
    ic_no = data.get("ic_no", "N/A")
    claim_for = data.get("claim_for", "October 2026")
    
    for item in data.get("items", []):
        rows.append({
            "Staff Name": staff_name,
            "IC No": ic_no,
            "Claim For": claim_for,
            "CODE": item.get("code"),
            "DETAILS": item.get("details"),
            "AMOUNT (RM)": item.get("amount_rm"),
            "REMARK": item.get("remark")
        })
        
    df = pd.DataFrame(rows)
    df.to_excel(output_excel_path, index=False)
    print(f"Claim form Excel generated successfully at {output_excel_path}")`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                EMO Book Services — Claim Specification &amp; Account Codes
              </h3>
              <p className="text-xs text-slate-400">
                Official Staff Claim Form V2026 • Google AI Studio Prompt &amp; Python Blueprint
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex space-x-4 shrink-0">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'prompt' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio Prompt &amp; Config</span>
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'codes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official EMO Account Codes</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'schema' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Claim Form Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'blueprint' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Script Blueprint</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-800 text-xs">
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-sm text-slate-900 mb-2">
                  Google AI Studio Model Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Model</span>
                    <p className="font-bold text-slate-900 mt-0.5">Gemini 2.5 Flash / 3.8 Flash</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Temperature</span>
                    <p className="font-bold text-slate-900 mt-0.5">0.1 (Strict factual extraction)</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Response MIME</span>
                    <p className="font-bold text-slate-900 mt-0.5">application/json</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-600">
                      EMO Book Services System Prompt Template
                    </span>
                    <button
                      onClick={() => copyToClipboard(emoPrompt, 'prompt')}
                      className="inline-flex items-center px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700"
                    >
                      {copiedKey === 'prompt' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 mr-1" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" /> Copy Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {emoPrompt}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'codes' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">
                Official EMO Account Codes &amp; Details Master List
              </h4>
              <p className="text-slate-600">
                Every extracted receipt and digital invoice is mapped strictly to one of these official EMO categories:
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">CODE</th>
                      <th className="py-2.5 px-3">DETAILS (Claim Category)</th>
                      <th className="py-2.5 px-3">Common Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {EMO_ACCOUNT_CODES.map((acc) => (
                      <tr key={acc.code} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">{acc.code}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{acc.details}</td>
                        <td className="py-2 px-3 text-slate-500">
                          {acc.code.includes('920') && 'Shell, Petronas fuel top-ups'}
                          {acc.code.includes('952') && 'Lalamove, delivery dispatches'}
                          {acc.code.includes('959') && 'Claude Pro, Canva, software'}
                          {acc.code.includes('617') && 'Corrugated boxes, bubble wrap'}
                          {acc.code.includes('928') && 'Pos Laju, J&T, courier parcels'}
                          {acc.code.includes('910') && 'Popular book, thermal rolls, paper'}
                          {acc.code.includes('921') && 'Touch n Go, PLUS toll, parking'}
                          {acc.code.includes('400') && 'Book resale stock acquisition'}
                          {!['920','952','959','617','928','910','921','400'].some(k => acc.code.includes(k)) && 'Authorized corporate expense'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">
                Official EMO Staff Claim Form Column Schema
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Column Header</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">Staff Name</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Full employee name as per IC (e.g. Vigneshwaran A/L Suriyakumaran).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">IC No</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Employee IC number (e.g. 940512-14-5831).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">Claim For</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Claim month/period (e.g. October 2026).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">CODE</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">EMO official account code (e.g. 920-0000, 952-0001).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">DETAILS</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Category description corresponding to CODE.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">Merchant / Vendor Name</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Supplier or merchant name.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">Transaction Date</td>
                      <td className="py-2 px-3">Date (DD/MM/YYYY)</td>
                      <td className="py-2 px-3">Date printed on receipt.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">Description / Remarks</td>
                      <td className="py-2 px-3">String</td>
                      <td className="py-2 px-3">Line items, invoice number, or order ID.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">Amount (RM)</td>
                      <td className="py-2 px-3">Decimal</td>
                      <td className="py-2 px-3">Total amount in Malaysian Ringgit (MYR).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'blueprint' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Python Script Blueprint
                  </h4>
                  <p className="text-slate-500">
                    Uses Google GenAI SDK to map claims into pandas DataFrame and Excel.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(pythonScript, 'python')}
                  className="inline-flex items-center px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  {copiedKey === 'python' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Python Script
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {pythonScript}
              </pre>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
