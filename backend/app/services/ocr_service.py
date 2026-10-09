import re
from typing import Dict, Any, Optional

class MedicalReportOCRService:
    @staticmethod
    def parse_report_text(raw_text: str) -> Dict[str, Any]:
        """Extracts standard diagnostic clinical values from medical report text / OCR scans."""
        extracted: Dict[str, Any] = {}
        text = raw_text.lower()

        # 1. Blood Sugar / Glucose
        sugar_match = re.search(r'(?:fasting\s*blood\s*(?:sugar|glucose)|fasting\s*glucose|glucose|fbs)\s*(?:cholesterol)?\s*[:=-]?\s*([0-9]{2,3}(?:\.[0-9]+)?)', text)
        if sugar_match:
            extracted["fasting_glucose_mg_dl"] = float(sugar_match.group(1))

        # 2. HbA1c
        hba1c_match = re.search(r'(?:hba1c|glycated\s*hemoglobin|a1c)\s*[:=-]?\s*([0-9]{1,2}(?:\.[0-9]+)?)\s*%?', text)
        if hba1c_match:
            extracted["hba1c_pct"] = float(hba1c_match.group(1))

        # 3. Total Cholesterol
        tc_match = re.search(r'(?:total\s*cholesterol|cholesterol\s*total|t\.?\s*chol)\s*[:=-]?\s*([0-9]{2,3}(?:\.[0-9]+)?)', text)
        if tc_match:
            extracted["total_cholesterol_mg_dl"] = float(tc_match.group(1))

        # 4. LDL Cholesterol
        ldl_match = re.search(r'(?:ldl\s*(?:cholesterol)?|low\s*density\s*lipoprotein|ldl-c)\s*[:=-]?\s*([0-9]{2,3}(?:\.[0-9]+)?)', text)
        if ldl_match:
            extracted["ldl_cholesterol_mg_dl"] = float(ldl_match.group(1))

        # 5. HDL Cholesterol
        hdl_match = re.search(r'(?:hdl\s*(?:cholesterol)?|high\s*density\s*lipoprotein|hdl-c)\s*[:=-]?\s*([0-9]{2,3}(?:\.[0-9]+)?)', text)
        if hdl_match:
            extracted["hdl_cholesterol_mg_dl"] = float(hdl_match.group(1))

        # 6. Triglycerides
        tg_match = re.search(r'(?:triglycerides|trigs|tg)\s*[:=-]?\s*([0-9]{2,3}(?:\.[0-9]+)?)', text)
        if tg_match:
            extracted["triglycerides_mg_dl"] = float(tg_match.group(1))

        # 7. Blood Pressure (Systolic / Diastolic)
        bp_match = re.search(r'(?:blood\s*pressure|bp)\s*[:=-]?\s*([0-9]{2,3})\s*/\s*([0-9]{2,3})', text)
        if bp_match:
            extracted["systolic_bp"] = int(bp_match.group(1))
            extracted["diastolic_bp"] = int(bp_match.group(2))

        # 8. Liver Enzymes: ALT (SGPT) & AST (SGOT)
        alt_match = re.search(r'(?:alt|sgpt|alanine\s*aminotransferase)\s*[:=-]?\s*([0-9]{1,3}(?:\.[0-9]+)?)', text)
        if not alt_match:
            alt_match = re.search(r'sgpt\s*\(alt\)\s*[:=-]?\s*([0-9]{1,3}(?:\.[0-9]+)?)', text)
        if alt_match:
            extracted["alt_u_l"] = float(alt_match.group(1))

        ast_match = re.search(r'(?:ast|sgot|aspartate\s*aminotransferase)\s*[:=-]?\s*([0-9]{1,3}(?:\.[0-9]+)?)', text)
        if not ast_match:
            ast_match = re.search(r'sgot\s*\(ast\)\s*[:=-]?\s*([0-9]{1,3}(?:\.[0-9]+)?)', text)
        if ast_match:
            extracted["ast_u_l"] = float(ast_match.group(1))

        # 9. Kidney: Creatinine & eGFR
        creat_match = re.search(r'(?:creatinine|serum\s*creatinine)\s*[:=-]?\s*([0-9]{1,2}(?:\.[0-9]+)?)', text)
        if creat_match:
            extracted["creatinine_mg_dl"] = float(creat_match.group(1))

        egfr_match = re.search(r'(?:egfr|estimated\s*gfr|gfr)\s*[:=-]?\s*([0-9]{2,3}(?:\.[0-9]+)?)', text)
        if egfr_match:
            extracted["egfr_ml_min"] = float(egfr_match.group(1))

        # 10. Thyroid (TSH)
        tsh_match = re.search(r'(?:tsh|thyroid\s*stimulating\s*hormone)\s*[:=-]?\s*([0-9]{1,2}(?:\.[0-9]+)?)', text)
        if tsh_match:
            extracted["tsh_uiu_ml"] = float(tsh_match.group(1))

        return {
            "success": True,
            "extracted_count": len(extracted),
            "biomarkers": extracted,
            "raw_text_length": len(raw_text),
            "confidence_score": 0.95 if len(extracted) >= 3 else 0.70
        }
