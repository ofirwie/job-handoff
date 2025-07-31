-- 40 Albaad International Job Handover Templates
-- Comprehensive templates for all departments and levels

-- Insert the 40 templates with proper manager assignments and realistic content
INSERT INTO templates (id, name, job_codes, sections, manager_id, department, is_department_standard, status, created_by) VALUES

-- PRODUCTION DEPARTMENT (8 templates)
(uuid_generate_v4(), 'Production Line Operator - Wet Wipes', ARRAY['PRD001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "shift_schedule", "type": "select", "label": "משמרת עבודה", "required": true, "options": ["בוקר", "ערב", "לילה"]},
      {"name": "production_line", "type": "text", "label": "קו ייצור", "required": true, "placeholder": "קו מספר..."},
      {"name": "replacement_training_date", "type": "date", "label": "תאריך הדרכת מחליף", "required": true}
    ]
  },
  "tasks": [
    {"id": "machine_operation", "description": "העלה מדריך הפעלת מכונות", "required": true, "folder_name": "Machine_Operations", "file_types": [".pdf", ".docx"], "instructions": "מדריכי הפעלה לכל המכונות בקו הייצור"},
    {"id": "quality_checks", "description": "רשימת בדיקות איכות יומיות", "required": true, "folder_name": "Quality_Control", "file_types": [".xlsx", ".pdf"], "instructions": "צ׳קליסט יומי לבדיקות איכות המוצר"},
    {"id": "safety_procedures", "description": "נוהלי בטיחות וחירום", "required": true, "folder_name": "Safety", "file_types": [".pdf"], "instructions": "נוהלי בטיחות, חירום ופינוי"},
    {"id": "production_targets", "description": "יעדי ייצור ומדדי ביצועים", "required": true, "folder_name": "Targets", "file_types": [".xlsx"], "instructions": "יעדים יומיים, שבועיים וחודשיים"},
    {"id": "maintenance_schedule", "description": "לוח זמנים תחזוקה מונעת", "required": false, "folder_name": "Maintenance", "file_types": [".xlsx", ".pdf"], "instructions": "לוח תחזוקה יומית ושבועית"}
  ]
}', NULL, 'Production', true, 'active', 'system'),

(uuid_generate_v4(), 'Production Shift Supervisor', ARRAY['PRD002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "team_size", "type": "number", "label": "גודל צוות", "required": true},
      {"name": "shift_type", "type": "select", "label": "סוג משמרת", "required": true, "options": ["בוקר", "ערב", "לילה", "סוף שבוע"]},
      {"name": "kpi_targets", "type": "textarea", "label": "יעדי KPI למשמרת", "required": true}
    ]
  },
  "tasks": [
    {"id": "team_contacts", "description": "רשימת אנשי קשר בצוות", "required": true, "folder_name": "Team_Management", "file_types": [".xlsx"], "instructions": "פרטי כל עובדי המשמרת כולל תפקידים מיוחדים"},
    {"id": "shift_procedures", "description": "נוהלי מעבר משמרות", "required": true, "folder_name": "Shift_Procedures", "file_types": [".docx", ".pdf"], "instructions": "נוהלי העברת מידע בין משמרות"},
    {"id": "problem_solving", "description": "מדריך פתרון בעיות נפוצות", "required": true, "folder_name": "Problem_Solving", "file_types": [".pdf", ".docx"], "instructions": "בעיות נפוצות בקו הייצור ופתרונות"},
    {"id": "performance_reports", "description": "דוחות ביצועים אחרונים", "required": true, "folder_name": "Reports", "file_types": [".xlsx", ".pdf"], "instructions": "דוחות ביצועי משמרת 3 חודשים אחרונים"},
    {"id": "training_records", "description": "רשומות הדרכות עובדים", "required": false, "folder_name": "Training", "file_types": [".xlsx"], "instructions": "מעקב אחר הדרכות והסמכות"}
  ]
}', NULL, 'Production', true, 'active', 'system'),

(uuid_generate_v4(), 'Production Manager', ARRAY['PRD003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים", 
    "order": 1,
    "fields": [
      {"name": "plant_location", "type": "select", "label": "מיקום מפעל", "required": true, "options": ["USA", "Poland", "Germany", "Spain", "Israel"]},
      {"name": "budget_authority", "type": "number", "label": "סמכות תקציבית (USD)", "required": true},
      {"name": "direct_reports", "type": "number", "label": "מספר כפופים ישירים", "required": true}
    ]
  },
  "tasks": [
    {"id": "budget_files", "description": "קבצי תקציב ומעקב הוצאות", "required": true, "folder_name": "Budget", "file_types": [".xlsx"], "instructions": "תקציב שנתי, מעקב חודשי, תחזיות"},
    {"id": "production_planning", "description": "תכנון ייצור ולוחות זמנים", "required": true, "folder_name": "Planning", "file_types": [".xlsx", ".mpp"], "instructions": "תכנון ייצור רבעוני ושנתי"},
    {"id": "supplier_contracts", "description": "חוזי ספקים ומחירונים", "required": true, "folder_name": "Suppliers", "file_types": [".pdf", ".xlsx"], "instructions": "חוזים פעילים, מחירונים, פרטי קשר"},
    {"id": "team_structure", "description": "מבנה ארגוני ותפקידים", "required": true, "folder_name": "Organization", "file_types": [".pdf", ".xlsx"], "instructions": "מבנה ארגוני, תיאורי תפקידים, סמכויות"},
    {"id": "regulatory_docs", "description": "מסמכי רגולציה ותקנים", "required": true, "folder_name": "Regulatory", "file_types": [".pdf"], "instructions": "ISO 9001, FDA, תקנים מקומיים"},
    {"id": "kpi_dashboard", "description": "דשבורד מדדי ביצועים", "required": true, "folder_name": "KPI", "file_types": [".xlsx", ".pbix"], "instructions": "מדדי ייצור, איכות, בטיחות"}
  ]
}', NULL, 'Production', true, 'active', 'system'),

(uuid_generate_v4(), 'Plant Production Director', ARRAY['PRD004'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1, 
    "fields": [
      {"name": "plant_capacity", "type": "text", "label": "קיבולת מפעל (יחידות/יום)", "required": true},
      {"name": "strategic_initiatives", "type": "textarea", "label": "יוזמות אסטרטגיות נוכחיות", "required": true},
      {"name": "board_meetings", "type": "date", "label": "פגישת דירקטוריון הבאה", "required": false}
    ]
  },
  "tasks": [
    {"id": "strategic_plans", "description": "תכניות אסטרטגיות 3-5 שנים", "required": true, "folder_name": "Strategy", "file_types": [".pptx", ".pdf"], "instructions": "תכניות צמיחה, השקעות, פיתוח מוצרים"},
    {"id": "financial_reports", "description": "דוחות כספיים ותחזיות", "required": true, "folder_name": "Finance", "file_types": [".xlsx", ".pdf"], "instructions": "P&L, תזרים מזומנים, תחזיות"},
    {"id": "board_materials", "description": "חומרי דירקטוריון ומצגות", "required": true, "folder_name": "Board", "file_types": [".pptx", ".pdf"], "instructions": "מצגות, דוחות, החלטות אסטרטגיות"},
    {"id": "regulatory_relations", "description": "יחסי רגולטורים ורישיונות", "required": true, "folder_name": "Regulatory", "file_types": [".pdf"], "instructions": "רישיונות, התכתבויות, ביקורות"},
    {"id": "stakeholder_map", "description": "מפת בעלי עניין וקשרים", "required": true, "folder_name": "Stakeholders", "file_types": [".xlsx", ".pdf"], "instructions": "לקוחות מרכזיים, ספקים, רגולטורים"},
    {"id": "crisis_procedures", "description": "נוהלי ניהול משברים", "required": true, "folder_name": "Crisis", "file_types": [".pdf"], "instructions": "תכניות חירום, תקשורת משבר"}
  ]
}', NULL, 'Production', true, 'active', 'system'),

(uuid_generate_v4(), 'Quality Control Technician', ARRAY['PRD005'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "testing_equipment", "type": "textarea", "label": "ציוד בדיקה שבאחריות", "required": true},
      {"name": "shift_schedule", "type": "select", "label": "משמרת", "required": true, "options": ["בוקר", "ערב", "לילה"]},
      {"name": "certification_expiry", "type": "date", "label": "תפוגת הסמכה", "required": true}
    ]
  },
  "tasks": [
    {"id": "test_procedures", "description": "נוהלי בדיקה ובקרת איכות", "required": true, "folder_name": "Test_Procedures", "file_types": [".pdf", ".docx"], "instructions": "נוהלי בדיקה לכל סוגי המוצרים"},
    {"id": "equipment_calibration", "description": "רישומי כיול ציוד", "required": true, "folder_name": "Calibration", "file_types": [".xlsx", ".pdf"], "instructions": "לוח כיולים, תעודות, מעקב"},
    {"id": "defect_analysis", "description": "ניתוח פגמים ואי התאמות", "required": true, "folder_name": "Defects", "file_types": [".xlsx"], "instructions": "דוחות אי התאמה, ניתוח גורמים"},
    {"id": "lab_results", "description": "תוצאות בדיקות מעבדה", "required": false, "folder_name": "Lab_Results", "file_types": [".pdf", ".xlsx"], "instructions": "תוצאות בדיקות חיידקים, כימיות"}
  ]
}', NULL, 'Production', false, 'active', 'system'),

(uuid_generate_v4(), 'Machine Operator Specialist', ARRAY['PRD006'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "machine_types", "type": "textarea", "label": "סוגי מכונות בהתמחות", "required": true},
      {"name": "maintenance_level", "type": "select", "label": "רמת תחזוקה", "required": true, "options": ["בסיסית", "מתקדמת", "מומחה"]},
      {"name": "training_authority", "type": "boolean", "label": "הסמכה להדריך אחרים", "required": false}
    ]
  },
  "tasks": [
    {"id": "machine_manuals", "description": "מדריכי הפעלה מפורטים", "required": true, "folder_name": "Manuals", "file_types": [".pdf"], "instructions": "מדריכים טכניים לכל המכונות"},
    {"id": "troubleshooting_guide", "description": "מדריך פתרון תקלות", "required": true, "folder_name": "Troubleshooting", "file_types": [".pdf", ".docx"], "instructions": "תקלות נפוצות ופתרונות מהירים"},
    {"id": "spare_parts_list", "description": "רשימת חלקי חילוף", "required": true, "folder_name": "Spare_Parts", "file_types": [".xlsx"], "instructions": "רשימה מעודכנת עם מספרי קטלוג"},
    {"id": "performance_logs", "description": "יומני ביצועי מכונות", "required": false, "folder_name": "Performance", "file_types": [".xlsx"], "instructions": "מעקב ביצועים ויעילות"}
  ]
}', NULL, 'Production', false, 'active', 'system'),

(uuid_generate_v4(), 'Production Planning Coordinator', ARRAY['PRD007'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "planning_horizon", "type": "select", "label": "אופק תכנון", "required": true, "options": ["שבועי", "חודשי", "רבעוני"]},
      {"name": "erp_system", "type": "text", "label": "מערכת ERP", "required": true},
      {"name": "forecast_accuracy", "type": "number", "label": "דיוק תחזיות (%)", "required": false}
    ]
  },
  "tasks": [
    {"id": "production_schedules", "description": "לוחות זמנים ייצור", "required": true, "folder_name": "Schedules", "file_types": [".xlsx", ".mpp"], "instructions": "תכנון יבוא שבועי וחודשי"},
    {"id": "demand_forecasts", "description": "תחזיות ביקוש", "required": true, "folder_name": "Forecasts", "file_types": [".xlsx"], "instructions": "תחזיות מכירות וביקוש"},
    {"id": "capacity_planning", "description": "תכנון קיבולת ייצור", "required": true, "folder_name": "Capacity", "file_types": [".xlsx"], "instructions": "ניתוח קיבולת ובקרת עומס"},
    {"id": "supplier_schedules", "description": "לוחות אספקת חומרי גלם", "required": true, "folder_name": "Supply", "file_types": [".xlsx"], "instructions": "תכנון הזמנות וקבלת חומרים"}
  ]
}', NULL, 'Production', false, 'active', 'system'),

(uuid_generate_v4(), 'Lean Manufacturing Specialist', ARRAY['PRD008'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "lean_projects", "type": "number", "label": "מספר פרויקטי Lean פעילים", "required": true},
      {"name": "savings_target", "type": "number", "label": "יעד חיסכון שנתי (USD)", "required": true},
      {"name": "kaizen_events", "type": "number", "label": "אירועי Kaizen השנה", "required": false}
    ]
  },
  "tasks": [
    {"id": "lean_projects", "description": "תיעוד פרויקטי Lean פעילים", "required": true, "folder_name": "Lean_Projects", "file_types": [".xlsx", ".pptx"], "instructions": "סטטוס פרויקטים, ROI, לוחות זמנים"},
    {"id": "process_maps", "description": "מפות תהליכים ו-VSM", "required": true, "folder_name": "Process_Maps", "file_types": [".vsd", ".pdf"], "instructions": "Value Stream Mapping עדכני"},
    {"id": "waste_analysis", "description": "ניתוח בזבוז וזיהוי הזדמנויות", "required": true, "folder_name": "Waste_Analysis", "file_types": [".xlsx", ".pdf"], "instructions": "7 בזבוזים, הזדמנויות שיפור"},
    {"id": "training_materials", "description": "חומרי הדרכה Lean", "required": false, "folder_name": "Training", "file_types": [".pptx", ".pdf"], "instructions": "מצגות, מדריכים, תרגילים"}
  ]
}', NULL, 'Production', false, 'active', 'system'),

-- QUALITY ASSURANCE DEPARTMENT (5 templates)
(uuid_generate_v4(), 'QA Inspector', ARRAY['QUA001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "inspection_areas", "type": "textarea", "label": "אזורי בדיקה באחריות", "required": true},
      {"name": "certifications", "type": "textarea", "label": "הסמכות מקצועיות", "required": true},
      {"name": "shift_coverage", "type": "select", "label": "כיסוי משמרות", "required": true, "options": ["יום", "לילה", "סוף שבוע"]}
    ]
  },
  "tasks": [
    {"id": "inspection_procedures", "description": "نوהלי בדיקה ובקרה", "required": true, "folder_name": "Inspection", "file_types": [".pdf", ".docx"], "instructions": "נוהלי בדיקה לכל שלבי הייצור"},
    {"id": "quality_records", "description": "רישומי איכות ובדיקות", "required": true, "folder_name": "Quality_Records", "file_types": [".xlsx"], "instructions": "יומני בדיקה, תוצאות מדידות"},
    {"id": "non_conformance", "description": "טיפול באי התאמות", "required": true, "folder_name": "Non_Conformance", "file_types": [".xlsx", ".pdf"], "instructions": "דוחות אי התאמה, פעולות תיקון"},
    {"id": "calibration_schedule", "description": "לוח כיול ציוד מדידה", "required": true, "folder_name": "Calibration", "file_types": [".xlsx"], "instructions": "מעקב כיולים וציוד מדידה"}
  ]
}', NULL, 'Quality Assurance', true, 'active', 'system'),

(uuid_generate_v4(), 'Laboratory Technician', ARRAY['QUA002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "lab_equipment", "type": "textarea", "label": "ציוד מעבדה באחריות", "required": true},
      {"name": "test_methods", "type": "textarea", "label": "שיטות בדיקה מוסמכות", "required": true},
      {"name": "accreditation", "type": "text", "label": "הסמכת מעבדה", "required": true}
    ]
  },
  "tasks": [
    {"id": "test_methods", "description": "שיטות בדיקה ותקנים", "required": true, "folder_name": "Test_Methods", "file_types": [".pdf"], "instructions": "שיטות בדיקה מוסמכות ותקנים"},
    {"id": "lab_results", "description": "תוצאות בדיקות ודוחות", "required": true, "folder_name": "Results", "file_types": [".xlsx", ".pdf"], "instructions": "בסיס נתוני בדיקות ודוחות"},
    {"id": "chemicals_inventory", "description": "מלאי כימיקלים וחומרים", "required": true, "folder_name": "Chemicals", "file_types": [".xlsx"], "instructions": "מעקב מלאי, גיליונות בטיחות"},
    {"id": "equipment_maintenance", "description": "תחזוקת ציוד מעבדה", "required": true, "folder_name": "Maintenance", "file_types": [".xlsx", ".pdf"], "instructions": "לוחות תחזוקה ורישומים"},
    {"id": "lab_procedures", "description": "נוהלי מעבדה ובטיחות", "required": false, "folder_name": "Procedures", "file_types": [".pdf"], "instructions": "נוהלי עבודה ובטיחות במעבדה"}
  ]
}', NULL, 'Quality Assurance', false, 'active', 'system'),

(uuid_generate_v4(), 'QA Manager', ARRAY['QUA003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "iso_responsibilities", "type": "textarea", "label": "אחריות תקני ISO", "required": true},
      {"name": "audit_schedule", "type": "date", "label": "ביקורת הבאה", "required": true},
      {"name": "team_size", "type": "number", "label": "גודל צוות QA", "required": true}
    ]
  },
  "tasks": [
    {"id": "quality_manual", "description": "מדריך איכות ונוהלים", "required": true, "folder_name": "Quality_Manual", "file_types": [".pdf"], "instructions": "מדריך איכות ISO 9001 מעודכן"},
    {"id": "audit_reports", "description": "דוחות ביקורת פנימית וחיצונית", "required": true, "folder_name": "Audits", "file_types": [".pdf", ".xlsx"], "instructions": "דוחות ביקורת ומעקב תיקונים"},
    {"id": "supplier_qualification", "description": "הסמכת ספקים ובקרה", "required": true, "folder_name": "Suppliers", "file_types": [".xlsx", ".pdf"], "instructions": "רשימת ספקים מוסמכים, בקרות"},
    {"id": "customer_complaints", "description": "טיפול בתלונות לקוחות", "required": true, "folder_name": "Complaints", "file_types": [".xlsx"], "instructions": "מעקב תלונות ופעולות תיקון"},
    {"id": "quality_metrics", "description": "מדדי איכות ודשבורדים", "required": true, "folder_name": "Metrics", "file_types": [".xlsx", ".pbix"], "instructions": "KPI איכות ודוחות מגמות"}
  ]
}', NULL, 'Quality Assurance', true, 'active', 'system'),

(uuid_generate_v4(), 'Compliance Specialist', ARRAY['QUA004'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "regulatory_areas", "type": "textarea", "label": "תחומי רגולציה", "required": true},
      {"name": "certifications_managed", "type": "textarea", "label": "הסמכות בניהול", "required": true},
      {"name": "renewal_dates", "type": "textarea", "label": "תאריכי חידוש", "required": true}
    ]
  },
  "tasks": [
    {"id": "regulatory_files", "description": "קבצי רגולציה והתאמה", "required": true, "folder_name": "Regulatory", "file_types": [".pdf"], "instructions": "תקנות, הנחיות, התכתבויות"},
    {"id": "certifications", "description": "תעודות הסמכה ורישיונות", "required": true, "folder_name": "Certifications", "file_types": [".pdf"], "instructions": "OEKO-TEX, FDA, CE ועוד"},
    {"id": "compliance_tracking", "description": "מעקב עמידה בתקנות", "required": true, "folder_name": "Tracking", "file_types": [".xlsx"], "instructions": "מעקב דרישות ותאריכי ביקורת"},
    {"id": "training_records", "description": "הדרכות עמידה בתקנות", "required": false, "folder_name": "Training", "file_types": [".xlsx", ".pdf"], "instructions": "רישומי הדרכות רגולטוריות"}
  ]
}', NULL, 'Quality Assurance', false, 'active', 'system'),

(uuid_generate_v4(), 'Quality Systems Coordinator', ARRAY['QUA005'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "systems_managed", "type": "textarea", "label": "מערכות איכות בניהול", "required": true},
      {"name": "document_control", "type": "boolean", "label": "אחריות בקרת מסמכים", "required": true},
      {"name": "training_coordinator", "type": "boolean", "label": "רכז הדרכות איכות", "required": false}
    ]
  },
  "tasks": [
    {"id": "document_control", "description": "מערכת בקרת מסמכים", "required": true, "folder_name": "Document_Control", "file_types": [".xlsx", ".pdf"], "instructions": "רשימת מסמכים בקרה, עדכונים"},
    {"id": "process_procedures", "description": "נוהלי תהליכים מבוקרים", "required": true, "folder_name": "Procedures", "file_types": [".pdf", ".docx"], "instructions": "נוהלי עבודה מבוקרים"},
    {"id": "training_matrix", "description": "מטריצת הדרכות איכות", "required": true, "folder_name": "Training", "file_types": [".xlsx"], "instructions": "מעקב הדרכות ומיומנויות"},
    {"id": "corrective_actions", "description": "מעקב פעולות מתקנות", "required": true, "folder_name": "CAPA", "file_types": [".xlsx"], "instructions": "CAPA - פעולות תיקון ומניעה"}
  ]
}', NULL, 'Quality Assurance', false, 'active', 'system'),

-- R&D DEPARTMENT (4 templates)
(uuid_generate_v4(), 'Product Development Scientist', ARRAY['RND001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "research_areas", "type": "textarea", "label": "תחומי מחקר", "required": true},
      {"name": "active_projects", "type": "number", "label": "פרויקטים פעילים", "required": true},
      {"name": "patent_involvement", "type": "boolean", "label": "מעורבות בפטנטים", "required": false}
    ]
  },
  "tasks": [
    {"id": "research_projects", "description": "תיעוד פרויקטי מחקר פעילים", "required": true, "folder_name": "Research", "file_types": [".docx", ".pdf"], "instructions": "מטרות, מתודולוגיה, תוצאות"},
    {"id": "lab_notebooks", "description": "יומני מעבדה ונתונים", "required": true, "folder_name": "Lab_Data", "file_types": [".pdf", ".xlsx"], "instructions": "יומני מחקר, נתוני ניסויים"},
    {"id": "formulations", "description": "נוסחאות ומרכיבים", "required": true, "folder_name": "Formulations", "file_types": [".xlsx", ".pdf"], "instructions": "נוסחאות מוצרים, מפרטי מרכיבים"},
    {"id": "test_results", "description": "תוצאות בדיקות ואפיון", "required": true, "folder_name": "Testing", "file_types": [".xlsx", ".pdf"], "instructions": "בדיקות ביצועים, יציבות, בטיחות"},
    {"id": "literature_review", "description": "סקירת ספרות ומקורות", "required": false, "folder_name": "Literature", "file_types": [".pdf"], "instructions": "מאמרים רלוונטיים, דוחות שוק"}
  ]
}', NULL, 'Research & Development', true, 'active', 'system'),

(uuid_generate_v4(), 'R&D Manager', ARRAY['RND002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "rd_budget", "type": "number", "label": "תקציב מחקר ופיתוח", "required": true},
      {"name": "patent_portfolio", "type": "number", "label": "מספר פטנטים פעילים", "required": true},
      {"name": "innovation_pipeline", "type": "textarea", "label": "פרויקטים בפיתוח", "required": true}
    ]
  },
  "tasks": [
    {"id": "innovation_strategy", "description": "אסטרטגיית חדשנות ופיתוח", "required": true, "folder_name": "Strategy", "file_types": [".pptx", ".pdf"], "instructions": "כיווני פיתוח, יעדים, השקעות"},
    {"id": "project_portfolio", "description": "תיק פרויקטי מחקר ופיתוח", "required": true, "folder_name": "Projects", "file_types": [".xlsx", ".mpp"], "instructions": "סטטוס פרויקטים, תקציבים, לוחות זמנים"},
    {"id": "ip_management", "description": "ניהול קניין רוחני", "required": true, "folder_name": "IP", "file_types": [".pdf", ".xlsx"], "instructions": "פטנטים, סימני מסחר, הסכמי סודיות"},
    {"id": "external_collaborations", "description": "שיתופי פעולה חיצוניים", "required": true, "folder_name": "Collaborations", "file_types": [".pdf"], "instructions": "אוניברסיטאות, מכוני מחקר, ספקים"},
    {"id": "budget_tracking", "description": "מעקב תקציב ו-ROI", "required": true, "folder_name": "Budget", "file_types": [".xlsx"], "instructions": "מעקב הוצאות, החזר השקעה"},
    {"id": "regulatory_science", "description": "תמיכה רגולטורית למוצרים", "required": false, "folder_name": "Regulatory", "file_types": [".pdf"], "instructions": "תיקי רגולטוריים, בדיקות נדרשות"}
  ]
}', NULL, 'Research & Development', true, 'active', 'system'),

(uuid_generate_v4(), 'Formulation Specialist', ARRAY['RND003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "specialty_areas", "type": "textarea", "label": "תחומי התמחות", "required": true},
      {"name": "formulation_database", "type": "text", "label": "מערכת ניהול נוסחאות", "required": true},
      {"name": "regulatory_knowledge", "type": "textarea", "label": "ידע רגולטורי", "required": true}
    ]
  },
  "tasks": [
    {"id": "master_formulations", "description": "נוסחאות מאסטר מעודכנות", "required": true, "folder_name": "Formulations", "file_types": [".xlsx"], "instructions": "נוסחאות ייצור עדכניות"},
    {"id": "ingredient_database", "description": "מאגר מרכיבים ופרטים", "required": true, "folder_name": "Ingredients", "file_types": [".xlsx", ".pdf"], "instructions": "מרכיבים, ספקים, מפרטים טכניים"},
    {"id": "stability_data", "description": "נתוני יציבות ותוקף", "required": true, "folder_name": "Stability", "file_types": [".xlsx"], "instructions": "בדיקות יציבות, תוקף מוצרים"},
    {"id": "cost_analysis", "description": "ניתוח עלויות נוסחאות", "required": true, "folder_name": "Costing", "file_types": [".xlsx"], "instructions": "עלויות מרכיבים, מחירונים"},
    {"id": "scale_up_procedures", "description": "נוהלי הגדלת קנה מידה", "required": false, "folder_name": "Scale_Up", "file_types": [".pdf"], "instructions": "מעבר ממעבדה לייצור"}
  ]
}', NULL, 'Research & Development', false, 'active', 'system'),

(uuid_generate_v4(), 'Innovation Director', ARRAY['RND004'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "innovation_budget", "type": "number", "label": "תקציב חדשנות (USD)", "required": true},
      {"name": "market_focus", "type": "textarea", "label": "שווקים יעד לחדשנות", "required": true},
      {"name": "external_partnerships", "type": "number", "label": "שותפויות חיצוניות", "required": false}
    ]
  },
  "tasks": [
    {"id": "innovation_roadmap", "description": "מפת דרכים לחדשנות", "required": true, "folder_name": "Roadmap", "file_types": [".pptx", ".pdf"], "instructions": "כיווני חדשנות 3-5 שנים"},
    {"id": "market_intelligence", "description": "מחקר שוק ומגמות", "required": true, "folder_name": "Market_Intel", "file_types": [".pdf", ".pptx"], "instructions": "דוחות שוק, ניתוח מתחרים"},
    {"id": "breakthrough_projects", "description": "פרויקטי פריצת דרך", "required": true, "folder_name": "Breakthrough", "file_types": [".pptx", ".xlsx"], "instructions": "פרויקטים חדשניים, פוטנציאל עסקי"},
    {"id": "innovation_metrics", "description": "מדדי חדשנות ו-KPI", "required": true, "folder_name": "Metrics", "file_types": [".xlsx"], "instructions": "מדדי הצלחה, מעקב יעדים"},
    {"id": "startup_collaboration", "description": "שיתופי פעולה עם סטארטאפים", "required": false, "folder_name": "Startups", "file_types": [".pdf"], "instructions": "הסכמים, פרויקטים משותפים"},
    {"id": "technology_scouting", "description": "סריקת טכנולוגיות חדשות", "required": false, "folder_name": "Tech_Scout", "file_types": [".pdf"], "instructions": "טכנולוגיות מתפתחות, הערכות"}
  ]
}', NULL, 'Research & Development', true, 'active', 'system'),

-- ENGINEERING DEPARTMENT (4 templates)
(uuid_generate_v4(), 'Maintenance Engineer', ARRAY['ENG001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "equipment_responsibility", "type": "textarea", "label": "ציוד באחריות", "required": true},
      {"name": "maintenance_system", "type": "text", "label": "מערכת ניהול תחזוקה", "required": true},
      {"name": "emergency_response", "type": "boolean", "label": "כוננות חירום", "required": true}
    ]
  },
  "tasks": [
    {"id": "maintenance_schedules", "description": "לוחות תחזוקה מונעת", "required": true, "folder_name": "Maintenance", "file_types": [".xlsx"], "instructions": "תחזוקה יומית, שבועית, חודשית"},
    {"id": "equipment_manuals", "description": "מדריכי תחזוקת ציוד", "required": true, "folder_name": "Manuals", "file_types": [".pdf"], "instructions": "מדריכי יצרן ונוהלי תחזוקה"},
    {"id": "spare_parts_inventory", "description": "מלאי חלקי חילוף", "required": true, "folder_name": "Spare_Parts", "file_types": [".xlsx"], "instructions": "מלאי מינימום, זמני אספקה"},
    {"id": "breakdown_analysis", "description": "ניתוח תקלות ושיפורים", "required": true, "folder_name": "Breakdowns", "file_types": [".xlsx", ".pdf"], "instructions": "רישום תקלות, ניתוח גורמים"},
    {"id": "safety_procedures", "description": "נוהלי בטיחות תחזוקה", "required": true, "folder_name": "Safety", "file_types": [".pdf"], "instructions": "נוהלי עבודה בטוחה, LOTO"}
  ]
}', NULL, 'Engineering', true, 'active', 'system'),

(uuid_generate_v4(), 'Process Engineer', ARRAY['ENG002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "process_ownership", "type": "textarea", "label": "תהליכים באחריות", "required": true},
      {"name": "improvement_projects", "type": "number", "label": "פרויקטי שיפור פעילים", "required": true},
      {"name": "simulation_tools", "type": "text", "label": "כלי סימולציה", "required": false}
    ]
  },
  "tasks": [
    {"id": "process_flowcharts", "description": "תרשימי זרימה מעודכנים", "required": true, "folder_name": "Process_Maps", "file_types": [".vsd", ".pdf"], "instructions": "PFD, P&ID, תרשימי זרימה"},
    {"id": "operating_procedures", "description": "נוהלי הפעלה מפורטים", "required": true, "folder_name": "Procedures", "file_types": [".pdf", ".docx"], "instructions": "SOP מעודכנים לכל התהליכים"},
    {"id": "process_data", "description": "נתוני תהליך והיסטוריה", "required": true, "folder_name": "Process_Data", "file_types": [".xlsx"], "instructions": "פרמטרי תהליך, היסטוריית ביצועים"},
    {"id": "improvement_projects", "description": "פרויקטי שיפור תהליכים", "required": true, "folder_name": "Improvements", "file_types": [".xlsx", ".pptx"], "instructions": "פרויקטים פעילים, ROI, סטטוס"},
    {"id": "safety_analysis", "description": "ניתוחי בטיחות תהליכים", "required": true, "folder_name": "Safety", "file_types": [".pdf"], "instructions": "HAZOP, ניתוחי סיכונים"}
  ]
}', NULL, 'Engineering', false, 'active', 'system'),

(uuid_generate_v4(), 'Engineering Manager', ARRAY['ENG003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "capex_budget", "type": "number", "label": "תקציב השקעות (USD)", "required": true},
      {"name": "team_structure", "type": "textarea", "label": "מבנה צוות הנדסה", "required": true},
      {"name": "major_projects", "type": "textarea", "label": "פרויקטים מרכזיים", "required": true}
    ]
  },
  "tasks": [
    {"id": "project_portfolio", "description": "תיק פרויקטים הנדסיים", "required": true, "folder_name": "Projects", "file_types": [".xlsx", ".mpp"], "instructions": "פרויקטים פעילים, תקציבים, לוחות זמנים"},
    {"id": "capex_planning", "description": "תכנון השקעות הון", "required": true, "folder_name": "CAPEX", "file_types": [".xlsx", ".pptx"], "instructions": "תוכנית השקעות, הצדקות עסקיות"},
    {"id": "engineering_standards", "description": "תקנים הנדסיים", "required": true, "folder_name": "Standards", "file_types": [".pdf"], "instructions": "תקני עיצוב, בנייה, בטיחות"},
    {"id": "vendor_management", "description": "ניהול קבלנים וספקים", "required": true, "folder_name": "Vendors", "file_types": [".xlsx", ".pdf"], "instructions": "רשימת ספקים מוסמכים, חוזים"},
    {"id": "technical_reports", "description": "דוחות טכניים ומחקרים", "required": true, "folder_name": "Reports", "file_types": [".pdf", ".docx"], "instructions": "דוחות טכניים, feasibility studies"},
    {"id": "team_development", "description": "פיתוח צוות והדרכות", "required": false, "folder_name": "Development", "file_types": [".xlsx"], "instructions": "תוכניות פיתוח, הדרכות טכניות"}
  ]
}', NULL, 'Engineering', true, 'active', 'system'),

(uuid_generate_v4(), 'Automation Specialist', ARRAY['ENG004'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "automation_systems", "type": "textarea", "label": "מערכות אוטומציה", "required": true},
      {"name": "programming_languages", "type": "textarea", "label": "שפות תכנות", "required": true},
      {"name": "scada_systems", "type": "text", "label": "מערכות SCADA", "required": true}
    ]
  },
  "tasks": [
    {"id": "plc_programs", "description": "תוכנות PLC ותיעוד", "required": true, "folder_name": "PLC", "file_types": [".zip", ".pdf"], "instructions": "קבצי תוכנה, תיעוד logic"},
    {"id": "hmi_screens", "description": "מסכי HMI ותפעול", "required": true, "folder_name": "HMI", "file_types": [".zip", ".pdf"], "instructions": "מסכי תפעול, מדריכי משתמש"},
    {"id": "network_diagrams", "description": "דיאגרמות רשת ותקשורת", "required": true, "folder_name": "Networks", "file_types": [".vsd", ".pdf"], "instructions": "ארכיטקטורת רשת, פרוטוקולים"},
    {"id": "calibration_procedures", "description": "נוהלי כיול מכשירים", "required": true, "folder_name": "Calibration", "file_types": [".pdf"], "instructions": "כיול חיישנים ומכשירי מדידה"},
    {"id": "backup_procedures", "description": "נוהלי גיבוי והחזרה", "required": true, "folder_name": "Backup", "file_types": [".pdf"], "instructions": "גיבוי תוכנות, החזרת מערכות"}
  ]
}', NULL, 'Engineering', false, 'active', 'system'),

-- SUPPLY CHAIN DEPARTMENT (4 templates)
(uuid_generate_v4(), 'Supply Chain Analyst', ARRAY['SCM001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "analysis_tools", "type": "text", "label": "כלי ניתוח", "required": true},
      {"name": "data_sources", "type": "textarea", "label": "מקורות נתונים", "required": true},
      {"name": "reporting_frequency", "type": "select", "label": "תדירות דיווח", "required": true, "options": ["יומי", "שבועי", "חודשי"]}
    ]
  },
  "tasks": [
    {"id": "demand_analysis", "description": "ניתוח ביקוש ותחזיות", "required": true, "folder_name": "Demand", "file_types": [".xlsx"], "instructions": "מודלי תחזיות, ניתוח מגמות"},
    {"id": "inventory_reports", "description": "דוחות מלאי וניתוחים", "required": true, "folder_name": "Inventory", "file_types": [".xlsx", ".pbix"], "instructions": "רמות מלאי, איטיות, חוסרים"},
    {"id": "supplier_performance", "description": "ניתוח ביצועי ספקים", "required": true, "folder_name": "Suppliers", "file_types": [".xlsx"], "instructions": "KPI ספקים, איכות, זמני אספקה"},
    {"id": "cost_analysis", "description": "ניתוחי עלות ותחרותיות", "required": true, "folder_name": "Costs", "file_types": [".xlsx"], "instructions": "ניתוח עלויות, השוואת ספקים"},
    {"id": "logistics_optimization", "description": "אופטימיזציית לוגיסטיקה", "required": false, "folder_name": "Logistics", "file_types": [".xlsx", ".pdf"], "instructions": "מסלולי משלוח, עלויות הובלה"}
  ]
}', NULL, 'Supply Chain', true, 'active', 'system'),

(uuid_generate_v4(), 'Procurement Manager', ARRAY['SCM002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "spend_responsibility", "type": "number", "label": "סמכות רכש (USD)", "required": true},
      {"name": "supplier_categories", "type": "textarea", "label": "קטגוריות ספקים", "required": true},
      {"name": "contract_management", "type": "boolean", "label": "ניהול חוזים", "required": true}
    ]
  },
  "tasks": [
    {"id": "supplier_contracts", "description": "חוזי ספקים פעילים", "required": true, "folder_name": "Contracts", "file_types": [".pdf"], "instructions": "חוזים, תנאים, תאריכי חידוש"},
    {"id": "vendor_database", "description": "מאגר ספקים מאושרים", "required": true, "folder_name": "Vendors", "file_types": [".xlsx"], "instructions": "פרטי ספקים, הסמכות, ביצועים"},
    {"id": "price_comparisons", "description": "השוואות מחירים", "required": true, "folder_name": "Pricing", "file_types": [".xlsx"], "instructions": "מחירונים, הצעות מחיר, ניתוחים"},
    {"id": "purchase_orders", "description": "הזמנות רכש פתוחות", "required": true, "folder_name": "POs", "file_types": [".xlsx"], "instructions": "הזמנות פתוחות, מעקב אספקה"},
    {"id": "sourcing_strategy", "description": "אסטרטגיית סורסינג", "required": true, "folder_name": "Strategy", "file_types": [".pptx", ".pdf"], "instructions": "אסטרטגיות רכש, יעדי חיסכון"},
    {"id": "risk_management", "description": "ניהול סיכוני ספקים", "required": false, "folder_name": "Risk", "file_types": [".xlsx", ".pdf"], "instructions": "מיפוי סיכונים, תוכניות חירום"}
  ]
}', NULL, 'Supply Chain', true, 'active', 'system'),

(uuid_generate_v4(), 'Logistics Coordinator', ARRAY['SCM003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "shipping_modes", "type": "textarea", "label": "אמצעי משלוח", "required": true},
      {"name": "warehouse_locations", "type": "textarea", "label": "מיקומי מחסנים", "required": true},
      {"name": "carriers_managed", "type": "textarea", "label": "ספקי הובלה", "required": true}
    ]
  },
  "tasks": [
    {"id": "shipping_schedules", "description": "לוחות משלוחים", "required": true, "folder_name": "Shipping", "file_types": [".xlsx"], "instructions": "לוחות משלוח יומיים ושבועיים"},
    {"id": "carrier_contracts", "description": "חוזי ספקי הובלה", "required": true, "folder_name": "Carriers", "file_types": [".pdf"], "instructions": "חוזים, תעריפים, תנאי שירות"},
    {"id": "warehouse_operations", "description": "נוהלי מחסן ותפעול", "required": true, "folder_name": "Warehouse", "file_types": [".pdf", ".docx"], "instructions": "נוהלי קבלה, איחסון, שליחה"},
    {"id": "customs_documentation", "description": "מסמכי מכס ויבוא/יצוא", "required": true, "folder_name": "Customs", "file_types": [".pdf", ".xlsx"], "instructions": "מסמכי מכס, רישיונות יבוא"},
    {"id": "logistics_kpi", "description": "מדדי ביצוע לוגיסטיים", "required": false, "folder_name": "KPI", "file_types": [".xlsx"], "instructions": "זמני משלוח, עלויות, דיוק"}
  ]
}', NULL, 'Supply Chain', false, 'active', 'system'),

(uuid_generate_v4(), 'Inventory Planning Manager', ARRAY['SCM004'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "inventory_value", "type": "number", "label": "ערך מלאי מנוהל (USD)", "required": true},
      {"name": "planning_system", "type": "text", "label": "מערכת תכנון", "required": true},
      {"name": "abc_analysis", "type": "boolean", "label": "ניהול ABC", "required": true}
    ]
  },
  "tasks": [
    {"id": "inventory_policies", "description": "מדיניות מלאי ופרמטרים", "required": true, "folder_name": "Policies", "file_types": [".xlsx", ".pdf"], "instructions": "רמות min/max, safety stock"},
    {"id": "demand_planning", "description": "תכנון ביקוש ותחזיות", "required": true, "folder_name": "Demand_Plan", "file_types": [".xlsx"], "instructions": "תחזיות ביקוש, עונתיות"},
    {"id": "replenishment_plans", "description": "תוכניות חידוש מלאי", "required": true, "folder_name": "Replenishment", "file_types": [".xlsx"], "instructions": "תוכניות רכש, זמני הזמנה"},
    {"id": "slow_moving_analysis", "description": "ניתוח פריטים איטיים", "required": true, "folder_name": "Slow_Moving", "file_types": [".xlsx"], "instructions": "זיהוי איטיות, תוכניות סילוק"},
    {"id": "inventory_optimization", "description": "אופטימיזציית מלאי", "required": true, "folder_name": "Optimization", "file_types": [".xlsx"], "instructions": "מודלי אופטימיזציה, סימולציות"},
    {"id": "cycle_counting", "description": "ספירות מחזוריות", "required": false, "folder_name": "Cycle_Count", "file_types": [".xlsx"], "instructions": "תוכניות ספירה, דיוק מלאי"}
  ]
}', NULL, 'Supply Chain', true, 'active', 'system'),

-- HR DEPARTMENT (3 templates)
(uuid_generate_v4(), 'HR Generalist', ARRAY['HR001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "employee_count", "type": "number", "label": "מספר עובדים מנוהלים", "required": true},
      {"name": "hr_systems", "type": "text", "label": "מערכות HR", "required": true},
      {"name": "compliance_areas", "type": "textarea", "label": "תחומי קומפליאנס", "required": true}
    ]
  },
  "tasks": [
    {"id": "employee_records", "description": "תיקי עובדים ומסמכים", "required": true, "folder_name": "Employee_Records", "file_types": [".pdf", ".xlsx"], "instructions": "תיקי אישיים, חוזים, הערכות"},
    {"id": "hr_policies", "description": "מדיניות HR ונוהלים", "required": true, "folder_name": "Policies", "file_types": [".pdf"], "instructions": "מדיניות חברה, נוהלי עבודה"},
    {"id": "recruitment_process", "description": "תהליכי גיוס וקליטה", "required": true, "folder_name": "Recruitment", "file_types": [".docx", ".xlsx"], "instructions": "תהליכי גיוס, job descriptions"},
    {"id": "training_records", "description": "רישומי הדרכות והכשרות", "required": true, "folder_name": "Training", "file_types": [".xlsx"], "instructions": "מעקב הדרכות, תוכניות פיתוח"},
    {"id": "compliance_documentation", "description": "מסמכי קומפליאנס", "required": true, "folder_name": "Compliance", "file_types": [".pdf"], "instructions": "דיני עבודה, ביטוח, בטיחות"}
  ]
}', NULL, 'Human Resources', true, 'active', 'system'),

(uuid_generate_v4(), 'Talent Acquisition Specialist', ARRAY['HR002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "recruitment_channels", "type": "textarea", "label": "ערוצי גיוס", "required": true},
      {"name": "positions_recruited", "type": "textarea", "label": "תפקידים מגויסים", "required": true},
      {"name": "hiring_volume", "type": "number", "label": "נפח גיוס שנתי", "required": true}
    ]
  },
  "tasks": [
    {"id": "job_descriptions", "description": "תיאורי תפקידים מעודכנים", "required": true, "folder_name": "Job_Descriptions", "file_types": [".docx"], "instructions": "JD מעודכנים לכל התפקידים"},
    {"id": "candidate_database", "description": "מאגר מועמדים", "required": true, "folder_name": "Candidates", "file_types": [".xlsx"], "instructions": "CV, מעקב ראיונות, סטטוס"},
    {"id": "interview_guides", "description": "מדריכי ראיונות", "required": true, "folder_name": "Interviews", "file_types": [".docx"], "instructions": "שאלות, הערכה, נוהלים"},
    {"id": "recruitment_metrics", "description": "מדדי גיוס וביצועים", "required": true, "folder_name": "Metrics", "file_types": [".xlsx"], "instructions": "זמני גיוס, עלויות, איכות"},
    {"id": "vendor_relationships", "description": "יחסי ספקי גיוס", "required": false, "folder_name": "Vendors", "file_types": [".pdf"], "instructions": "חברות השמה, אתרי דרושים"}
  ]
}', NULL, 'Human Resources', false, 'active', 'system'),

(uuid_generate_v4(), 'HR Manager', ARRAY['HR003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "hr_budget", "type": "number", "label": "תקציב HR (USD)", "required": true},
      {"name": "strategic_initiatives", "type": "textarea", "label": "יוזמות אסטרטגיות", "required": true},
      {"name": "employee_satisfaction", "type": "number", "label": "שביעות רצון עובדים (%)", "required": false}
    ]
  },
  "tasks": [
    {"id": "hr_strategy", "description": "אסטרטגיית משאבי אנוש", "required": true, "folder_name": "Strategy", "file_types": [".pptx", ".pdf"], "instructions": "אסטרטגיה, יעדים, תוכניות"},
    {"id": "compensation_benefits", "description": "מדיניות שכר והטבות", "required": true, "folder_name": "Compensation", "file_types": [".xlsx", ".pdf"], "instructions": "סולמות שכר, חבילות הטבות"},
    {"id": "performance_management", "description": "מערכת ניהול ביצועים", "required": true, "folder_name": "Performance", "file_types": [".xlsx", ".pdf"], "instructions": "תהליכי הערכה, יעדים"},
    {"id": "employee_relations", "description": "יחסי עובדים וארגון", "required": true, "folder_name": "Relations", "file_types": [".pdf"], "instructions": "יחסי עבודה, ועדי עובדים"},
    {"id": "hr_analytics", "description": "אנליטיקת HR ומדדים", "required": true, "folder_name": "Analytics", "file_types": [".xlsx", ".pbix"], "instructions": "KPI, dashboards, ניתוחים"},
    {"id": "succession_planning", "description": "תכנון ירושה ופיתוח", "required": false, "folder_name": "Succession", "file_types": [".xlsx"], "instructions": "מפות ירושה, תוכניות פיתוח"}
  ]
}', NULL, 'Human Resources', true, 'active', 'system'),

-- FINANCE DEPARTMENT (3 templates)
(uuid_generate_v4(), 'Financial Analyst', ARRAY['FIN001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "analysis_areas", "type": "textarea", "label": "תחומי ניתוח", "required": true},
      {"name": "reporting_tools", "type": "text", "label": "כלי דיווח", "required": true},
      {"name": "budget_responsibility", "type": "number", "label": "אחריות תקציבית (USD)", "required": false}
    ]
  },
  "tasks": [
    {"id": "financial_models", "description": "מודלים פיננסיים", "required": true, "folder_name": "Models", "file_types": [".xlsx"], "instructions": "מודלי תחזיות, הערכות שווי"},
    {"id": "budget_analysis", "description": "ניתוחי תקציב ושונות", "required": true, "folder_name": "Budget", "file_types": [".xlsx"], "instructions": "מעקב תקציב, ניתוח שונות"},
    {"id": "management_reports", "description": "דוחות להנהלה", "required": true, "folder_name": "Reports", "file_types": [".xlsx", ".pptx"], "instructions": "דוחות חודשיים, מצגות"},
    {"id": "cost_analysis", "description": "ניתוחי עלות ורווחיות", "required": true, "folder_name": "Costing", "file_types": [".xlsx"], "instructions": "עלויות מוצר, ניתוח רווחיות"},
    {"id": "kpi_tracking", "description": "מעקב מדדי ביצועים", "required": false, "folder_name": "KPI", "file_types": [".xlsx"], "instructions": "KPI פיננסיים, דשבורדים"}
  ]
}', NULL, 'Finance', true, 'active', 'system'),

(uuid_generate_v4(), 'Controller', ARRAY['FIN002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "accounting_standards", "type": "select", "label": "תקני חשבונאות", "required": true, "options": ["GAAP", "IFRS", "Local GAAP"]},
      {"name": "audit_responsibilities", "type": "textarea", "label": "אחריות ביקורת", "required": true},
      {"name": "sox_compliance", "type": "boolean", "label": "SOX Compliance", "required": false}
    ]
  },
  "tasks": [
    {"id": "financial_statements", "description": "דוחות כספיים", "required": true, "folder_name": "Statements", "file_types": [".xlsx", ".pdf"], "instructions": "דוחות חודשיים ורבעוניים"},
    {"id": "general_ledger", "description": "פנקס חשבונות ראשי", "required": true, "folder_name": "GL", "file_types": [".xlsx"], "instructions": "יומנים, חשבונות, מאזנים"},
    {"id": "internal_controls", "description": "בקרות פנימיות", "required": true, "folder_name": "Controls", "file_types": [".pdf", ".xlsx"], "instructions": "מטריצת בקרות, תיעוד נוהלים"},
    {"id": "audit_files", "description": "קבצי ביקורת", "required": true, "folder_name": "Audit", "file_types": [".pdf", ".xlsx"], "instructions": "מסמכי ביקורת, התכתבויות"},
    {"id": "tax_compliance", "description": "קבצי מסים והתאמות", "required": true, "folder_name": "Tax", "file_types": [".xlsx", ".pdf"], "instructions": "דוחות מס, התכתבויות"},
    {"id": "month_end_procedures", "description": "נוהלי סגירת חודש", "required": false, "folder_name": "Month_End", "file_types": [".docx"], "instructions": "צ׳קליסט סגירה, לוחות זמנים"}
  ]
}', NULL, 'Finance', true, 'active', 'system'),

(uuid_generate_v4(), 'Finance Manager', ARRAY['FIN003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "p_and_l_responsibility", "type": "number", "label": "אחריות P&L (USD)", "required": true},
      {"name": "banking_relationships", "type": "textarea", "label": "קשרי בנקאות", "required": true},
      {"name": "treasury_management", "type": "boolean", "label": "ניהול אוצר", "required": true}
    ]
  },
  "tasks": [
    {"id": "financial_planning", "description": "תכנון פיננסי ותקציבים", "required": true, "folder_name": "Planning", "file_types": [".xlsx", ".pptx"], "instructions": "תקציב שנתי, תחזיות, תכניות"},
    {"id": "cash_management", "description": "ניהול תזרים מזומנים", "required": true, "folder_name": "Cash", "file_types": [".xlsx"], "instructions": "תחזיות תזרים, ניהול נזילות"},
    {"id": "investment_analysis", "description": "ניתוח השקעות", "required": true, "folder_name": "Investments", "file_types": [".xlsx", ".pdf"], "instructions": "הערכת פרויקטים, ROI, NPV"},
    {"id": "banking_agreements", "description": "הסכמי בנקאות ואשראי", "required": true, "folder_name": "Banking", "file_types": [".pdf"], "instructions": "הסכמי אשראי, ערבויות"},
    {"id": "risk_management", "description": "ניהול סיכונים פיננסיים", "required": true, "folder_name": "Risk", "file_types": [".xlsx", ".pdf"], "instructions": "מיפוי סיכונים, ביטוחים"},
    {"id": "board_reporting", "description": "דיווח לדירקטוריון", "required": false, "folder_name": "Board", "file_types": [".pptx"], "instructions": "מצגות דירקטוריון, דוחות"}
  ]
}', NULL, 'Finance', true, 'active', 'system'),

-- SALES & MARKETING DEPARTMENT (3 templates)
(uuid_generate_v4(), 'Sales Representative', ARRAY['SAL001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "territory", "type": "text", "label": "אזור מכירות", "required": true},
      {"name": "sales_target", "type": "number", "label": "יעד מכירות (USD)", "required": true},
      {"name": "customer_count", "type": "number", "label": "מספר לקוחות", "required": true}
    ]
  },
  "tasks": [
    {"id": "customer_database", "description": "מאגר לקוחות ואנשי קשר", "required": true, "folder_name": "Customers", "file_types": [".xlsx"], "instructions": "פרטי לקוחות, היסטוריית רכש"},
    {"id": "sales_pipeline", "description": "צינור מכירות והצעות", "required": true, "folder_name": "Pipeline", "file_types": [".xlsx"], "instructions": "הזדמנויות, סטטוס, הסתברות"},
    {"id": "price_lists", "description": "מחירונים והנחות", "required": true, "folder_name": "Pricing", "file_types": [".xlsx"], "instructions": "מחירים, הנחות, מבצעים"},
    {"id": "sales_reports", "description": "דוחות מכירות", "required": true, "folder_name": "Reports", "file_types": [".xlsx"], "instructions": "ביצועים, מגמות, ניתוחים"},
    {"id": "competitive_intelligence", "description": "מידע תחרותי", "required": false, "folder_name": "Competition", "file_types": [".pdf"], "instructions": "מחירי מתחרים, מוצרים חדשים"}
  ]
}', NULL, 'Sales & Marketing', true, 'active', 'system'),

(uuid_generate_v4(), 'Marketing Manager', ARRAY['SAL002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "marketing_budget", "type": "number", "label": "תקציב שיווק (USD)", "required": true},
      {"name": "brand_responsibility", "type": "textarea", "label": "מותגים באחריות", "required": true},
      {"name": "marketing_channels", "type": "textarea", "label": "ערוצי שיווק", "required": true}
    ]
  },
  "tasks": [
    {"id": "marketing_strategy", "description": "אסטרטגיית שיווק", "required": true, "folder_name": "Strategy", "file_types": [".pptx", ".pdf"], "instructions": "תכנית שיווק שנתית, יעדים"},
    {"id": "brand_guidelines", "description": "קווי מנחה למותג", "required": true, "folder_name": "Brand", "file_types": [".pdf"], "instructions": "מדריך מותג, לוגו, צבעים"},
    {"id": "campaign_materials", "description": "חומרי קמפיינים", "required": true, "folder_name": "Campaigns", "file_types": [".pptx", ".pdf", ".jpg"], "instructions": "מצגות, עלוני פרסום, באנרים"},
    {"id": "market_research", "description": "מחקרי שוק", "required": true, "folder_name": "Research", "file_types": [".pdf", ".xlsx"], "instructions": "מחקרי שוק, סקרי לקוחות"},
    {"id": "digital_assets", "description": "נכסים דיגיטליים", "required": true, "folder_name": "Digital", "file_types": [".jpg", ".mp4"], "instructions": "תמונות, סרטונים, תוכן רשתות"},
    {"id": "budget_tracking", "description": "מעקב תקציב שיווק", "required": false, "folder_name": "Budget", "file_types": [".xlsx"], "instructions": "הוצאות, ROI, תחזיות"}
  ]
}', NULL, 'Sales & Marketing', true, 'active', 'system'),

(uuid_generate_v4(), 'Key Account Manager', ARRAY['SAL003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "key_accounts", "type": "textarea", "label": "חשבונות מרכזיים", "required": true},
      {"name": "revenue_responsibility", "type": "number", "label": "הכנסות באחריות (USD)", "required": true},
      {"name": "contract_management", "type": "boolean", "label": "ניהול חוזים", "required": true}
    ]
  },
  "tasks": [
    {"id": "account_plans", "description": "תוכניות חשבונות מרכזיים", "required": true, "folder_name": "Account_Plans", "file_types": [".pptx", ".docx"], "instructions": "אסטרטגיית חשבון, יעדים"},
    {"id": "customer_contracts", "description": "חוזי לקוחות", "required": true, "folder_name": "Contracts", "file_types": [".pdf"], "instructions": "חוזים פעילים, תנאים, חידושים"},
    {"id": "relationship_mapping", "description": "מיפוי קשרים בלקוח", "required": true, "folder_name": "Relationships", "file_types": [".xlsx", ".pdf"], "instructions": "אנשי קשר, מפת השפעה"},
    {"id": "business_reviews", "description": "סקירות עסקיות", "required": true, "folder_name": "Reviews", "file_types": [".pptx"], "instructions": "QBR, ביצועים, תוכניות"},
    {"id": "opportunity_pipeline", "description": "צינור הזדמנויות", "required": true, "folder_name": "Opportunities", "file_types": [".xlsx"], "instructions": "הזדמנויות עתידיות, סטטוס"},
    {"id": "escalation_procedures", "description": "נוהלי הסלמה", "required": false, "folder_name": "Escalation", "file_types": [".pdf"], "instructions": "טיפול בבעיות, אנשי קשר"}
  ]
}', NULL, 'Sales & Marketing', false, 'active', 'system'),

-- MAINTENANCE DEPARTMENT (3 templates)
(uuid_generate_v4(), 'Maintenance Technician', ARRAY['MNT001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "technical_specialty", "type": "select", "label": "התמחות טכנית", "required": true, "options": ["חשמל", "מכונות", "PLC", "הידראוליקה"]},
      {"name": "equipment_area", "type": "text", "label": "אזור ציוד באחריות", "required": true},
      {"name": "emergency_response", "type": "boolean", "label": "כוננות חירום", "required": true}
    ]
  },
  "tasks": [
    {"id": "maintenance_procedures", "description": "נוהלי תחזוקה מפורטים", "required": true, "folder_name": "Procedures", "file_types": [".pdf"], "instructions": "נוהלי תחזוקה לכל הציוד"},
    {"id": "work_orders", "description": "פקודות עבודה פתוחות", "required": true, "folder_name": "Work_Orders", "file_types": [".xlsx"], "instructions": "מעקב משימות, סטטוס, עדיפויות"},
    {"id": "spare_parts_list", "description": "רשימת חלקי חילוף", "required": true, "folder_name": "Parts", "file_types": [".xlsx"], "instructions": "מלאי חלקים, מספרי קטלוג"},
    {"id": "safety_procedures", "description": "נוהלי בטיחות תחזוקה", "required": true, "folder_name": "Safety", "file_types": [".pdf"], "instructions": "LOTO, נוהלי עבודה בטוחה"},
    {"id": "equipment_history", "description": "היסטוריית תחזוקת ציוד", "required": false, "folder_name": "History", "file_types": [".xlsx"], "instructions": "רישומי תחזוקה, תקלות"}
  ]
}', NULL, 'Maintenance', true, 'active', 'system'),

(uuid_generate_v4(), 'Facilities Manager', ARRAY['MNT002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "facility_size", "type": "number", "label": "גודל מתקן (מ״ר)", "required": true},
      {"name": "utilities_managed", "type": "textarea", "label": "שירותי תשתית", "required": true},
      {"name": "contractor_management", "type": "boolean", "label": "ניהול קבלנים", "required": true}
    ]
  },
  "tasks": [
    {"id": "facility_plans", "description": "תוכניות מתקן ומפות", "required": true, "folder_name": "Plans", "file_types": [".pdf", ".dwg"], "instructions": "תוכניות בנייה, מפות שירותים"},
    {"id": "utility_contracts", "description": "חוזי שירותי תשתית", "required": true, "folder_name": "Utilities", "file_types": [".pdf"], "instructions": "חשמל, מים, גז, אינטרנט"},
    {"id": "contractor_agreements", "description": "הסכמי קבלנים", "required": true, "folder_name": "Contractors", "file_types": [".pdf"], "instructions": "ניקיון, בטיחות, תחזוקה"},
    {"id": "security_systems", "description": "מערכות אבטחה ובקרה", "required": true, "folder_name": "Security", "file_types": [".pdf"], "instructions": "מצלמות, מעקב, בקרת כניסה"},
    {"id": "maintenance_schedules", "description": "לוחות תחזוקת מבנים", "required": true, "folder_name": "Building_Maintenance", "file_types": [".xlsx"], "instructions": "תחזוקת מבנה, מערכות בנין"},
    {"id": "emergency_procedures", "description": "נוהלי חירום ופינוי", "required": false, "folder_name": "Emergency", "file_types": [".pdf"], "instructions": "תוכניות פינוי, איש קשר חירום"}
  ]
}', NULL, 'Maintenance', true, 'active', 'system'),

(uuid_generate_v4(), 'Maintenance Supervisor', ARRAY['MNT003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "team_size", "type": "number", "label": "גודל צוות תחזוקה", "required": true},
      {"name": "maintenance_budget", "type": "number", "label": "תקציב תחזוקה (USD)", "required": true},
      {"name": "shift_coverage", "type": "select", "label": "כיסוי משמרות", "required": true, "options": ["יום", "24/7", "5 ימים"]}
    ]
  },
  "tasks": [
    {"id": "team_schedules", "description": "לוחות עבודה וכוננויות", "required": true, "folder_name": "Schedules", "file_types": [".xlsx"], "instructions": "משמרות, חופשות, כוננויות"},
    {"id": "preventive_maintenance", "description": "תוכנית תחזוקה מונעת", "required": true, "folder_name": "PM", "file_types": [".xlsx"], "instructions": "לוחות PM, מעקב ביצוע"},
    {"id": "budget_tracking", "description": "מעקב תקציב תחzוקה", "required": true, "folder_name": "Budget", "file_types": [".xlsx"], "instructions": "הוצאות, תחזיות, חריגות"},
    {"id": "kpi_reports", "description": "דוחות KPI תחזוקה", "required": true, "folder_name": "KPI", "file_types": [".xlsx"], "instructions": "זמני תיקון, זמינות ציוד"},
    {"id": "training_matrix", "description": "מטריצת הכשרות צוות", "required": true, "folder_name": "Training", "file_types": [".xlsx"], "instructions": "מיומנויות, הסמכות, הדרכות"},
    {"id": "contractor_oversight", "description": "פיקוח על קבלנים", "required": false, "folder_name": "Oversight", "file_types": [".xlsx"], "instructions": "מעקב עבודות קבלנים, איכות"}
  ]
}', NULL, 'Maintenance', true, 'active', 'system'),

-- ENVIRONMENT & SAFETY DEPARTMENT (3 templates)
(uuid_generate_v4(), 'EHS Specialist', ARRAY['EHS001'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "safety_certifications", "type": "textarea", "label": "הסמכות בטיחות", "required": true},
      {"name": "environmental_permits", "type": "textarea", "label": "רישיונות סביבה", "required": true},
      {"name": "incident_investigations", "type": "boolean", "label": "חקירת תאונות", "required": true}
    ]
  },
  "tasks": [
    {"id": "safety_procedures", "description": "נוהלי בטיחות מעודכנים", "required": true, "folder_name": "Safety", "file_types": [".pdf"], "instructions": "נוהלי עבודה בטוחה, JSA"},
    {"id": "environmental_monitoring", "description": "מעקב סביבתי ובקרה", "required": true, "folder_name": "Environmental", "file_types": [".xlsx", ".pdf"], "instructions": "ניטור פליטות, איכות אוויר"},
    {"id": "incident_reports", "description": "דוחות תקריות ותאונות", "required": true, "folder_name": "Incidents", "file_types": [".pdf"], "instructions": "רישום אירועים, חקירות"},
    {"id": "training_records", "description": "רישומי הדרכות בטיחות", "required": true, "folder_name": "Training", "file_types": [".xlsx"], "instructions": "הדרכות, רענונים, נוכחות"},
    {"id": "audit_checklists", "description": "צ׳קליסטים לביקורת", "required": false, "folder_name": "Audits", "file_types": [".xlsx"], "instructions": "רשימות בדיקה, ביקורות"}
  ]
}', NULL, 'Environmental & Safety', true, 'active', 'system'),

(uuid_generate_v4(), 'Sustainability Manager', ARRAY['EHS002'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "sustainability_goals", "type": "textarea", "label": "יעדי קיימות", "required": true},
      {"name": "certification_standards", "type": "textarea", "label": "תקני הסמכה", "required": true},
      {"name": "carbon_footprint", "type": "number", "label": "טביעת רגל פחמנית", "required": false}
    ]
  },
  "tasks": [
    {"id": "sustainability_strategy", "description": "אסטרטגיית קיימות", "required": true, "folder_name": "Strategy", "file_types": [".pptx", ".pdf"], "instructions": "יעדים, תוכניות, לוחות זמנים"},
    {"id": "environmental_certifications", "description": "הסמכות סביבתיות", "required": true, "folder_name": "Certifications", "file_types": [".pdf"], "instructions": "OEKO-TEX, FSC, ISO 14001"},
    {"id": "waste_management", "description": "ניהול פסולת ומיחזור", "required": true, "folder_name": "Waste", "file_types": [".xlsx"], "instructions": "מעקב פסולת, יעדי מיחזור"},
    {"id": "energy_efficiency", "description": "פרויקטי יעילות אנרגטית", "required": true, "folder_name": "Energy", "file_types": [".xlsx", ".pdf"], "instructions": "פרויקטי חיסכון, מדידות"},
    {"id": "sustainability_reporting", "description": "דוחות קיימות", "required": true, "folder_name": "Reports", "file_types": [".pdf"], "instructions": "דוחות שנתיים, GRI, CDP"},
    {"id": "stakeholder_engagement", "description": "מעורבות בעלי עניין", "required": false, "folder_name": "Stakeholders", "file_types": [".pdf"], "instructions": "דיאלוג, משוב, שותפויות"}
  ]
}', NULL, 'Environmental & Safety', true, 'active', 'system'),

(uuid_generate_v4(), 'Safety Coordinator', ARRAY['EHS003'], '{
  "basic_info": {
    "title": "פרטים בסיסיים",
    "order": 1,
    "fields": [
      {"name": "safety_programs", "type": "textarea", "label": "תוכניות בטיחות", "required": true},
      {"name": "emergency_response_role", "type": "text", "label": "תפקיד במצבי חירום", "required": true},
      {"name": "inspection_frequency", "type": "select", "label": "תדירות בדיקות", "required": true, "options": ["יומי", "שבועי", "חודשי"]}
    ]
  },
  "tasks": [
    {"id": "safety_inspections", "description": "בדיקות בטיחות שוטפות", "required": true, "folder_name": "Inspections", "file_types": [".xlsx"], "instructions": "דוחות בדיקה, ממצאים"},
    {"id": "emergency_procedures", "description": "נוהלי חירום ופינוי", "required": true, "folder_name": "Emergency", "file_types": [".pdf"], "instructions": "תוכניות פינוי, נוהלי חירום"},
    {"id": "ppe_management", "description": "ניהול ציוד מגן אישי", "required": true, "folder_name": "PPE", "file_types": [".xlsx"], "instructions": "מלאי, חלוקה, תחליפים"},
    {"id": "safety_meetings", "description": "פרוטוקולי ועדת בטיחות", "required": true, "folder_name": "Meetings", "file_types": [".docx"], "instructions": "פרוטוקולים, החלטות, מעקב"},
    {"id": "contractor_safety", "description": "בטיחות קבלנים", "required": true, "folder_name": "Contractors", "file_types": [".pdf"], "instructions": "דרישות בטיחות, הרשאות עבודה"},
    {"id": "safety_metrics", "description": "מדדי בטיחות", "required": false, "folder_name": "Metrics", "file_types": [".xlsx"], "instructions": "שיעורי תאונות, LTI, near miss"}
  ]
}', NULL, 'Environmental & Safety', false, 'active', 'system');

-- Update templates to reference job_roles for proper integration
UPDATE templates SET created_at = NOW(), updated_at = NOW();

-- Insert template metrics for all templates
INSERT INTO template_metrics (template_id, usage_count, avg_completion_time_hours, avg_success_rating, completion_rate, feedback_count, recommendation_rate)
SELECT id, 0, NULL, NULL, NULL, 0, NULL FROM templates;

-- Insert some sample template permissions (managers can edit their department templates)
INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'production.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Production';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'qa.manager@albaad.com', 'edit', 'system'  
FROM templates WHERE department = 'Quality Assurance';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'rd.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Research & Development';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'engineering.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Engineering';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'scm.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Supply Chain';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'hr.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Human Resources';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'finance.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Finance';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'sales.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Sales & Marketing';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'maintenance.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Maintenance';

INSERT INTO template_permissions (template_id, user_email, permission_type, granted_by)
SELECT id, 'ehs.manager@albaad.com', 'edit', 'system'
FROM templates WHERE department = 'Environmental & Safety';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_department ON templates(department);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_manager_id ON templates(manager_id);
CREATE INDEX IF NOT EXISTS idx_templates_job_codes ON templates USING GIN(job_codes);

-- Comments
COMMENT ON TABLE templates IS 'Enhanced templates table with manager ownership and department organization';
COMMENT ON COLUMN templates.manager_id IS 'Manager who owns/created this template';
COMMENT ON COLUMN templates.department IS 'Department this template belongs to';
COMMENT ON COLUMN templates.is_department_standard IS 'Whether this is a standard template for the department';
COMMENT ON COLUMN templates.template_version IS 'Version number of the template';
COMMENT ON COLUMN templates.parent_template_id IS 'Reference to parent template for variations';
COMMENT ON COLUMN templates.status IS 'Template status: draft, active, archived, deprecated';