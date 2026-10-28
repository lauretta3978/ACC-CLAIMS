# Project Specification: Intelligent Expense Claim Automation App

## 1. Executive Summary
This application automates the ingestion of consolidated receipt PDFs (such as `VICKY'S CLAIM.pdf`) and extracts transaction data using **Google AI Studio** (Gemini models). The extracted data is then mapped directly into the exact columnar structure of the official **EMO Book Services Staff Claim Form**, producing a standardized Excel datasheet ready for administrative review and approval.

## 2. System Workflow & Architecture
1. **Input Ingestion:** Upload the staff's consolidated PDF containing receipts, invoices, e-mail confirmations, and transaction logs.
2. **AI Extraction & Categorization:** Google AI Studio processes the document, extracting transaction dates, vendors, descriptions, amounts, and mapping them to EMO's official claim account codes and details.
3. **Data Structuring:** The backend compiles the extracted entries into a clean JSON structure corresponding to the claim form fields.
4. **Excel Export:** Generates an Excel workbook matching the layout of the EMO Staff Claim Form, including header metadata (`Name`, `IC No`, `Claim For / Month`) and the categorized expense table.

## 3. Claim Form Column & Account Code Mapping
The generated Excel datasheet and backend schema must strictly adhere to the column headers and account codes defined in the official EMO Staff Claim Form:

| Column Header | Description / Source Field |
| :--- | :--- |
| **Staff Name** | Employee full name as per IC (extracted from form header or user input). |
| **IC No** | Employee IC number. |
| **Claim For** | Target claim period / month (e.g., October 2026). |
| **CODE** | EMO Account Code corresponding to the expense category (e.g., `920-0000` for Petrol, `952-0001` for Delivery, `910-0000` for Stationery). |
| **DETAILS** | Category description from the claim form (e.g., Petrol-RON95/Diesel, Transportation, Printing & Stationery). |
| **AMOUNT (RM)** | Total numerical expense amount in MYR. |
| **REMARK** | Vendor name, receipt/invoice number, and brief item description or business purpose. |

### Reference Account Codes & Categories (from EMO Claim Form)
- `400-00 923-0000`: Cash Purchase (for book / resell only)
- `928-0000`: Courier Charges
- `919-0000`: Entertainment
- `946-0000` / `939-0000`: Sponsorship / Others / Subscriptions
- `940-`: Medical Fee
- `920-0000`: Petrol - RON95 / Diesel
- `921-0001` / `921-0002`: Parking / Toll
- `910-0000`: Printing & Stationery
- `912-0000`: Postage & Stamp
- `905-0001`: Travelling Expenses - Grab, Public Transport
- `905-0002`: Travelling Expenses - Local
- `952-0001`: Transportation (Delivery Expenses / Lalamove)
- `617-0001` / `617-0002` / `617-0003`: Packing Material (Box, Bag, Bubble Wrap)
- `959-0001`: Upkeep of Hardware / Software Subscriptions (Claude Pro, Canva)
- `906-0001`: Upkeep of Motor Vehicle / Maintenance

## 4. Google AI Studio Instructions & System Prompt

Configure your model in **Google AI Studio** with the following parameters:

* **Model:** `Gemini 2.5 Flash` or `Gemini 1.5 Pro`
* **Temperature:** `0.1` (Low temperature for strict factual extraction and code mapping)
* **Response Mime Type:** `application/json`

### System Prompt Template
```text
You are an expert financial auditor and automated data extraction assistant for EMO Book Services Sdn Bhd. 
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

Ensure all foreign currencies (USD, CNY) are converted to MYR using exchange rates noted on receipts/statements. Do not include markdown code wrappers in the raw JSON output if requested as plain JSON.
```

## 5. Python Integration Blueprint
```python
import json
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
    print(f"Claim form Excel generated successfully at {output_excel_path}")