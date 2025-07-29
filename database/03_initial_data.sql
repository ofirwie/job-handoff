-- Initial Data for Flexible Handover System
-- Includes Albaad organization structure and core system data

-- Insert Albaad organization
INSERT INTO organizations (id, name, code, settings) VALUES 
(uuid_generate_v4(), 'Albaad International', 'ALBAAD', '{
    "industry": "wet_wipes_hygiene",
    "founded": 1985,
    "headquarters": "Israel",
    "products": ["wet_wipes", "feminine_hygiene"]
}');

-- Get organization ID for subsequent inserts
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE code = 'ALBAAD';
    
    -- Insert Albaad plants (8 global locations)
    INSERT INTO plants (id, organization_id, name, code, country, location, local_regulations, cultural_settings) VALUES 
    (uuid_generate_v4(), org_id, 'Albaad USA', 'USA01', 'USA', 'United States Manufacturing Facility', 
     '{"fda_compliance": true, "osha_requirements": true}',
     '{"language": "en", "date_format": "MM/DD/YYYY", "currency": "USD"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Poland', 'POL01', 'Poland', 'Polish Production Center',
     '{"eu_regulations": true, "gdpr_compliance": true}',
     '{"language": "pl", "date_format": "DD/MM/YYYY", "currency": "EUR"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Germany', 'GER01', 'Germany', 'German R&D and Manufacturing',
     '{"eu_regulations": true, "gdpr_compliance": true, "din_standards": true}',
     '{"language": "de", "date_format": "DD.MM.YYYY", "currency": "EUR"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Spain', 'ESP01', 'Spain', 'Spanish Production Facility',
     '{"eu_regulations": true, "gdpr_compliance": true}',
     '{"language": "es", "date_format": "DD/MM/YYYY", "currency": "EUR"}'
    ),
    (uuid_generate_v4(), org_id, 'Albaad Israel HQ', 'ISR01', 'Israel', 'Headquarters and R&D Center',
     '{"israeli_standards": true, "kosher_certification": true}',
     '{"language": "he", "date_format": "DD/MM/YYYY", "currency": "ILS"}'
    );
END $$;

-- Insert common departments across plants
DO $$
DECLARE
    plant_record RECORD;
BEGIN
    FOR plant_record IN SELECT id FROM plants LOOP
        INSERT INTO departments (plant_id, name, code) VALUES 
        (plant_record.id, 'Production', 'PROD'),
        (plant_record.id, 'Quality Assurance', 'QA'),
        (plant_record.id, 'Research & Development', 'RD'),
        (plant_record.id, 'Engineering', 'ENG'),
        (plant_record.id, 'Supply Chain', 'SCM'),
        (plant_record.id, 'Human Resources', 'HR'),
        (plant_record.id, 'Finance', 'FIN'),
        (plant_record.id, 'Sales & Marketing', 'SALES'),
        (plant_record.id, 'Maintenance', 'MAINT'),
        (plant_record.id, 'Environmental & Safety', 'EHS');
    END LOOP;
END $$;

-- Insert Core Categories (always present)
INSERT INTO categories (id, name, display_name, description, is_system_default, is_active) VALUES 
(uuid_generate_v4(), 'files_and_documents', 'Files & Documents', 'All files, documents, and digital assets', true, true),
(uuid_generate_v4(), 'processes_and_procedures', 'Processes & Procedures', 'Standard operating procedures and workflows', true, true),
(uuid_generate_v4(), 'contacts_and_relationships', 'Contacts & Relationships', 'Key contacts, stakeholders, and business relationships', true, true),
(uuid_generate_v4(), 'systems_and_access', 'Systems & Access', 'IT systems, software, and access credentials', true, true),
(uuid_generate_v4(), 'knowledge_and_insights', 'Knowledge & Insights', 'Institutional knowledge and experience insights', true, true);

-- Insert Dynamic Categories (context-dependent)
INSERT INTO categories (id, name, display_name, description, is_system_default, industry_specific, is_active) VALUES 
(uuid_generate_v4(), 'regulatory_compliance', 'Regulatory Compliance', 'Regulatory requirements and compliance procedures', false, true, true),
(uuid_generate_v4(), 'sustainability_environment', 'Sustainability & Environment', 'Environmental compliance and sustainability initiatives', false, true, true),
(uuid_generate_v4(), 'innovation_rd', 'Innovation & R&D', 'Research, development, and innovation projects', false, true, true),
(uuid_generate_v4(), 'crisis_management', 'Crisis Management', 'Emergency procedures and crisis response', false, false, true),
(uuid_generate_v4(), 'cultural_adaptation', 'Cultural Adaptation', 'Local culture and international considerations', false, false, true),
(uuid_generate_v4(), 'digital_transformation', 'Digital Transformation', 'IT transformation and digital initiatives', false, false, true),
(uuid_generate_v4(), 'manufacturing_operations', 'Manufacturing Operations', 'Production line operations and manufacturing processes', false, true, true),
(uuid_generate_v4(), 'customer_relations', 'Customer Relations', 'Customer accounts and relationship management', false, false, true);

-- Insert Core Item Types
INSERT INTO item_types (id, name, description, fields_schema, is_system_default) VALUES 
(uuid_generate_v4(), 'document_transfer', 'Document Transfer Item', '{
    "required_fields": ["document_name", "location", "access_method"],
    "optional_fields": ["backup_location", "special_instructions"],
    "field_types": {
        "document_name": "text",
        "location": "text", 
        "access_method": "select",
        "backup_location": "text",
        "special_instructions": "textarea"
    }
}', true),
(uuid_generate_v4(), 'contact_handover', 'Contact Information Transfer', '{
    "required_fields": ["contact_name", "role", "contact_method"],
    "optional_fields": ["relationship_notes", "communication_preferences"],
    "field_types": {
        "contact_name": "text",
        "role": "text",
        "contact_method": "text",
        "relationship_notes": "textarea",
        "communication_preferences": "select"
    }
}', true),
(uuid_generate_v4(), 'system_access', 'System Access Transfer', '{
    "required_fields": ["system_name", "access_level", "login_method"],
    "optional_fields": ["administrator_contact", "special_permissions"],
    "field_types": {
        "system_name": "text",
        "access_level": "select",
        "login_method": "select",
        "administrator_contact": "text",
        "special_permissions": "textarea"
    }
}', true),
(uuid_generate_v4(), 'process_knowledge', 'Process Knowledge Transfer', '{
    "required_fields": ["process_name", "frequency", "key_steps"],
    "optional_fields": ["common_issues", "best_practices", "dependencies"],
    "field_types": {
        "process_name": "text",
        "frequency": "select",
        "key_steps": "textarea",
        "common_issues": "textarea",
        "best_practices": "textarea",
        "dependencies": "textarea"
    }
}', true);

-- Insert Adaptation Rules for different plants and contexts
INSERT INTO adaptation_rules (id, name, rule_type, condition_match, adaptation_logic, priority) VALUES 
(uuid_generate_v4(), 'German Plant GDPR Requirements', 'regulation', '{
    "plant_country": "Germany"
}', '{
    "add_items": [{
        "category": "regulatory_compliance",
        "title": "GDPR Data Protection Procedures",
        "description": "Personal data handling according to German GDPR requirements",
        "priority": 10,
        "mandatory": true
    }]
}', 9),

(uuid_generate_v4(), 'US Plant FDA Compliance', 'regulation', '{
    "plant_country": "USA"
}', '{
    "add_items": [{
        "category": "regulatory_compliance", 
        "title": "FDA Compliance Documentation",
        "description": "US FDA requirements for wet wipes and hygiene products",
        "priority": 9,
        "mandatory": true
    }]
}', 9),

(uuid_generate_v4(), 'Director Level Crisis Management', 'role', '{
    "job_level": "director"
}', '{
    "add_categories": ["crisis_management"],
    "add_items": [{
        "category": "crisis_management",
        "title": "Crisis Communication Protocols", 
        "description": "Emergency response and stakeholder communication procedures",
        "priority": 9,
        "mandatory": true
    }]
}', 8),

(uuid_generate_v4(), 'International Plant Cultural Adaptation', 'culture', '{
    "plant_country": ["Germany", "Poland", "Spain", "USA"]
}', '{
    "add_categories": ["cultural_adaptation"],
    "add_items": [{
        "category": "cultural_adaptation",
        "title": "Local Culture and Communication Norms",
        "description": "Understanding local business culture and communication preferences", 
        "priority": 6,
        "mandatory": false
    }]
}', 5),

(uuid_generate_v4(), 'R&D Department Innovation Focus', 'role', '{
    "department": "Research & Development"
}', '{
    "add_categories": ["innovation_rd"],
    "boost_priority": {
        "category": "innovation_rd",
        "increase": 2
    }
}', 7),

(uuid_generate_v4(), 'Production Department Manufacturing Focus', 'role', '{
    "department": "Production" 
}', '{
    "add_categories": ["manufacturing_operations"],
    "add_items": [{
        "category": "manufacturing_operations",
        "title": "Production Line Handover",
        "description": "Transfer of production line responsibilities and procedures",
        "priority": 10,
        "mandatory": true
    }]
}', 8),

(uuid_generate_v4(), 'Sustainability Role Environmental Focus', 'role', '{
    "job_title_contains": ["sustainability", "environment"]
}', '{
    "add_categories": ["sustainability_environment"],
    "add_items": [{
        "category": "sustainability_environment",
        "title": "Environmental Compliance Tracking",
        "description": "Environmental monitoring systems and compliance reporting",
        "priority": 10,
        "mandatory": true
    }, {
        "category": "sustainability_environment", 
        "title": "OEKO-TEX and Sustainability Certifications",
        "description": "Management of sustainability certifications and standards",
        "priority": 9,
        "mandatory": true
    }]
}', 9);

-- Insert a basic base template for common roles
INSERT INTO base_templates (id, name, job_title, level, department, template_data, confidence_score, source) VALUES 
(uuid_generate_v4(), 'General Manager Template', 'Manager', 'manager', 'Any', '{
    "categories": ["files_and_documents", "processes_and_procedures", "contacts_and_relationships", "systems_and_access", "knowledge_and_insights"],
    "items": [
        {
            "category": "files_and_documents",
            "title": "Department Files and Records",
            "description": "All departmental documentation and records",
            "priority": 8,
            "estimated_minutes": 60,
            "mandatory": true
        },
        {
            "category": "contacts_and_relationships", 
            "title": "Key Stakeholder Relationships",
            "description": "Important internal and external contacts",
            "priority": 9,
            "estimated_minutes": 45,
            "mandatory": true
        },
        {
            "category": "processes_and_procedures",
            "title": "Management Processes",
            "description": "Key management processes and decision-making procedures", 
            "priority": 8,
            "estimated_minutes": 90,
            "mandatory": true
        }
    ]
}', 0.7, 'manual');

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION handle_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for key tables
CREATE TRIGGER audit_handovers 
AFTER INSERT OR UPDATE OR DELETE ON handovers
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER audit_templates
AFTER INSERT OR UPDATE OR DELETE ON templates  
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER audit_template_items
AFTER INSERT OR UPDATE OR DELETE ON template_items
FOR EACH ROW EXECUTE FUNCTION handle_audit_log();