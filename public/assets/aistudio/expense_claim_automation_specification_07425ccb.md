# Project Specification: Intelligent Expense Claim Automation App

## 1. Executive Summary
As an Account Manager overseeing financial and administrative workflows, the objective is to eliminate tedious manual data entry, reduce human error, and accelerate the staff claim reimbursement cycle. This application automates the ingestion of receipt PDFs, leverages **Google AI Studio** (Gemini models) for advanced visual and textual data extraction, and compiles a structured Excel datasheet mapped directly to corporate claim forms.

---

## 2. App Workflow & Architecture
1. **Input Stage:** Staff upload a consolidated PDF containing the completed claim form and attached scanned/digital receipts.
2. **Extraction Stage (Google AI Studio):** The backend sends the PDF pages to Google AI Studio using multimodal prompts to extract line-item transaction details and header metadata.
3. **Data Transformation & Validation:** The extracted JSON data is validated, cleaned, and structured into tabular rows.
4. **Excel Generation:** A script compiles the rows into an Excel workbook using standard corporate columns, including metadata fields (Staff Name, Claim Month, Claim Type).

---

## 3. Data Schema & Excel Columns
The generated Excel datasheet will contain the following standard columns derived from the corporate claim form:

| Column Header | Data Type | Description |
| :--- | :--- | :--- |
| `Staff Name` | String | Full name of the employee submitting the claim. |
| `Claim Month` | String / Date | Target month and year of the expense (e.g., October 2026). |
| `Claim Type` | String | Category of expense (e.g., Travel, Client Entertainment, Office Supplies, Medical). |
| `Receipt Date` | Date (DD/MM/YYYY) | Date printed on the individual merchant receipt. |
| `Merchant Name` | String | Name of the vendor or supplier. |
| `Description / Purpose` | String | Business justification or item description noted on the receipt/form. |
| `Currency` | String | ISO currency code (e.g., MYR, USD, SGD). |
| `Amount` | Decimal | Total amount paid (including tax). |
| `Tax / SST` | Decimal | Tax amount extracted from the receipt (if applicable). |
| `Status` | String | Default to `Pending Verification`. |

---

## 4. Google AI Studio Instructions & System Prompt

When configuring your model workspace in **Google AI Studio**, use the following configuration to ensure accurate receipt parsing and JSON formatting.

### Model Configuration
* **Model:** `Gemini 1.5 Pro` (Recommended for complex multimodal document analysis and structured JSON output).
* **Temperature:** `0.1` (Low temperature for high factual accuracy and strict adherence to formatting rules).
* **Response Mime Type:** `application/json`

### System Instructions / Prompt Template
```text
You are an expert financial auditor and AI data extraction assistant. Your task is to analyze the provided PDF file containing an employee expense claim form and attached receipts. 

Extract all individual expense transactions and header metadata, and output the result strictly as a JSON array of objects. Do not include markdown code block wrappers like ```json if unnecessary, or follow the strict JSON schema requested.

For each receipt found, extract:
1. "staff_name": Name of the staff member listed on the claim form.
2. "claim_month": The month and year the claim pertains to (format: Month YYYY).
3. "claim_type": The category of claim (e.g., Travel, Meals, Supplies, Transport).
4. "receipt_date": Date of transaction (DD/MM/YYYY).
5. "merchant_name": Name of the vendor.
6. "description": Brief summary of items or business purpose.
7. "currency": Currency code (e.g., MYR).
8. "amount": Total numerical value of the expense.
9. "tax_amount": Tax/SST/GST amount if itemized, otherwise 0.00.

Ensure all numerical values are returned as numbers, not strings. If any field is missing from the receipt, use "N/A" for text fields and 0.00 for numeric fields.
```

---

## 5. Technical Implementation Blueprint (Python Example)

```python
import json
import pandas as pd
from google import genai

# Initialize Google GenAI client (using Google AI Studio API key)
client = genai.Client()

def extract_receipts_to_excel(pdf_path: str, output_excel_path: str):
    # Upload the PDF file using the File API
    sample_pdf = client.files.upload(file=pdf_path)
    
    prompt = """
    Extract all expense entries from this claim document and receipts into a JSON array 
    matching fields: staff_name, claim_month, claim_type, receipt_date, merchant_name, 
    description, currency, amount, tax_amount.
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[sample_pdf, prompt],
        config={
            'response_mime_type': 'application/json',
        },
    )
    
    # Parse JSON response
    data = json.loads(response.text)
    
    # Convert JSON to DataFrame and export to Excel
    df = pd.DataFrame(data)
    df.to_excel(output_excel_path, index=False)
    print(f"Excel datasheet successfully generated at: {output_excel_path}")

# Example invocation
# extract_receipts_to_excel('path_to_claim_form.pdf', 'expense_claims_output.xlsx')