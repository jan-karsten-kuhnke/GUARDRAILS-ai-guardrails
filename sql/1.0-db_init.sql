CREATE schema if not exists ai_guardrails;


CREATE table if not exists ai_guardrails.analysis_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT,
    flagged_text TEXT,
    analysed_entity TEXT,
    criticality TEXT
);


CREATE table if not exists ai_guardrails.anonymize_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_text TEXT,
    anonymized_text TEXT,
    flagged_text TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT,
    analysed_entity TEXT,
    criticality TEXT
);


CREATE table if not exists ai_guardrails.chat_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT,
    text TEXT
);



CREATE TABLE ai_guardrails.organisation (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar(255) NULL,
    email varchar(255) NULL,
    details text NULL,
    openai_key varchar(255) NULL,
    created_at timestamp(6) NULL,
    CONSTRAINT organisation_pkey PRIMARY KEY (id)
);



CREATE TABLE ai_guardrails.custom_rules (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" varchar(255) NULL,
	"type" varchar(255) NULL,
	value varchar(255) NULL,
	created_at timestamp(6) NULL,
	criticality varchar(255) NULL,
	is_active bool NULL,
	CONSTRAINT custom_rules_pkey PRIMARY KEY (id)
);


CREATE TABLE ai_guardrails.predefined_rules (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	"name" varchar(255) NULL,
	provider varchar(255) NULL,
	is_active bool NULL,
	details varchar(255) NULL,
	criticality varchar(255) NULL,
	CONSTRAINT predefined_rules_pkey PRIMARY KEY (id)
);
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'PHONE_NUMBER', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'EMAIL_ADDRESS', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'CREDIT_CARD', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'IBAN_CODE', 'presidio' , true, '', 'Low');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'IP_ADDRESS', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'NRP', 'presidio' , true, '', 'Low');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'MEDICAL_LICENSE', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'US_BANK_NUMBER', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'US_DRIVER_LICENSE', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'US_ITIN', 'presidio' , true, '', 'Medium');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'US_PASSPORT', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'US_SSN', 'presidio' , true, '', 'High');
INSERT INTO ai_guardrails.predefined_rules (id, "name", provider, is_active, details, criticality) VALUES(gen_random_uuid(), 'UK_NHS', 'presidio' , true, '', 'Medium');