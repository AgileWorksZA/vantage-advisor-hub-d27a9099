import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InstrumentData {
  name: string;
  code: string;
  isin: string;
  exchange: string;
  sector: string;
  industry: string;
  fund_type: string;
  fund_manager: string;
}

interface ClientData {
  first_name: string;
  surname: string;
  jurisdiction: string;
  advisor: string;
  nationality: string;
  language: string;
  email: string;
  cell_number: string;
  gender: string;
  title: string;
  occupation: string;
  employer: string | null;
  industry: string;
  country_of_issue: string;
  tax_resident_country: string;
  initials: string;
  opportunity_type: string;
}

// ==================== ASX INSTRUMENTS ====================
const asxInstruments: InstrumentData[] = [
  { name: 'Vanguard Australian Shares Index ETF', code: 'VAS', isin: 'AU0000017587', exchange: 'ASX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'Vanguard' },
  { name: 'iShares Core S&P/ASX 200 ETF', code: 'IOZ', isin: 'AU000000IOZ5', exchange: 'ASX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'BlackRock' },
  { name: 'BetaShares Australia 200 ETF', code: 'A200', isin: 'AU00000A2005', exchange: 'ASX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'BetaShares' },
  { name: 'SPDR S&P/ASX 200 Fund', code: 'STW', isin: 'AU000000STW4', exchange: 'ASX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'State Street' },
  { name: 'BHP Group Limited', code: 'BHP', isin: 'AU000000BHP4', exchange: 'ASX', sector: 'Materials', industry: 'Mining', fund_type: 'Equity', fund_manager: '' },
  { name: 'Commonwealth Bank of Australia', code: 'CBA', isin: 'AU000000CBA7', exchange: 'ASX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'CSL Limited', code: 'CSL', isin: 'AU000000CSL8', exchange: 'ASX', sector: 'Healthcare', industry: 'Biotechnology', fund_type: 'Equity', fund_manager: '' },
  { name: 'Westpac Banking Corporation', code: 'WBC', isin: 'AU000000WBC1', exchange: 'ASX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'ANZ Group Holdings', code: 'ANZ', isin: 'AU000000ANZ3', exchange: 'ASX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'National Australia Bank', code: 'NAB', isin: 'AU000000NAB4', exchange: 'ASX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'Macquarie Group Limited', code: 'MQG', isin: 'AU000000MQG1', exchange: 'ASX', sector: 'Financials', industry: 'Financial Services', fund_type: 'Equity', fund_manager: '' },
  { name: 'Wesfarmers Limited', code: 'WES', isin: 'AU000000WES1', exchange: 'ASX', sector: 'Consumer Discretionary', industry: 'Retail', fund_type: 'Equity', fund_manager: '' },
  { name: 'Telstra Group Limited', code: 'TLS', isin: 'AU000000TLS2', exchange: 'ASX', sector: 'Communication Services', industry: 'Telecommunications', fund_type: 'Equity', fund_manager: '' },
  { name: 'Fortescue Limited', code: 'FMG', isin: 'AU000000FMG4', exchange: 'ASX', sector: 'Materials', industry: 'Mining', fund_type: 'Equity', fund_manager: '' },
  { name: 'Rio Tinto Limited', code: 'RIO', isin: 'AU000000RIO1', exchange: 'ASX', sector: 'Materials', industry: 'Mining', fund_type: 'Equity', fund_manager: '' },
  { name: 'Woolworths Group Limited', code: 'WOW', isin: 'AU000000WOW2', exchange: 'ASX', sector: 'Consumer Staples', industry: 'Retail', fund_type: 'Equity', fund_manager: '' },
  { name: 'Goodman Group', code: 'GMG', isin: 'AU000000GMG2', exchange: 'ASX', sector: 'Real Estate', industry: 'REIT', fund_type: 'Equity', fund_manager: '' },
  { name: 'Transurban Group', code: 'TCL', isin: 'AU000000TCL6', exchange: 'ASX', sector: 'Industrials', industry: 'Infrastructure', fund_type: 'Equity', fund_manager: '' },
  { name: 'Woodside Energy Group', code: 'WDS', isin: 'AU000000WDS8', exchange: 'ASX', sector: 'Energy', industry: 'Oil & Gas', fund_type: 'Equity', fund_manager: '' },
  { name: 'Santos Limited', code: 'STO', isin: 'AU000000STO6', exchange: 'ASX', sector: 'Energy', industry: 'Oil & Gas', fund_type: 'Equity', fund_manager: '' },
  { name: 'BetaShares NASDAQ 100 ETF', code: 'NDQ', isin: 'AU00000NDQ05', exchange: 'ASX', sector: 'Equity - International', industry: 'Technology', fund_type: 'ETF', fund_manager: 'BetaShares' },
  { name: 'Vanguard Diversified High Growth ETF', code: 'VDHG', isin: 'AU0000VDHG07', exchange: 'ASX', sector: 'Multi-Asset', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'Vanguard' },
  { name: 'Coles Group Limited', code: 'COL', isin: 'AU0000030040', exchange: 'ASX', sector: 'Consumer Staples', industry: 'Retail', fund_type: 'Equity', fund_manager: '' },
  { name: 'REA Group Limited', code: 'REA', isin: 'AU000000REA9', exchange: 'ASX', sector: 'Communication Services', industry: 'Technology', fund_type: 'Equity', fund_manager: '' },
  { name: 'James Hardie Industries', code: 'JHX', isin: 'AU000000JHX1', exchange: 'ASX', sector: 'Materials', industry: 'Construction', fund_type: 'Equity', fund_manager: '' },
];

// ==================== TSX INSTRUMENTS ====================
const tsxInstruments: InstrumentData[] = [
  { name: 'iShares S&P/TSX 60 ETF', code: 'XIU', isin: 'CA46434G1090', exchange: 'TSX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'BlackRock' },
  { name: 'BMO S&P/TSX Capped Composite ETF', code: 'ZCN', isin: 'CA05577W1014', exchange: 'TSX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'BMO' },
  { name: 'iShares Core S&P/TSX Capped Composite ETF', code: 'XIC', isin: 'CA46428R1073', exchange: 'TSX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'BlackRock' },
  { name: 'Vanguard FTSE Canada All Cap Index ETF', code: 'VCN', isin: 'CA92206H1047', exchange: 'TSX', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'Vanguard' },
  { name: 'Royal Bank of Canada', code: 'RY', isin: 'CA7800871021', exchange: 'TSX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'Toronto-Dominion Bank', code: 'TD', isin: 'CA8911605092', exchange: 'TSX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'Bank of Montreal', code: 'BMO', isin: 'CA0636711016', exchange: 'TSX', sector: 'Financials', industry: 'Banking', fund_type: 'Equity', fund_manager: '' },
  { name: 'Shopify Inc', code: 'SHOP', isin: 'CA82509L1076', exchange: 'TSX', sector: 'Technology', industry: 'E-Commerce', fund_type: 'Equity', fund_manager: '' },
  { name: 'Enbridge Inc', code: 'ENB', isin: 'CA29250N1050', exchange: 'TSX', sector: 'Energy', industry: 'Pipelines', fund_type: 'Equity', fund_manager: '' },
  { name: 'Canadian National Railway', code: 'CNR', isin: 'CA1363751027', exchange: 'TSX', sector: 'Industrials', industry: 'Railways', fund_type: 'Equity', fund_manager: '' },
  { name: 'Brookfield Corporation', code: 'BN', isin: 'CA11271J1075', exchange: 'TSX', sector: 'Financials', industry: 'Asset Management', fund_type: 'Equity', fund_manager: '' },
  { name: 'Canadian Pacific Kansas City', code: 'CP', isin: 'CA13646K1084', exchange: 'TSX', sector: 'Industrials', industry: 'Railways', fund_type: 'Equity', fund_manager: '' },
  { name: 'Suncor Energy', code: 'SU', isin: 'CA8672241079', exchange: 'TSX', sector: 'Energy', industry: 'Oil & Gas', fund_type: 'Equity', fund_manager: '' },
  { name: 'Thomson Reuters Corporation', code: 'TRI', isin: 'CA8849037095', exchange: 'TSX', sector: 'Technology', industry: 'Information Services', fund_type: 'Equity', fund_manager: '' },
  { name: 'Manulife Financial Corporation', code: 'MFC', isin: 'CA56501R1064', exchange: 'TSX', sector: 'Financials', industry: 'Insurance', fund_type: 'Equity', fund_manager: '' },
  { name: 'Constellation Software', code: 'CSU', isin: 'CA21037X1006', exchange: 'TSX', sector: 'Technology', industry: 'Software', fund_type: 'Equity', fund_manager: '' },
  { name: 'BCE Inc', code: 'BCE', isin: 'CA05534B7604', exchange: 'TSX', sector: 'Communication Services', industry: 'Telecommunications', fund_type: 'Equity', fund_manager: '' },
  { name: 'Fortis Inc', code: 'FTS', isin: 'CA3495531079', exchange: 'TSX', sector: 'Utilities', industry: 'Electric Utilities', fund_type: 'Equity', fund_manager: '' },
  { name: 'TELUS Corporation', code: 'T', isin: 'CA87971M1032', exchange: 'TSX', sector: 'Communication Services', industry: 'Telecommunications', fund_type: 'Equity', fund_manager: '' },
  { name: 'Nutrien Ltd', code: 'NTR', isin: 'CA67077M1086', exchange: 'TSX', sector: 'Materials', industry: 'Agriculture', fund_type: 'Equity', fund_manager: '' },
  { name: 'Barrick Gold Corporation', code: 'ABX', isin: 'CA0679011084', exchange: 'TSX', sector: 'Materials', industry: 'Mining', fund_type: 'Equity', fund_manager: '' },
  { name: 'iShares Core Equity ETF Portfolio', code: 'XEQT', isin: 'CA46436U1084', exchange: 'TSX', sector: 'Multi-Asset', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'BlackRock' },
  { name: 'Vanguard All-Equity ETF Portfolio', code: 'VEQT', isin: 'CA92207X1024', exchange: 'TSX', sector: 'Multi-Asset', industry: 'Diversified', fund_type: 'ETF', fund_manager: 'Vanguard' },
  { name: 'Vanguard S&P 500 Index ETF (CAD)', code: 'VFV', isin: 'CA92206H3084', exchange: 'TSX', sector: 'Equity - International', industry: 'US Large Cap', fund_type: 'ETF', fund_manager: 'Vanguard' },
  { name: 'BMO S&P 500 Index ETF', code: 'ZSP', isin: 'CA05577W3002', exchange: 'TSX', sector: 'Equity - International', industry: 'US Large Cap', fund_type: 'ETF', fund_manager: 'BMO' },
];

// ==================== MISSING INSTRUMENTS FOR EXISTING EXCHANGES ====================
const missingInstruments: InstrumentData[] = [
  // JSE - missing TLH replacement/pair funds
  { name: '1nvest SA Top 40 ETF', code: 'ETFT40', isin: 'ZAE000234567', exchange: 'JSE', sector: 'Equity - Large Cap', industry: 'Diversified', fund_type: 'ETF', fund_manager: '1nvest' },
  { name: '1nvest Gold ETF', code: 'ETFGLD', isin: 'ZAE000345678', exchange: 'JSE', sector: 'Commodities - Gold', industry: 'Commodities', fund_type: 'ETF', fund_manager: '1nvest' },
  // NYSE - TLH pairs
  { name: 'Vanguard S&P 500 ETF', code: 'VOO', isin: 'US9229083632', exchange: 'NYSE', sector: 'Equity - Large Cap', industry: 'US Large Cap', fund_type: 'ETF', fund_manager: 'Vanguard' },
  { name: 'iShares Core S&P 500 ETF', code: 'IVV', isin: 'US4642872000', exchange: 'NYSE', sector: 'Equity - Large Cap', industry: 'US Large Cap', fund_type: 'ETF', fund_manager: 'BlackRock' },
  // LSE - TLH pairs
  { name: 'Vanguard FTSE 100 ETF', code: 'VUKE', isin: 'IE00B810Q511', exchange: 'LSE', sector: 'Equity - Large Cap', industry: 'UK Large Cap', fund_type: 'ETF', fund_manager: 'Vanguard' },
];

// ==================== OPPORTUNITY + TLH CLIENTS ====================
const opportunityClients: ClientData[] = [
  // === ZA: TLH opportunity clients (c1-c12) ===
  { first_name: 'John', surname: 'Smith', jurisdiction: 'ZA', advisor: 'Johan Botha', nationality: 'South African', language: 'English', email: 'john.smith@gmail.com', cell_number: '+27 82 100 2001', gender: 'Male', title: 'Mr', occupation: 'Financial Analyst', employer: 'Old Mutual', industry: 'Financial Services', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'JS', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Mary', surname: 'Jones', jurisdiction: 'ZA', advisor: 'Johan Botha', nationality: 'South African', language: 'English', email: 'mary.jones@gmail.com', cell_number: '+27 83 100 2002', gender: 'Female', title: 'Mrs', occupation: 'Teacher', employer: 'Stellenbosch School', industry: 'Education', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'MJ', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Peter', surname: 'Williams', jurisdiction: 'ZA', advisor: 'Sarah Mostert', nationality: 'South African', language: 'English', email: 'peter.williams@outlook.com', cell_number: '+27 84 100 2003', gender: 'Male', title: 'Mr', occupation: 'Software Engineer', employer: 'Naspers', industry: 'Technology', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'PW', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Sarah', surname: 'Brown', jurisdiction: 'ZA', advisor: 'Sarah Mostert', nationality: 'South African', language: 'English', email: 'sarah.brown@yahoo.com', cell_number: '+27 82 100 2004', gender: 'Female', title: 'Mrs', occupation: 'Accountant', employer: 'KPMG SA', industry: 'Consulting', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'SB', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'David', surname: 'Miller', jurisdiction: 'ZA', advisor: 'Pieter Naudé', nationality: 'South African', language: 'English', email: 'david.miller@gmail.com', cell_number: '+27 83 100 2005', gender: 'Male', title: 'Mr', occupation: 'Civil Engineer', employer: 'Aurecon', industry: 'Engineering', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'DM', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Emma', surname: 'Davis', jurisdiction: 'ZA', advisor: 'Pieter Naudé', nationality: 'South African', language: 'English', email: 'emma.davis@icloud.com', cell_number: '+27 84 100 2006', gender: 'Female', title: 'Ms', occupation: 'Marketing Manager', employer: 'Discovery', industry: 'Financial Services', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'ED', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Michael', surname: 'Wilson', jurisdiction: 'ZA', advisor: 'Linda van Wyk', nationality: 'South African', language: 'English', email: 'michael.wilson@gmail.com', cell_number: '+27 82 100 2007', gender: 'Male', title: 'Mr', occupation: 'Architect', employer: 'Boogertman + Partners', industry: 'Architecture', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'MW', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Lisa', surname: 'Anderson', jurisdiction: 'ZA', advisor: 'Linda van Wyk', nationality: 'South African', language: 'English', email: 'lisa.anderson@outlook.com', cell_number: '+27 83 100 2008', gender: 'Female', title: 'Mrs', occupation: 'HR Director', employer: 'Shoprite', industry: 'Retail', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'LA', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'James', surname: 'Taylor', jurisdiction: 'ZA', advisor: 'David Greenberg', nationality: 'South African', language: 'English', email: 'james.taylor@gmail.com', cell_number: '+27 84 100 2009', gender: 'Male', title: 'Mr', occupation: 'Doctor', employer: 'Mediclinic', industry: 'Healthcare', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'JT', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Jennifer', surname: 'Thomas', jurisdiction: 'ZA', advisor: 'David Greenberg', nationality: 'South African', language: 'English', email: 'jennifer.thomas@yahoo.com', cell_number: '+27 82 100 2010', gender: 'Female', title: 'Ms', occupation: 'Lawyer', employer: 'Cliffe Dekker Hofmeyr', industry: 'Legal', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'JT', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Robert', surname: 'Jackson', jurisdiction: 'ZA', advisor: 'Johan Botha', nationality: 'South African', language: 'English', email: 'robert.jackson@gmail.com', cell_number: '+27 83 100 2011', gender: 'Male', title: 'Mr', occupation: 'Sales Director', employer: 'Vodacom', industry: 'Telecommunications', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'RJ', opportunity_type: 'tax-loss-harvesting' },
  { first_name: 'Amanda', surname: 'White', jurisdiction: 'ZA', advisor: 'Sarah Mostert', nationality: 'South African', language: 'English', email: 'amanda.white@outlook.com', cell_number: '+27 84 100 2012', gender: 'Female', title: 'Mrs', occupation: 'Pharmacist', employer: 'Dischem', industry: 'Healthcare', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'AW', opportunity_type: 'tax-loss-harvesting' },
  // === ZA: Legacy (3) ===
  { first_name: 'Christopher', surname: 'Lee', jurisdiction: 'ZA', advisor: 'Pieter Naudé', nationality: 'South African', language: 'English', email: 'christopher.lee@gmail.com', cell_number: '+27 82 100 2013', gender: 'Male', title: 'Mr', occupation: 'Business Owner', employer: 'Self-employed', industry: 'Retail', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'CL', opportunity_type: 'legacy-migration' },
  { first_name: 'Patricia', surname: 'Martin', jurisdiction: 'ZA', advisor: 'Linda van Wyk', nationality: 'South African', language: 'English', email: 'patricia.martin@outlook.com', cell_number: '+27 83 100 2014', gender: 'Female', title: 'Mrs', occupation: 'Retired Teacher', employer: null, industry: 'Education', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'PM', opportunity_type: 'legacy-migration' },
  { first_name: 'Daniel', surname: 'Garcia', jurisdiction: 'ZA', advisor: 'David Greenberg', nationality: 'South African', language: 'English', email: 'daniel.garcia@gmail.com', cell_number: '+27 84 100 2015', gender: 'Male', title: 'Mr', occupation: 'Chef', employer: 'Self-employed', industry: 'Hospitality', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'DG', opportunity_type: 'legacy-migration' },
  // === ZA: Fee Opt (2) ===
  { first_name: 'Steven', surname: 'Allen', jurisdiction: 'ZA', advisor: 'Johan Botha', nationality: 'South African', language: 'English', email: 'steven.allen@gmail.com', cell_number: '+27 82 100 2021', gender: 'Male', title: 'Mr', occupation: 'Investment Manager', employer: 'Coronation', industry: 'Financial Services', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'SA', opportunity_type: 'fee-optimization' },
  { first_name: 'Karen', surname: 'Young', jurisdiction: 'ZA', advisor: 'Sarah Mostert', nationality: 'South African', language: 'English', email: 'karen.young@outlook.com', cell_number: '+27 83 100 2022', gender: 'Female', title: 'Mrs', occupation: 'Dentist', employer: 'Self-employed', industry: 'Healthcare', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'KY', opportunity_type: 'fee-optimization' },
  // === ZA: Contrib (2) ===
  { first_name: 'Edward', surname: 'Adams', jurisdiction: 'ZA', advisor: 'Pieter Naudé', nationality: 'South African', language: 'English', email: 'edward.adams@gmail.com', cell_number: '+27 84 100 2027', gender: 'Male', title: 'Mr', occupation: 'Executive Director', employer: 'Anglo American', industry: 'Mining', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'EA', opportunity_type: 'contribution-opportunities' },
  { first_name: 'Ruth', surname: 'Nelson', jurisdiction: 'ZA', advisor: 'Linda van Wyk', nationality: 'South African', language: 'English', email: 'ruth.nelson@outlook.com', cell_number: '+27 82 100 2028', gender: 'Female', title: 'Mrs', occupation: 'Professor', employer: 'University of Cape Town', industry: 'Education', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'RN', opportunity_type: 'contribution-opportunities' },
  // === ZA: TLH demo clients ===
  { first_name: 'John', surname: 'Van Der Berg', jurisdiction: 'ZA', advisor: 'Johan Botha', nationality: 'South African', language: 'Afrikaans', email: 'john.vanderberg@gmail.com', cell_number: '+27 82 100 3001', gender: 'Male', title: 'Mr', occupation: 'Mining Engineer', employer: 'Gold Fields', industry: 'Mining', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'JV', opportunity_type: 'tlh' },
  { first_name: 'Maria', surname: 'Pretorius', jurisdiction: 'ZA', advisor: 'Sarah Mostert', nationality: 'South African', language: 'Afrikaans', email: 'maria.pretorius@outlook.com', cell_number: '+27 83 100 3002', gender: 'Female', title: 'Mrs', occupation: 'School Principal', employer: 'Hoërskool Stellenbosch', industry: 'Education', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'MP', opportunity_type: 'tlh' },
  { first_name: 'Susan', surname: 'Khumalo', jurisdiction: 'ZA', advisor: 'David Greenberg', nationality: 'South African', language: 'Zulu', email: 'susan.khumalo@gmail.com', cell_number: '+27 84 100 3004', gender: 'Female', title: 'Mrs', occupation: 'Bank Manager', employer: 'FNB', industry: 'Financial Services', country_of_issue: 'South Africa', tax_resident_country: 'South Africa', initials: 'SK', opportunity_type: 'tlh' },
  // === AU ===
  { first_name: 'Michelle', surname: 'Robinson', jurisdiction: 'AU', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', email: 'michelle.robinson@gmail.com', cell_number: '+61 4 1100 2016', gender: 'Female', title: 'Mrs', occupation: 'Physiotherapist', employer: 'Self-employed', industry: 'Healthcare', country_of_issue: 'Australia', tax_resident_country: 'Australia', initials: 'MR', opportunity_type: 'legacy-migration' },
  { first_name: 'Kevin', surname: 'Clark', jurisdiction: 'AU', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', email: 'kevin.clark@outlook.com', cell_number: '+61 4 2200 2017', gender: 'Male', title: 'Mr', occupation: 'Engineer', employer: 'BHP', industry: 'Mining', country_of_issue: 'Australia', tax_resident_country: 'Australia', initials: 'KC', opportunity_type: 'legacy-migration' },
  { first_name: 'Brian', surname: 'King', jurisdiction: 'AU', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', email: 'brian.king@gmail.com', cell_number: '+61 4 3300 2023', gender: 'Male', title: 'Mr', occupation: 'Solicitor', employer: 'Allens', industry: 'Legal', country_of_issue: 'Australia', tax_resident_country: 'Australia', initials: 'BK', opportunity_type: 'fee-optimization' },
  { first_name: 'Frank', surname: 'Carter', jurisdiction: 'AU', advisor: 'Sarah Thompson', nationality: 'Australian', language: 'English', email: 'frank.carter@outlook.com', cell_number: '+61 4 4400 2029', gender: 'Male', title: 'Mr', occupation: 'Pilot', employer: 'Qantas', industry: 'Aviation', country_of_issue: 'Australia', tax_resident_country: 'Australia', initials: 'FC', opportunity_type: 'contribution-opportunities' },
  { first_name: 'James', surname: 'Mitchell', jurisdiction: 'AU', advisor: 'James Mitchell', nationality: 'Australian', language: 'English', email: 'james.mitchell.client@gmail.com', cell_number: '+61 4 5500 3005', gender: 'Male', title: 'Mr', occupation: 'Accountant', employer: 'Deloitte', industry: 'Consulting', country_of_issue: 'Australia', tax_resident_country: 'Australia', initials: 'JM', opportunity_type: 'tlh' },
  // === GB ===
  { first_name: 'Nancy', surname: 'Lewis', jurisdiction: 'GB', advisor: 'Richard Blackwood', nationality: 'British', language: 'English', email: 'nancy.lewis@gmail.com', cell_number: '+44 7700 100018', gender: 'Female', title: 'Mrs', occupation: 'NHS Manager', employer: 'NHS', industry: 'Healthcare', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', initials: 'NL', opportunity_type: 'legacy-migration' },
  { first_name: 'Dorothy', surname: 'Wright', jurisdiction: 'GB', advisor: 'Richard Blackwood', nationality: 'British', language: 'English', email: 'dorothy.wright@outlook.com', cell_number: '+44 7700 100024', gender: 'Female', title: 'Mrs', occupation: 'Retired Banker', employer: null, industry: 'Financial Services', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', initials: 'DW', opportunity_type: 'fee-optimization' },
  { first_name: 'Virginia', surname: 'Mitchell', jurisdiction: 'GB', advisor: 'Emma Hartley', nationality: 'British', language: 'English', email: 'virginia.mitchell@gmail.com', cell_number: '+44 7700 100030', gender: 'Female', title: 'Ms', occupation: 'University Lecturer', employer: 'Oxford University', industry: 'Education', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', initials: 'VM', opportunity_type: 'contribution-opportunities' },
  { first_name: 'William', surname: 'Thompson', jurisdiction: 'GB', advisor: 'Richard Blackwood', nationality: 'British', language: 'English', email: 'william.thompson@gmail.com', cell_number: '+44 7700 100035', gender: 'Male', title: 'Mr', occupation: 'Barrister', employer: 'Self-employed', industry: 'Legal', country_of_issue: 'United Kingdom', tax_resident_country: 'United Kingdom', initials: 'WT', opportunity_type: 'tlh' },
  // === US ===
  { first_name: 'Mark', surname: 'Walker', jurisdiction: 'US', advisor: 'Robert Chen', nationality: 'American', language: 'English', email: 'mark.walker@gmail.com', cell_number: '+1 212 100 2019', gender: 'Male', title: 'Mr', occupation: 'VP Sales', employer: 'Salesforce', industry: 'Technology', country_of_issue: 'United States', tax_resident_country: 'United States', initials: 'MW', opportunity_type: 'legacy-migration' },
  { first_name: 'Sandra', surname: 'Hall', jurisdiction: 'US', advisor: 'Robert Chen', nationality: 'American', language: 'English', email: 'sandra.hall@outlook.com', cell_number: '+1 212 100 2020', gender: 'Female', title: 'Mrs', occupation: 'CFO', employer: 'Self-employed', industry: 'Consulting', country_of_issue: 'United States', tax_resident_country: 'United States', initials: 'SH', opportunity_type: 'legacy-migration' },
  { first_name: 'George', surname: 'Scott', jurisdiction: 'US', advisor: 'Jennifer Martinez', nationality: 'American', language: 'English', email: 'george.scott@gmail.com', cell_number: '+1 310 100 2025', gender: 'Male', title: 'Mr', occupation: 'Surgeon', employer: 'Johns Hopkins', industry: 'Healthcare', country_of_issue: 'United States', tax_resident_country: 'United States', initials: 'GS', opportunity_type: 'fee-optimization' },
  { first_name: 'Raymond', surname: 'Perez', jurisdiction: 'US', advisor: 'Jennifer Martinez', nationality: 'American', language: 'English', email: 'raymond.perez@gmail.com', cell_number: '+1 310 100 2031', gender: 'Male', title: 'Mr', occupation: 'Real Estate Developer', employer: 'Self-employed', industry: 'Real Estate', country_of_issue: 'United States', tax_resident_country: 'United States', initials: 'RP', opportunity_type: 'contribution-opportunities' },
  { first_name: 'Sarah', surname: 'Johnson', jurisdiction: 'US', advisor: 'Robert Chen', nationality: 'American', language: 'English', email: 'sarah.johnson@gmail.com', cell_number: '+1 212 100 3006', gender: 'Female', title: 'Ms', occupation: 'Portfolio Manager', employer: 'Goldman Sachs', industry: 'Financial Services', country_of_issue: 'United States', tax_resident_country: 'United States', initials: 'SJ', opportunity_type: 'tlh' },
  // === CA ===
  { first_name: 'Helen', surname: 'Green', jurisdiction: 'CA', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'English', email: 'helen.green@gmail.com', cell_number: '+1 416 100 2026', gender: 'Female', title: 'Mrs', occupation: 'Veterinarian', employer: 'Self-employed', industry: 'Healthcare', country_of_issue: 'Canada', tax_resident_country: 'Canada', initials: 'HG', opportunity_type: 'fee-optimization' },
  { first_name: 'Marc', surname: 'Leblanc', jurisdiction: 'CA', advisor: 'Pierre Tremblay', nationality: 'Canadian', language: 'French', email: 'marc.leblanc@gmail.com', cell_number: '+1 514 100 3007', gender: 'Male', title: 'Mr', occupation: 'Actuary', employer: 'Sun Life Financial', industry: 'Insurance', country_of_issue: 'Canada', tax_resident_country: 'Canada', initials: 'ML', opportunity_type: 'tlh' },
];

// ==================== PRODUCT CATEGORIES ====================
const productCategories = [
  { code: 'EQUITY_ETF', name: 'Equity ETF', description: 'Exchange-traded funds tracking equity indices' },
  { code: 'UNIT_TRUST', name: 'Unit Trust', description: 'Pooled investment vehicles' },
  { code: 'RETIREMENT_ANNUITY', name: 'Retirement Annuity', description: 'South African retirement savings vehicle' },
  { code: 'SUPERANNUATION', name: 'Superannuation', description: 'Australian retirement savings' },
  { code: 'RRSP', name: 'RRSP', description: 'Canadian Registered Retirement Savings Plan' },
  { code: 'ISA', name: 'ISA', description: 'UK Individual Savings Account' },
  { code: 'IRA', name: 'IRA/401k', description: 'US Individual Retirement Account' },
  { code: 'TFSA', name: 'Tax-Free Savings Account', description: 'Tax-free investment account' },
  { code: 'LIVING_ANNUITY', name: 'Living Annuity', description: 'Post-retirement income vehicle' },
  { code: 'DISCRETIONARY', name: 'Discretionary Portfolio', description: 'Flexible investment portfolio' },
  { code: 'PRESERVATION', name: 'Preservation Fund', description: 'Preserved retirement savings' },
];

// ==================== TLH OPPORTUNITY DATA ====================
interface TLHOppData {
  clientFirstName: string;
  clientSurname: string;
  currentFundName: string;
  currentTicker: string;
  currentFundIsin: string;
  suggestedReplacementName: string;
  suggestedReplacementIsin: string;
  purchaseValue: number;
  currentValue: number;
  unrealizedGainLoss: number;
  costBasis: number;
  holdingPeriod: string;
  washSaleOk: boolean;
  jurisdiction: string;
  estimatedTaxSavings: number;
}

const tlhOpps: TLHOppData[] = [
  { clientFirstName: 'John', clientSurname: 'Van Der Berg', currentFundName: 'Satrix Top 40 ETF', currentTicker: 'STX40', currentFundIsin: 'ZAE000018679', suggestedReplacementName: '1nvest SA Top 40 ETF', suggestedReplacementIsin: 'ZAE000234567', purchaseValue: 250000, currentValue: 237550, unrealizedGainLoss: -12450, costBasis: 250000, holdingPeriod: 'short_term', washSaleOk: true, jurisdiction: 'ZA', estimatedTaxSavings: 3486 },
  { clientFirstName: 'Maria', clientSurname: 'Pretorius', currentFundName: 'Absa NewGold ETF', currentTicker: 'GLD', currentFundIsin: 'ZAE000096541', suggestedReplacementName: '1nvest Gold ETF', suggestedReplacementIsin: 'ZAE000345678', purchaseValue: 180000, currentValue: 171080, unrealizedGainLoss: -8920, costBasis: 180000, holdingPeriod: 'long_term', washSaleOk: true, jurisdiction: 'ZA', estimatedTaxSavings: 2498 },
  { clientFirstName: 'Peter', clientSurname: 'Williams', currentFundName: 'Naspers Ltd', currentTicker: 'NPN', currentFundIsin: 'ZAE000015889', suggestedReplacementName: 'Prosus NV', suggestedReplacementIsin: 'NL0013654783', purchaseValue: 520000, currentValue: 495320, unrealizedGainLoss: -24680, costBasis: 520000, holdingPeriod: 'short_term', washSaleOk: false, jurisdiction: 'ZA', estimatedTaxSavings: 6910 },
  { clientFirstName: 'Susan', clientSurname: 'Khumalo', currentFundName: 'MTN Group', currentTicker: 'MTN', currentFundIsin: 'ZAE000042164', suggestedReplacementName: 'Vodacom Group', suggestedReplacementIsin: 'ZAE000132577', purchaseValue: 95000, currentValue: 88770, unrealizedGainLoss: -6230, costBasis: 95000, holdingPeriod: 'long_term', washSaleOk: true, jurisdiction: 'ZA', estimatedTaxSavings: 1744 },
  { clientFirstName: 'James', clientSurname: 'Mitchell', currentFundName: 'Vanguard Australian Shares ETF', currentTicker: 'VAS', currentFundIsin: 'AU0000017587', suggestedReplacementName: 'iShares Core S&P/ASX 200 ETF', suggestedReplacementIsin: 'AU000000IOZ5', purchaseValue: 185000, currentValue: 174250, unrealizedGainLoss: -10750, costBasis: 185000, holdingPeriod: 'short_term', washSaleOk: true, jurisdiction: 'AU', estimatedTaxSavings: 4945 },
  { clientFirstName: 'William', clientSurname: 'Thompson', currentFundName: 'iShares Core FTSE 100 ETF', currentTicker: 'ISF', currentFundIsin: 'IE0005042456', suggestedReplacementName: 'Vanguard FTSE 100 ETF', suggestedReplacementIsin: 'IE00B810Q511', purchaseValue: 120000, currentValue: 112400, unrealizedGainLoss: -7600, costBasis: 120000, holdingPeriod: 'long_term', washSaleOk: true, jurisdiction: 'GB', estimatedTaxSavings: 1520 },
  { clientFirstName: 'Sarah', clientSurname: 'Johnson', currentFundName: 'Vanguard S&P 500 ETF', currentTicker: 'VOO', currentFundIsin: 'US9229083632', suggestedReplacementName: 'iShares Core S&P 500 ETF', suggestedReplacementIsin: 'US4642872000', purchaseValue: 450000, currentValue: 431500, unrealizedGainLoss: -18500, costBasis: 450000, holdingPeriod: 'short_term', washSaleOk: true, jurisdiction: 'US', estimatedTaxSavings: 6845 },
  { clientFirstName: 'Marc', clientSurname: 'Leblanc', currentFundName: 'iShares S&P/TSX 60 ETF', currentTicker: 'XIU', currentFundIsin: 'CA46434G1090', suggestedReplacementName: 'BMO S&P/TSX Capped Composite ETF', suggestedReplacementIsin: 'CA05577W1014', purchaseValue: 200000, currentValue: 186800, unrealizedGainLoss: -13200, costBasis: 200000, holdingPeriod: 'long_term', washSaleOk: true, jurisdiction: 'CA', estimatedTaxSavings: 3300 },
];

// ==================== CLIENT HOLDINGS DATA ====================
interface HoldingData {
  clientFirstName: string;
  clientSurname: string;
  fundIsin: string;
  purchaseValue: number;
  currentValue: number;
  startDate: string;
  frequency: string;
  premiumAmount: number;
  status: string;
  policyNumber: string;
}

const clientHoldings: HoldingData[] = [
  // ZA TLH clients
  { clientFirstName: 'John', clientSurname: 'Smith', fundIsin: 'ZAE000018679', purchaseValue: 45000, currentValue: 42000, startDate: '2022-03-15', frequency: 'Monthly', premiumAmount: 2500, status: 'active', policyNumber: 'STX-JS-001' },
  { clientFirstName: 'John', clientSurname: 'Smith', fundIsin: 'ZAE000096541', purchaseValue: 30000, currentValue: 28500, startDate: '2021-06-01', frequency: 'Monthly', premiumAmount: 1500, status: 'active', policyNumber: 'GLD-JS-002' },
  { clientFirstName: 'Mary', clientSurname: 'Jones', fundIsin: 'ZAE000015889', purchaseValue: 32000, currentValue: 27200, startDate: '2021-09-01', frequency: 'Monthly', premiumAmount: 2000, status: 'active', policyNumber: 'NPN-MJ-001' },
  { clientFirstName: 'Mary', clientSurname: 'Jones', fundIsin: 'ZAE000042164', purchaseValue: 20000, currentValue: 18000, startDate: '2022-01-15', frequency: 'Monthly', premiumAmount: 1200, status: 'active', policyNumber: 'MTN-MJ-002' },
  { clientFirstName: 'Peter', clientSurname: 'Williams', fundIsin: 'ZAE000015889', purchaseValue: 520000, currentValue: 495320, startDate: '2023-02-01', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'NPN-PW-001' },
  { clientFirstName: 'Sarah', clientSurname: 'Brown', fundIsin: 'ZAE000018679', purchaseValue: 24000, currentValue: 21500, startDate: '2022-06-01', frequency: 'Monthly', premiumAmount: 1800, status: 'active', policyNumber: 'STX-SB-001' },
  { clientFirstName: 'David', clientSurname: 'Miller', fundIsin: 'ZAE000096541', purchaseValue: 22000, currentValue: 19800, startDate: '2021-11-01', frequency: 'Monthly', premiumAmount: 1500, status: 'active', policyNumber: 'GLD-DM-001' },
  { clientFirstName: 'Emma', clientSurname: 'Davis', fundIsin: 'ZAE000042164', purchaseValue: 20000, currentValue: 17500, startDate: '2022-08-01', frequency: 'Monthly', premiumAmount: 1200, status: 'active', policyNumber: 'MTN-ED-001' },
  // ZA TLH demo clients
  { clientFirstName: 'John', clientSurname: 'Van Der Berg', fundIsin: 'ZAE000018679', purchaseValue: 250000, currentValue: 237550, startDate: '2023-06-15', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'STX-JV-001' },
  { clientFirstName: 'Maria', clientSurname: 'Pretorius', fundIsin: 'ZAE000096541', purchaseValue: 180000, currentValue: 171080, startDate: '2021-04-01', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'GLD-MP-001' },
  { clientFirstName: 'Susan', clientSurname: 'Khumalo', fundIsin: 'ZAE000042164', purchaseValue: 95000, currentValue: 88770, startDate: '2020-09-01', frequency: 'Monthly', premiumAmount: 5000, status: 'active', policyNumber: 'MTN-SK-001' },
  // ZA Legacy clients
  { clientFirstName: 'Christopher', clientSurname: 'Lee', fundIsin: 'ZAE000018679', purchaseValue: 35000, currentValue: 33000, startDate: '2019-03-01', frequency: 'Monthly', premiumAmount: 2000, status: 'active', policyNumber: 'STX-CL-001' },
  { clientFirstName: 'Patricia', clientSurname: 'Martin', fundIsin: 'ZAE000096541', purchaseValue: 30000, currentValue: 28000, startDate: '2018-06-01', frequency: 'Monthly', premiumAmount: 1500, status: 'active', policyNumber: 'GLD-PM-001' },
  // ZA Fee Opt clients
  { clientFirstName: 'Steven', clientSurname: 'Allen', fundIsin: 'ZAE000015889', purchaseValue: 32000, currentValue: 29500, startDate: '2020-01-15', frequency: 'Monthly', premiumAmount: 2500, status: 'active', policyNumber: 'NPN-SA-001' },
  // ZA Contrib clients
  { clientFirstName: 'Edward', clientSurname: 'Adams', fundIsin: 'ZAE000018679', purchaseValue: 30000, currentValue: 32000, startDate: '2021-01-01', frequency: 'Monthly', premiumAmount: 3000, status: 'active', policyNumber: 'STX-EA-001' },
  // AU clients
  { clientFirstName: 'James', clientSurname: 'Mitchell', fundIsin: 'AU0000017587', purchaseValue: 185000, currentValue: 174250, startDate: '2023-03-01', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'VAS-JM-001' },
  { clientFirstName: 'Michelle', clientSurname: 'Robinson', fundIsin: 'AU000000IOZ5', purchaseValue: 25000, currentValue: 23500, startDate: '2021-07-01', frequency: 'Monthly', premiumAmount: 1500, status: 'active', policyNumber: 'IOZ-MR-001' },
  { clientFirstName: 'Kevin', clientSurname: 'Clark', fundIsin: 'AU000000BHP4', purchaseValue: 22000, currentValue: 20500, startDate: '2022-02-01', frequency: 'Monthly', premiumAmount: 1200, status: 'active', policyNumber: 'BHP-KC-001' },
  { clientFirstName: 'Brian', clientSurname: 'King', fundIsin: 'AU0000017587', purchaseValue: 22000, currentValue: 21000, startDate: '2021-09-01', frequency: 'Monthly', premiumAmount: 1500, status: 'active', policyNumber: 'VAS-BK-001' },
  { clientFirstName: 'Frank', clientSurname: 'Carter', fundIsin: 'AU000000CBA7', purchaseValue: 18000, currentValue: 19500, startDate: '2022-06-01', frequency: 'Monthly', premiumAmount: 1000, status: 'active', policyNumber: 'CBA-FC-001' },
  // GB clients
  { clientFirstName: 'William', clientSurname: 'Thompson', fundIsin: 'IE0005042456', purchaseValue: 120000, currentValue: 112400, startDate: '2020-11-01', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'ISF-WT-001' },
  { clientFirstName: 'Nancy', clientSurname: 'Lewis', fundIsin: 'IE0005042456', purchaseValue: 18000, currentValue: 17000, startDate: '2021-04-01', frequency: 'Monthly', premiumAmount: 1200, status: 'active', policyNumber: 'ISF-NL-001' },
  { clientFirstName: 'Dorothy', clientSurname: 'Wright', fundIsin: 'IE00B810Q511', purchaseValue: 18000, currentValue: 17500, startDate: '2020-08-01', frequency: 'Monthly', premiumAmount: 1000, status: 'active', policyNumber: 'VUKE-DW-001' },
  { clientFirstName: 'Virginia', clientSurname: 'Mitchell', fundIsin: 'IE0005042456', purchaseValue: 14000, currentValue: 15000, startDate: '2022-01-01', frequency: 'Monthly', premiumAmount: 800, status: 'active', policyNumber: 'ISF-VM-001' },
  // US clients
  { clientFirstName: 'Sarah', clientSurname: 'Johnson', fundIsin: 'US9229083632', purchaseValue: 450000, currentValue: 431500, startDate: '2023-09-01', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'VOO-SJ-001' },
  { clientFirstName: 'Mark', clientSurname: 'Walker', fundIsin: 'US9229083632', purchaseValue: 12000, currentValue: 11500, startDate: '2022-04-01', frequency: 'Monthly', premiumAmount: 800, status: 'active', policyNumber: 'VOO-MW-001' },
  { clientFirstName: 'Sandra', clientSurname: 'Hall', fundIsin: 'US4642872000', purchaseValue: 10000, currentValue: 10500, startDate: '2021-12-01', frequency: 'Monthly', premiumAmount: 600, status: 'active', policyNumber: 'IVV-SH-001' },
  { clientFirstName: 'George', clientSurname: 'Scott', fundIsin: 'US9229083632', purchaseValue: 12000, currentValue: 11800, startDate: '2022-07-01', frequency: 'Monthly', premiumAmount: 1000, status: 'active', policyNumber: 'VOO-GS-001' },
  { clientFirstName: 'Raymond', clientSurname: 'Perez', fundIsin: 'US4642872000', purchaseValue: 8000, currentValue: 8500, startDate: '2023-01-01', frequency: 'Monthly', premiumAmount: 500, status: 'active', policyNumber: 'IVV-RP-001' },
  // CA clients
  { clientFirstName: 'Marc', clientSurname: 'Leblanc', fundIsin: 'CA46434G1090', purchaseValue: 200000, currentValue: 186800, startDate: '2021-08-01', frequency: 'Annually', premiumAmount: 0, status: 'active', policyNumber: 'XIU-ML-001' },
  { clientFirstName: 'Helen', clientSurname: 'Green', fundIsin: 'CA05577W1014', purchaseValue: 8000, currentValue: 7800, startDate: '2022-05-01', frequency: 'Monthly', premiumAmount: 500, status: 'active', policyNumber: 'ZCN-HG-001' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Auth
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = user.id;
    console.log(`[seed-tlh-clients] Starting seed for user ${userId}`);

    const summary: Record<string, number> = {};

    // ============ STEP A: Seed ASX + TSX + missing instruments ============
    const allInstruments = [...asxInstruments, ...tsxInstruments, ...missingInstruments];
    
    // Get existing ISINs
    const { data: existingFunds } = await supabase
      .from('admin_funds')
      .select('isin')
      .eq('user_id', userId)
      .not('isin', 'is', null);
    
    const existingIsins = new Set((existingFunds || []).map(f => f.isin));
    const newInstruments = allInstruments.filter(i => !existingIsins.has(i.isin));

    if (newInstruments.length > 0) {
      const instrumentsToInsert = newInstruments.map(i => ({
        user_id: userId,
        name: i.name,
        code: i.code,
        isin: i.isin,
        exchange: i.exchange,
        sector: i.sector,
        industry: i.industry,
        fund_type: i.fund_type,
        fund_manager: i.fund_manager || null,
        is_active: true,
        source: 'seed-tlh-clients',
      }));

      const { error: instrError } = await supabase.from('admin_funds').insert(instrumentsToInsert);
      if (instrError) console.error('[seed-tlh-clients] Instrument insert error:', instrError);
      summary.instruments_added = newInstruments.length;
    } else {
      summary.instruments_added = 0;
    }
    console.log(`[seed-tlh-clients] Instruments: ${summary.instruments_added} added`);

    // ============ STEP B: Seed opportunity + TLH clients ============
    const { data: existingClients } = await supabase
      .from('clients')
      .select('first_name, surname')
      .eq('user_id', userId);

    const existingSet = new Set(
      (existingClients || []).map(c => `${c.first_name.toLowerCase()}|${c.surname.toLowerCase()}`)
    );

    const newClients = opportunityClients.filter(c =>
      !existingSet.has(`${c.first_name.toLowerCase()}|${c.surname.toLowerCase()}`)
    );

    if (newClients.length > 0) {
      const clientsToInsert = newClients.map(c => ({
        user_id: userId,
        first_name: c.first_name,
        surname: c.surname,
        advisor: c.advisor,
        nationality: c.nationality,
        language: c.language,
        email: c.email,
        cell_number: c.cell_number,
        gender: c.gender,
        title: c.title,
        occupation: c.occupation,
        employer: c.employer,
        industry: c.industry,
        country_of_issue: c.country_of_issue,
        tax_resident_country: c.tax_resident_country,
        initials: c.initials,
        client_type: 'individual',
        profile_state: 'active',
        profile_type: 'Client',
        preferred_contact: 'Cell',
      }));

      const { error: clientError } = await supabase.from('clients').insert(clientsToInsert);
      if (clientError) console.error('[seed-tlh-clients] Client insert error:', clientError);
      summary.clients_added = newClients.length;
    } else {
      summary.clients_added = 0;
    }
    console.log(`[seed-tlh-clients] Clients: ${summary.clients_added} added`);

    // ============ STEP C: Build client name → UUID mapping ============
    const allClientNames = opportunityClients.map(c => c.surname);
    const { data: allSeededClients } = await supabase
      .from('clients')
      .select('id, first_name, surname')
      .eq('user_id', userId)
      .in('surname', [...new Set(allClientNames)]);

    const clientMap = new Map<string, string>();
    (allSeededClients || []).forEach(c => {
      clientMap.set(`${c.first_name.toLowerCase()}|${c.surname.toLowerCase()}`, c.id);
    });
    console.log(`[seed-tlh-clients] Client mapping: ${clientMap.size} clients mapped`);

    // ============ STEP D: Seed product categories ============
    const { data: existingCategories } = await supabase
      .from('product_categories')
      .select('code')
      .eq('user_id', userId);

    const existingCodes = new Set((existingCategories || []).map(c => c.code));
    const newCategories = productCategories.filter(c => !existingCodes.has(c.code));

    if (newCategories.length > 0) {
      const categoriesToInsert = newCategories.map(c => ({
        user_id: userId,
        code: c.code,
        name: c.name,
        description: c.description,
        is_active: true,
      }));

      const { error: catError } = await supabase.from('product_categories').insert(categoriesToInsert);
      if (catError) console.error('[seed-tlh-clients] Category insert error:', catError);
      summary.categories_added = newCategories.length;
    } else {
      summary.categories_added = 0;
    }
    console.log(`[seed-tlh-clients] Categories: ${summary.categories_added} added`);

    // ============ STEP E: Seed client_products (holdings) ============
    // Get all admin_funds for ISIN lookup
    const { data: allFunds } = await supabase
      .from('admin_funds')
      .select('id, isin, name')
      .eq('user_id', userId)
      .not('isin', 'is', null);

    const fundIsinMap = new Map<string, { id: string; name: string }>();
    (allFunds || []).forEach(f => {
      if (f.isin) fundIsinMap.set(f.isin, { id: f.id, name: f.name });
    });

    // Get categories for product creation
    const { data: allCategories } = await supabase
      .from('product_categories')
      .select('id, code')
      .eq('user_id', userId);
    
    const categoryMap = new Map<string, string>();
    (allCategories || []).forEach(c => {
      categoryMap.set(c.code, c.id);
    });

    // Check for existing client_products to avoid duplicates
    const { data: existingProducts } = await supabase
      .from('client_products')
      .select('policy_number')
      .eq('user_id', userId)
      .not('policy_number', 'is', null);

    const existingPolicies = new Set((existingProducts || []).map(p => p.policy_number));

    const holdingsToInsert: any[] = [];
    for (const h of clientHoldings) {
      if (existingPolicies.has(h.policyNumber)) continue;

      const clientKey = `${h.clientFirstName.toLowerCase()}|${h.clientSurname.toLowerCase()}`;
      const clientId = clientMap.get(clientKey);
      if (!clientId) {
        console.warn(`[seed-tlh-clients] Client not found for holding: ${h.clientFirstName} ${h.clientSurname}`);
        continue;
      }

      holdingsToInsert.push({
        user_id: userId,
        client_id: clientId,
        policy_number: h.policyNumber,
        current_value: h.currentValue,
        premium_amount: h.premiumAmount > 0 ? h.premiumAmount : null,
        frequency: h.frequency,
        start_date: h.startDate,
        status: h.status,
        role: 'owner',
        notes: `Seeded holding. Purchase value: ${h.purchaseValue}. Fund ISIN: ${h.fundIsin}`,
      });
    }

    if (holdingsToInsert.length > 0) {
      const { error: holdError } = await supabase.from('client_products').insert(holdingsToInsert);
      if (holdError) console.error('[seed-tlh-clients] Holdings insert error:', holdError);
      summary.holdings_added = holdingsToInsert.length;
    } else {
      summary.holdings_added = 0;
    }
    console.log(`[seed-tlh-clients] Holdings: ${summary.holdings_added} added`);

    // ============ STEP F: Seed tlh_opportunities ============
    const { data: existingOpps } = await supabase
      .from('tlh_opportunities')
      .select('client_name')
      .eq('user_id', userId);

    const existingOppNames = new Set((existingOpps || []).map(o => o.client_name.toLowerCase()));

    const oppsToInsert: any[] = [];
    for (const opp of tlhOpps) {
      const clientName = `${opp.clientFirstName} ${opp.clientSurname}`;
      if (existingOppNames.has(clientName.toLowerCase())) continue;

      const clientKey = `${opp.clientFirstName.toLowerCase()}|${opp.clientSurname.toLowerCase()}`;
      const clientId = clientMap.get(clientKey) || null;

      const currentFund = fundIsinMap.get(opp.currentFundIsin);
      const replacementFund = fundIsinMap.get(opp.suggestedReplacementIsin);

      oppsToInsert.push({
        user_id: userId,
        client_id: clientId,
        client_name: clientName,
        current_fund_name: opp.currentFundName,
        current_ticker: opp.currentTicker,
        current_fund_id: currentFund?.id || null,
        suggested_replacement_name: opp.suggestedReplacementName,
        suggested_replacement_id: replacementFund?.id || null,
        purchase_value: opp.purchaseValue,
        current_value: opp.currentValue,
        unrealized_gain_loss: opp.unrealizedGainLoss,
        cost_basis: opp.costBasis,
        holding_period: opp.holdingPeriod,
        wash_sale_ok: opp.washSaleOk,
        jurisdiction: opp.jurisdiction,
        estimated_tax_savings: opp.estimatedTaxSavings,
        status: 'new',
      });
    }

    if (oppsToInsert.length > 0) {
      const { error: oppError } = await supabase.from('tlh_opportunities').insert(oppsToInsert);
      if (oppError) console.error('[seed-tlh-clients] TLH opportunities insert error:', oppError);
      summary.tlh_opportunities_added = oppsToInsert.length;
    } else {
      summary.tlh_opportunities_added = 0;
    }
    console.log(`[seed-tlh-clients] TLH Opportunities: ${summary.tlh_opportunities_added} added`);

    console.log('[seed-tlh-clients] Seed complete:', summary);

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[seed-tlh-clients] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
