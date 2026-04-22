-- =====================================================
-- MIET AFRICA YOUTH SKILLS CENTRE MANAGEMENT PLATFORM
-- Seed Data — Reference & Sample Data
-- Version: 1.0
-- Run AFTER: miet_africa_schema.sql
-- =====================================================

-- Wrap everything in a transaction for safety
BEGIN;

-- =====================================================
-- SECTION 1: SOUTH AFRICAN PROVINCES
-- =====================================================

INSERT INTO provinces (province_code, province_name, region, is_active) VALUES
('GP',  'Gauteng',            'Central',  TRUE),
('WC',  'Western Cape',       'Southern', TRUE),
('KZN', 'KwaZulu-Natal',      'Eastern',  TRUE),
('EC',  'Eastern Cape',       'Eastern',  TRUE),
('LP',  'Limpopo',            'Northern', TRUE),
('MP',  'Mpumalanga',         'Eastern',  TRUE),
('NW',  'North West',         'Western',  TRUE),
('FS',  'Free State',         'Central',  TRUE),
('NC',  'Northern Cape',      'Western',  TRUE);

-- =====================================================
-- SECTION 2: DEFAULT ADMIN USER
-- Password: Admin@MIET2024! (bcrypt hash — replace with real hash in production)
-- =====================================================

INSERT INTO users (
    user_id,
    full_name,
    email,
    password_hash,
    role,
    is_active,
    phone_number,
    must_change_password
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'MIET Africa System Administrator',
    'admin@mietafrica.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2sBHqMXqGi',  -- bcrypt placeholder
    'ADMIN',
    TRUE,
    '+27 11 000 0000',
    FALSE
);

-- =====================================================
-- SECTION 3: SAMPLE USERS (Manager, Facilitators, Donor)
-- =====================================================

INSERT INTO users (user_id, full_name, email, password_hash, role, is_active, phone_number, must_change_password) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'Nomsa Dlamini',
    'nomsa.dlamini@mietafrica.org',
    '$2b$12$placeholder_hash_manager_001',
    'MANAGER',
    TRUE,
    '+27 82 111 2222',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Thabo Mokoena',
    'thabo.mokoena@mietafrica.org',
    '$2b$12$placeholder_hash_facilitator_001',
    'FACILITATOR',
    TRUE,
    '+27 73 333 4444',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000003',
    'Ayanda Nkosi',
    'ayanda.nkosi@mietafrica.org',
    '$2b$12$placeholder_hash_facilitator_002',
    'FACILITATOR',
    TRUE,
    '+27 79 555 6666',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000004',
    'Priya Naidoo',
    'priya.naidoo@mietafrica.org',
    '$2b$12$placeholder_hash_facilitator_003',
    'FACILITATOR',
    TRUE,
    '+27 83 777 8888',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000005',
    'Standard Bank Foundation',
    'foundation@standardbank.co.za',
    '$2b$12$placeholder_hash_donor_001',
    'DONOR',
    TRUE,
    '+27 11 999 0000',
    TRUE
);

-- =====================================================
-- SECTION 4: YOUTH SKILLS CENTRES
-- =====================================================

INSERT INTO centres (
    centre_id, centre_code, centre_name, province_id,
    address, city, postal_code, phone_number, email,
    centre_manager_id, capacity, is_active, established_date
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'YSC-GP-001',
    'Soweto Youth Skills Centre',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    '123 Vilakazi Street, Orlando West',
    'Soweto',
    '1804',
    '+27 11 536 1000',
    'soweto@mietafrica.org',
    'b0000000-0000-0000-0000-000000000001',
    120,
    TRUE,
    '2018-01-15'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'YSC-KZN-001',
    'Durban Youth Skills Centre',
    (SELECT province_id FROM provinces WHERE province_code = 'KZN'),
    '45 Berea Road, Berea',
    'Durban',
    '4001',
    '+27 31 201 2000',
    'durban@mietafrica.org',
    'b0000000-0000-0000-0000-000000000001',
    100,
    TRUE,
    '2019-03-01'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'YSC-WC-001',
    'Cape Town Youth Skills Centre',
    (SELECT province_id FROM provinces WHERE province_code = 'WC'),
    '78 Voortrekker Road, Bellville',
    'Cape Town',
    '7530',
    '+27 21 948 3000',
    'capetown@mietafrica.org',
    'b0000000-0000-0000-0000-000000000001',
    80,
    TRUE,
    '2020-07-01'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'YSC-EC-001',
    'East London Youth Skills Centre',
    (SELECT province_id FROM provinces WHERE province_code = 'EC'),
    '12 Oxford Street, East London',
    'East London',
    '5201',
    '+27 43 722 4000',
    'eastlondon@mietafrica.org',
    'b0000000-0000-0000-0000-000000000001',
    60,
    TRUE,
    '2021-02-15'
);

-- =====================================================
-- SECTION 5: SAMPLE COURSES (with SETA fields)
-- =====================================================

INSERT INTO courses (
    course_id, course_code, title, description,
    duration_hours, start_date, end_date, pass_mark,
    max_learners, centre_id, province_id,
    seta_name, seta_accreditation_number,
    unit_standard_codes, nqf_level, credits,
    qualification_title, is_active, is_accredited,
    delivery_mode, course_fee, currency, created_by
) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'CRS-ICT-001',
    'Introduction to Computer Literacy',
    'Foundational computer skills covering MS Office, internet usage, email communication, and basic digital literacy for employment readiness.',
    60,
    '2025-02-03',
    '2025-04-30',
    60.00,
    30,
    'c0000000-0000-0000-0000-000000000001',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'MICT SETA',
    'MICT/ACC/2023/001',
    ARRAY['116937', '116938', '116940'],
    3,
    12,
    'End User Computing',
    TRUE,
    TRUE,
    'IN_PERSON',
    0.00,
    'ZAR',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'CRS-ENT-001',
    'Youth Entrepreneurship & Business Skills',
    'Practical entrepreneurship training covering business planning, financial management, marketing, and small business development.',
    80,
    '2025-03-03',
    '2025-06-27',
    65.00,
    25,
    'c0000000-0000-0000-0000-000000000001',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'SERVICES SETA',
    'SERV/ACC/2023/045',
    ARRAY['252040', '252041', '252042', '252043'],
    4,
    20,
    'New Venture Creation',
    TRUE,
    TRUE,
    'IN_PERSON',
    0.00,
    'ZAR',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'CRS-LIFE-001',
    'Life Skills & Work Readiness',
    'Comprehensive life skills programme covering communication, teamwork, financial literacy, CV writing, and interview preparation.',
    40,
    '2025-02-03',
    '2025-03-28',
    50.00,
    35,
    'c0000000-0000-0000-0000-000000000002',
    (SELECT province_id FROM provinces WHERE province_code = 'KZN'),
    'ETDP SETA',
    'ETDP/ACC/2023/112',
    ARRAY['119462', '119463', '119465'],
    2,
    8,
    'Life Skills and Work Readiness',
    TRUE,
    TRUE,
    'IN_PERSON',
    0.00,
    'ZAR',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'CRS-CONST-001',
    'Construction & Building Skills',
    'Practical construction skills training covering bricklaying, plastering, tiling, and basic plumbing for entry-level employment.',
    120,
    '2025-04-07',
    '2025-08-29',
    70.00,
    20,
    'c0000000-0000-0000-0000-000000000003',
    (SELECT province_id FROM provinces WHERE province_code = 'WC'),
    'CETA',
    'CETA/ACC/2023/078',
    ARRAY['120383', '120384', '120385', '120386'],
    2,
    16,
    'Construction Trades',
    TRUE,
    TRUE,
    'IN_PERSON',
    0.00,
    'ZAR',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'CRS-CARE-001',
    'Early Childhood Development (ECD)',
    'Training for ECD practitioners covering child development, learning through play, health and safety, and parent engagement.',
    100,
    '2025-03-03',
    '2025-07-25',
    65.00,
    25,
    'c0000000-0000-0000-0000-000000000004',
    (SELECT province_id FROM provinces WHERE province_code = 'EC'),
    'ETDP SETA',
    'ETDP/ACC/2023/089',
    ARRAY['117877', '117878', '117879', '117880'],
    4,
    32,
    'Early Childhood Development',
    TRUE,
    TRUE,
    'IN_PERSON',
    0.00,
    'ZAR',
    'a0000000-0000-0000-0000-000000000001'
);

-- =====================================================
-- SECTION 6: FACILITATOR ASSIGNMENTS
-- =====================================================

INSERT INTO facilitator_assignments (user_id, course_id, assigned_date, is_primary, assigned_by) VALUES
('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', '2025-01-15', TRUE,  'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', '2025-01-15', TRUE,  'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', '2025-01-20', TRUE,  'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', '2025-02-01', TRUE,  'a0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', '2025-02-01', TRUE,  'a0000000-0000-0000-0000-000000000001');

-- =====================================================
-- SECTION 7: SAMPLE LEARNERS
-- =====================================================

INSERT INTO learners (
    learner_id, first_name, last_name, id_number, date_of_birth,
    gender, email, contact_number, address, city, postal_code,
    province_id, centre_id, highest_qualification, employment_status,
    disability_status, home_language, nationality, status,
    popia_consent, popia_consent_date, registration_date, created_by
) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'Sipho', 'Zulu',
    '0001015800082',
    '2000-01-01',
    'MALE',
    'sipho.zulu@email.com',
    '+27 71 111 0001',
    '15 Mofolo Street, Soweto',
    'Soweto', '1804',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'c0000000-0000-0000-0000-000000000001',
    'Grade 12',
    'UNEMPLOYED',
    FALSE,
    'Zulu',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-01-20 09:00:00',
    '2025-01-20',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'Nomvula', 'Khumalo',
    '0103125900183',
    '2001-03-12',
    'FEMALE',
    'nomvula.khumalo@email.com',
    '+27 72 222 0002',
    '8 Diepkloof Zone 4, Soweto',
    'Soweto', '1862',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'c0000000-0000-0000-0000-000000000001',
    'Grade 11',
    'UNEMPLOYED',
    FALSE,
    'Zulu',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-01-20 09:15:00',
    '2025-01-20',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'Lungelo', 'Mthembu',
    '9908205800084',
    '1999-08-20',
    'MALE',
    'lungelo.mthembu@email.com',
    '+27 73 333 0003',
    '22 Umlazi Township, Section V',
    'Durban', '4031',
    (SELECT province_id FROM provinces WHERE province_code = 'KZN'),
    'c0000000-0000-0000-0000-000000000002',
    'Grade 12',
    'UNEMPLOYED',
    FALSE,
    'Zulu',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-01-22 10:00:00',
    '2025-01-22',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000004',
    'Fatima', 'Davids',
    '0205145000085',
    '2002-05-14',
    'FEMALE',
    'fatima.davids@email.com',
    '+27 74 444 0004',
    '5 Hanover Park Avenue, Cape Town',
    'Cape Town', '7764',
    (SELECT province_id FROM provinces WHERE province_code = 'WC'),
    'c0000000-0000-0000-0000-000000000003',
    'Grade 10',
    'UNEMPLOYED',
    FALSE,
    'Afrikaans',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-02-03 08:30:00',
    '2025-02-03',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000005',
    'Andile', 'Ntuli',
    '0007075800086',
    '2000-07-07',
    'MALE',
    'andile.ntuli@email.com',
    '+27 75 555 0005',
    '33 Mdantsane Unit 7',
    'East London', '5219',
    (SELECT province_id FROM provinces WHERE province_code = 'EC'),
    'c0000000-0000-0000-0000-000000000004',
    'Grade 12',
    'UNEMPLOYED',
    FALSE,
    'Xhosa',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-02-10 09:00:00',
    '2025-02-10',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000006',
    'Zanele', 'Mokoena',
    '0109285900087',
    '2001-09-28',
    'FEMALE',
    'zanele.mokoena@email.com',
    '+27 76 666 0006',
    '7 Meadowlands Zone 9, Soweto',
    'Soweto', '1852',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'c0000000-0000-0000-0000-000000000001',
    'Grade 12',
    'UNEMPLOYED',
    FALSE,
    'Sotho',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-01-20 09:30:00',
    '2025-01-20',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000007',
    'Rethabile', 'Sithole',
    '0304155800088',
    '2003-04-15',
    'MALE',
    'rethabile.sithole@email.com',
    '+27 77 777 0007',
    '19 Tembisa Extension 3',
    'Tembisa', '1632',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'c0000000-0000-0000-0000-000000000001',
    'Grade 11',
    'UNEMPLOYED',
    FALSE,
    'Sotho',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-01-21 10:00:00',
    '2025-01-21',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'e0000000-0000-0000-0000-000000000008',
    'Nompumelelo', 'Dube',
    '0206145900089',
    '2002-06-14',
    'FEMALE',
    'nompumelelo.dube@email.com',
    '+27 78 888 0008',
    '44 KwaMashu Section D',
    'Durban', '4360',
    (SELECT province_id FROM provinces WHERE province_code = 'KZN'),
    'c0000000-0000-0000-0000-000000000002',
    'Grade 12',
    'UNEMPLOYED',
    TRUE,
    'Zulu',
    'South African',
    'ACTIVE',
    TRUE,
    '2025-01-22 10:30:00',
    '2025-01-22',
    'a0000000-0000-0000-0000-000000000001'
);

-- =====================================================
-- SECTION 8: SAMPLE ENROLMENTS
-- =====================================================

INSERT INTO enrolments (
    enrolment_id, learner_id, course_id, enrol_date,
    completion_status, created_by
) VALUES
-- ICT Course (GP)
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2025-02-03', 'IN_PROGRESS', 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', '2025-02-03', 'IN_PROGRESS', 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', '2025-02-03', 'IN_PROGRESS', 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', '2025-02-03', 'IN_PROGRESS', 'b0000000-0000-0000-0000-000000000002'),
-- Entrepreneurship Course (GP)
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '2025-03-03', 'ENROLLED',     'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', '2025-03-03', 'ENROLLED',     'b0000000-0000-0000-0000-000000000002'),
-- Life Skills Course (KZN)
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', '2025-02-03', 'IN_PROGRESS', 'b0000000-0000-0000-0000-000000000003'),
('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', '2025-02-03', 'IN_PROGRESS', 'b0000000-0000-0000-0000-000000000003'),
-- Construction Course (WC)
('f0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', '2025-04-07', 'ENROLLED',     'b0000000-0000-0000-0000-000000000004'),
-- ECD Course (EC)
('f0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', '2025-03-03', 'ENROLLED',     'b0000000-0000-0000-0000-000000000004');

-- =====================================================
-- SECTION 9: SAMPLE SESSIONS
-- =====================================================

INSERT INTO sessions (
    session_id, course_id, session_date, session_start_time, session_end_time,
    topic, session_number, facilitator_id, created_by
) VALUES
-- ICT Course Sessions
('a2000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2025-02-03', '08:00', '12:00', 'Introduction to Computers & Operating Systems', 1, 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', '2025-02-05', '08:00', '12:00', 'Microsoft Word — Documents & Formatting',       2, 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', '2025-02-10', '08:00', '12:00', 'Microsoft Excel — Spreadsheets & Formulas',     3, 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
('a2000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', '2025-02-12', '08:00', '12:00', 'Internet, Email & Online Safety',               4, 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
-- Life Skills Sessions
('a2000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', '2025-02-03', '09:00', '13:00', 'Communication & Interpersonal Skills',          1, 'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'),
('a2000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', '2025-02-05', '09:00', '13:00', 'Financial Literacy & Budgeting',                2, 'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003'),
('a2000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', '2025-02-10', '09:00', '13:00', 'CV Writing & Interview Preparation',            3, 'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003');

-- =====================================================
-- SECTION 10: SAMPLE ATTENDANCE RECORDS
-- =====================================================

INSERT INTO attendance (enrolment_id, session_id, present, recorded_by) VALUES
-- ICT Session 1 (03 Feb)
('f0000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000001', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000001', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000001', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000001', FALSE, 'b0000000-0000-0000-0000-000000000002'),
-- ICT Session 2 (05 Feb)
('f0000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000002', FALSE, 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000002', TRUE,  'b0000000-0000-0000-0000-000000000002'),
-- ICT Session 3 (10 Feb)
('f0000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000003', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000003', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000003', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000003', TRUE,  'b0000000-0000-0000-0000-000000000002'),
-- ICT Session 4 (12 Feb)
('f0000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000004', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000004', FALSE, 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000003', 'a2000000-0000-0000-0000-000000000004', TRUE,  'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000004', 'a2000000-0000-0000-0000-000000000004', TRUE,  'b0000000-0000-0000-0000-000000000002'),
-- Life Skills Session 1
('f0000000-0000-0000-0000-000000000007', 'a2000000-0000-0000-0000-000000000005', TRUE,  'b0000000-0000-0000-0000-000000000003'),
('f0000000-0000-0000-0000-000000000008', 'a2000000-0000-0000-0000-000000000005', TRUE,  'b0000000-0000-0000-0000-000000000003'),
-- Life Skills Session 2
('f0000000-0000-0000-0000-000000000007', 'a2000000-0000-0000-0000-000000000006', TRUE,  'b0000000-0000-0000-0000-000000000003'),
('f0000000-0000-0000-0000-000000000008', 'a2000000-0000-0000-0000-000000000006', FALSE, 'b0000000-0000-0000-0000-000000000003'),
-- Life Skills Session 3
('f0000000-0000-0000-0000-000000000007', 'a2000000-0000-0000-0000-000000000007', TRUE,  'b0000000-0000-0000-0000-000000000003'),
('f0000000-0000-0000-0000-000000000008', 'a2000000-0000-0000-0000-000000000007', TRUE,  'b0000000-0000-0000-0000-000000000003');

-- =====================================================
-- SECTION 11: SAMPLE ASSESSMENTS
-- =====================================================

INSERT INTO assessments (
    enrolment_id, module_title, assessment_type,
    score, max_score, assessment_date,
    assessor_id, unit_standard_code, attempt_number, created_by
) VALUES
-- ICT Assessments — Sipho Zulu
('f0000000-0000-0000-0000-000000000001', 'Computer Basics & OS',        'WRITTEN_TEST', 72.00, 100.00, '2025-02-10', 'b0000000-0000-0000-0000-000000000002', '116937', 1, 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000001', 'Microsoft Word Practical',    'PRACTICAL',    68.00, 100.00, '2025-02-17', 'b0000000-0000-0000-0000-000000000002', '116938', 1, 'b0000000-0000-0000-0000-000000000002'),
-- ICT Assessments — Nomvula Khumalo
('f0000000-0000-0000-0000-000000000002', 'Computer Basics & OS',        'WRITTEN_TEST', 55.00, 100.00, '2025-02-10', 'b0000000-0000-0000-0000-000000000002', '116937', 1, 'b0000000-0000-0000-0000-000000000002'),
('f0000000-0000-0000-0000-000000000002', 'Microsoft Word Practical',    'PRACTICAL',    80.00, 100.00, '2025-02-17', 'b0000000-0000-0000-0000-000000000002', '116938', 1, 'b0000000-0000-0000-0000-000000000002'),
-- ICT Assessments — Zanele Mokoena
('f0000000-0000-0000-0000-000000000003', 'Computer Basics & OS',        'WRITTEN_TEST', 45.00, 100.00, '2025-02-10', 'b0000000-0000-0000-0000-000000000002', '116937', 1, 'b0000000-0000-0000-0000-000000000002'),
-- Life Skills Assessments — Lungelo Mthembu
('f0000000-0000-0000-0000-000000000007', 'Communication Skills',        'WRITTEN_TEST', 78.00, 100.00, '2025-02-12', 'b0000000-0000-0000-0000-000000000003', '119462', 1, 'b0000000-0000-0000-0000-000000000003'),
('f0000000-0000-0000-0000-000000000007', 'Financial Literacy',          'ASSIGNMENT',   65.00, 100.00, '2025-02-19', 'b0000000-0000-0000-0000-000000000003', '119463', 1, 'b0000000-0000-0000-0000-000000000003'),
-- Life Skills Assessments — Nompumelelo Dube
('f0000000-0000-0000-0000-000000000008', 'Communication Skills',        'WRITTEN_TEST', 88.00, 100.00, '2025-02-12', 'b0000000-0000-0000-0000-000000000003', '119462', 1, 'b0000000-0000-0000-0000-000000000003'),
('f0000000-0000-0000-0000-000000000008', 'Financial Literacy',          'ASSIGNMENT',   72.00, 100.00, '2025-02-19', 'b0000000-0000-0000-0000-000000000003', '119463', 1, 'b0000000-0000-0000-0000-000000000003');

-- =====================================================
-- SECTION 12: SAMPLE DONATION
-- =====================================================

INSERT INTO donations (
    donation_id, donor_user_id, donor_name, donor_organisation,
    donor_email, donor_phone, amount, currency, donation_date,
    purpose, province_id, receipt_number, payment_method,
    is_recurring, recurrence_interval, created_by
) VALUES
(
    'a3000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    'Standard Bank Foundation',
    'Standard Bank Group',
    'foundation@standardbank.co.za',
    '+27 11 636 9111',
    500000.00,
    'ZAR',
    '2025-01-10',
    'Funding for ICT and Entrepreneurship training programmes across Gauteng Youth Skills Centres — 2025 cohort',
    (SELECT province_id FROM provinces WHERE province_code = 'GP'),
    'REC-2025-SBF-001',
    'EFT',
    TRUE,
    'ANNUALLY',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'a3000000-0000-0000-0000-000000000002',
    NULL,
    'National Youth Development Agency',
    'NYDA',
    'grants@nyda.gov.za',
    '+27 11 651 7000',
    250000.00,
    'ZAR',
    '2025-01-15',
    'Bursary funding for learner materials, transport, and certification fees across all provinces',
    NULL,
    'REC-2025-NYDA-001',
    'EFT',
    FALSE,
    NULL,
    'a0000000-0000-0000-0000-000000000001'
);

-- =====================================================
-- SECTION 13: SAMPLE FEES
-- =====================================================

INSERT INTO fees (
    enrolment_id, learner_id, course_id,
    fee_amount, currency, fee_type, due_date,
    payment_status, waiver_reason, donation_id, created_by
) VALUES
-- All learners have fees waived (donor-funded programme)
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 0.00, 'ZAR', 'COURSE_FEE',       '2025-02-03', 'WAIVED', 'Donor-funded programme — Standard Bank Foundation 2025', 'a3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 0.00, 'ZAR', 'COURSE_FEE',       '2025-02-03', 'WAIVED', 'Donor-funded programme — Standard Bank Foundation 2025', 'a3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 0.00, 'ZAR', 'COURSE_FEE',       '2025-02-03', 'WAIVED', 'Donor-funded programme — Standard Bank Foundation 2025', 'a3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 0.00, 'ZAR', 'COURSE_FEE',       '2025-02-03', 'WAIVED', 'Donor-funded programme — NYDA Bursary 2025',            'a3000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001'),
('f0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 0.00, 'ZAR', 'COURSE_FEE',       '2025-02-03', 'WAIVED', 'Donor-funded programme — NYDA Bursary 2025',            'a3000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001');

-- =====================================================
-- SECTION 14: SYSTEM CONFIGURATION
-- =====================================================

INSERT INTO system_config (config_key, config_value, config_category, description, data_type, is_sensitive) VALUES
('PLATFORM_NAME',               'MIET Africa Youth Skills Centre Management Platform', 'GENERAL',        'Full platform name',                                           'STRING',  FALSE),
('PLATFORM_SHORT_NAME',         'MIET Africa YSC',                                     'GENERAL',        'Short platform name for display',                              'STRING',  FALSE),
('ORGANISATION_NAME',           'MIET Africa',                                         'GENERAL',        'Organisation name',                                            'STRING',  FALSE),
('ORGANISATION_WEBSITE',        'https://www.miet.co.za',                              'GENERAL',        'Organisation website URL',                                     'STRING',  FALSE),
('SUPPORT_EMAIL',               'support@mietafrica.org',                              'GENERAL',        'Platform support email address',                               'STRING',  FALSE),
('DEFAULT_CURRENCY',            'ZAR',                                                 'FINANCIAL',      'Default currency for fees and donations',                       'STRING',  FALSE),
('ATTENDANCE_THRESHOLD_PASS',   '80',                                                  'ACADEMIC',       'Minimum attendance percentage to meet threshold (%)',           'INTEGER', FALSE),
('ATTENDANCE_THRESHOLD_WARN',   '60',                                                  'ACADEMIC',       'Attendance percentage below which alert is triggered (%)',      'INTEGER', FALSE),
('DEFAULT_PASS_MARK',           '50',                                                  'ACADEMIC',       'Default course pass mark percentage',                           'INTEGER', FALSE),
('CERTIFICATE_NUMBER_PREFIX',   'MIET',                                                'CERTIFICATES',   'Prefix for auto-generated certificate numbers',                 'STRING',  FALSE),
('CERTIFICATE_VALIDITY_YEARS',  '3',                                                   'CERTIFICATES',   'Default certificate validity period in years',                  'INTEGER', FALSE),
('PASSWORD_MIN_LENGTH',         '8',                                                   'SECURITY',       'Minimum password length',                                       'INTEGER', FALSE),
('MAX_LOGIN_ATTEMPTS',          '5',                                                   'SECURITY',       'Maximum failed login attempts before account lockout',          'INTEGER', FALSE),
('ACCOUNT_LOCKOUT_MINUTES',     '30',                                                  'SECURITY',       'Account lockout duration in minutes after max failed attempts', 'INTEGER', FALSE),
('SESSION_TIMEOUT_MINUTES',     '60',                                                  'SECURITY',       'JWT session timeout in minutes',                                'INTEGER', FALSE),
('POPIA_CONSENT_REQUIRED',      'true',                                                'COMPLIANCE',     'Require POPIA consent before learner registration',             'BOOLEAN', FALSE),
('DATA_RETENTION_YEARS',        '7',                                                   'COMPLIANCE',     'Data retention period in years (POPIA requirement)',            'INTEGER', FALSE),
('AUDIT_LOG_RETENTION_DAYS',    '2555',                                                'COMPLIANCE',     'Audit log retention period in days (7 years)',                  'INTEGER', FALSE),
('BACKUP_FREQUENCY_HOURS',      '24',                                                  'INFRASTRUCTURE', 'Database backup frequency in hours',                            'INTEGER', FALSE),
('MAX_LEARNERS_PER_COURSE',     '50',                                                  'ACADEMIC',       'Default maximum learners per course',                           'INTEGER', FALSE),
('SETA_REPORTING_ENABLED',      'true',                                                'COMPLIANCE',     'Enable SETA reporting features',                                'BOOLEAN', FALSE),
('ENABLE_TWO_FACTOR_AUTH',      'false',                                               'SECURITY',       'Enable two-factor authentication platform-wide',                'BOOLEAN', FALSE),
('VERIFICATION_BASE_URL',       'https://verify.mietafrica.org/cert',                  'CERTIFICATES',   'Base URL for certificate public verification portal',           'STRING',  FALSE);

-- =====================================================
-- SECTION 15: AUDIT LOG — INITIAL SETUP ENTRY
-- =====================================================

INSERT INTO audit_logs (
    user_id, user_email, action, entity_type, entity_id,
    description, action_result
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@mietafrica.org',
    'CREATE',
    'system',
    'database',
    'MIET Africa Youth Skills Centre Management Platform database initialised with schema v1.0 and seed data.',
    'SUCCESS'
);

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (run after seed to confirm)
-- =====================================================

/*
-- Verify provinces loaded
SELECT province_code, province_name FROM provinces ORDER BY province_name;

-- Verify users loaded
SELECT full_name, email, role FROM users ORDER BY role;

-- Verify centres loaded
SELECT centre_code, centre_name, city FROM centres ORDER BY centre_code;

-- Verify courses loaded
SELECT course_code, title, seta_name, nqf_level, pass_mark FROM courses ORDER BY course_code;

-- Verify learners loaded
SELECT first_name, last_name, id_number, status FROM learners ORDER BY last_name;

-- Verify enrolments loaded
SELECT e.enrolment_id, l.first_name || ' ' || l.last_name AS learner,
       co.title AS course, e.completion_status
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
JOIN courses co ON e.course_id = co.course_id
ORDER BY co.title, l.last_name;

-- Check attendance percentages (auto-calculated by trigger)
SELECT l.first_name || ' ' || l.last_name AS learner,
       co.title AS course,
       e.attendance_percentage
FROM enrolments e
JOIN learners l ON e.learner_id = l.learner_id
JOIN courses co ON e.course_id = co.course_id
ORDER BY co.title, l.last_name;

-- Check assessment results (auto-set by trigger)
SELECT l.first_name || ' ' || l.last_name AS learner,
       a.module_title, a.score, a.max_score, a.percentage, a.result
FROM assessments a
JOIN enrolments e ON a.enrolment_id = e.enrolment_id
JOIN learners l ON e.learner_id = l.learner_id
ORDER BY l.last_name, a.module_title;

-- Check donor impact metrics view
SELECT * FROM v_donor_impact_metrics;

-- Check course statistics view
SELECT course_code, course_title, total_enrolments,
       avg_attendance_percentage, completion_rate_percent
FROM v_course_statistics;
*/

-- End of MIET Africa Seed Data
