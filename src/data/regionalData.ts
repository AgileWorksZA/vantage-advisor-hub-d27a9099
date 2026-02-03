export interface ProviderData {
  name: string;
  bookPercent: string;
  value: string;
}

export interface TopAccountData {
  investor: string;
  bookPercent: string;
  value: string;
  advisorInitials: string; // Which advisor manages this account
}

export interface BirthdayData {
  name: string;
  nextBirthday: string;
  age: number;
  advisorInitials: string; // Which advisor manages this client
}

export interface ProductData {
  name: string;
  value: number;
  color: string;
}

export interface ClientsByValueData {
  range: string;
  value: string;
  investors: number;
}

export interface AdvisorData {
  initials: string;
  name: string;
  aum: number; // Their portion of totalAUM
  clientCount: number; // Number of clients they manage
}

export interface TaskData {
  id: string;
  clientName: string;
  taskType: string;
  title: string;
  dueDate: string;
  followupDate: string;
  status: "In Progress" | "Not Started" | "Completed";
  lastComment?: string;
  advisorInitials: string;
  advisorName: string;
  assigneeName: string;
  isUrgent?: boolean;
  isOverdue?: boolean;
}

export interface RegionalData {
  currencySymbol: string;
  totalAUM: string;
  totalAUMNumber: number; // For calculations
  providers: ProviderData[];
  topAccounts: TopAccountData[];
  birthdays: BirthdayData[];
  products: ProductData[];
  clientsByValue: ClientsByValueData[];
  advisors: AdvisorData[];
  tasks: TaskData[];
}

// Helper to format currency
function formatCurrency(value: number, symbol: string): string {
  return `${symbol} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Helper to format AUM with decimals
function formatAUM(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper to calculate book percentage
function calcBookPercent(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)} %`;
}

const southAfricaData: RegionalData = {
  currencySymbol: "R",
  totalAUM: "3,667,726,572.38",
  totalAUMNumber: 3667726572.38,
  providers: [
    { name: "Ninety One", bookPercent: "55.3 %", value: "R 2,026,539,331" },
    { name: "Old Mutual International", bookPercent: "10.6 %", value: "R 387,751,193" },
    { name: "Allan Gray", bookPercent: "9.5 %", value: "R 348,470,019" },
    { name: "Sanlam Glacier", bookPercent: "4.9 %", value: "R 178,833,622" },
    { name: "Investec Corporate Cash", bookPercent: "3.8 %", value: "R 139,656,065" },
  ],
  topAccounts: [
    { investor: "NG Kerk Sinode Oos-Kaapland", bookPercent: "1.1 %", value: "R 41,926,360", advisorInitials: "JB" },
    { investor: "Van Niekerk, Marthinus", bookPercent: "0.7 %", value: "R 26,500,000", advisorInitials: "JB" },
    { investor: "Venter, Isabella", bookPercent: "0.7 %", value: "R 24,800,000", advisorInitials: "JB" },
    { investor: "De Villiers, Jean", bookPercent: "1.0 %", value: "R 36,258,037", advisorInitials: "SM" },
    { investor: "Joubert, Francois", bookPercent: "0.6 %", value: "R 23,100,000", advisorInitials: "SM" },
    { investor: "Steyn, Chanelle", bookPercent: "0.6 %", value: "R 21,400,000", advisorInitials: "SM" },
    { investor: "Louw, Rudolph", bookPercent: "0.9 %", value: "R 34,277,494", advisorInitials: "PN" },
    { investor: "Le Roux, Werner", bookPercent: "0.5 %", value: "R 19,700,000", advisorInitials: "PN" },
    { investor: "Marais, Annika", bookPercent: "0.5 %", value: "R 18,000,000", advisorInitials: "PN" },
    { investor: "Daan Van Der Sijde", bookPercent: "0.9 %", value: "R 31,913,926", advisorInitials: "LV" },
    { investor: "Pretorius, Johannes", bookPercent: "0.4 %", value: "R 16,300,000", advisorInitials: "LV" },
    { investor: "Du Toit, Lizelle", bookPercent: "0.4 %", value: "R 14,600,000", advisorInitials: "LV" },
    { investor: "Philippus Koon", bookPercent: "0.8 %", value: "R 28,160,600", advisorInitials: "DG" },
    { investor: "Coetzee, Hendrik", bookPercent: "0.4 %", value: "R 12,900,000", advisorInitials: "DG" },
    { investor: "Jacobs, Marlene", bookPercent: "0.3 %", value: "R 11,200,000", advisorInitials: "DG" },
  ],
  birthdays: [
    { name: "Andre Thomas Coetzer", nextBirthday: "28 January", age: 42, advisorInitials: "JB" },
    { name: "Esther Amanda Nieman", nextBirthday: "28 January", age: 74, advisorInitials: "JB" },
    { name: "Petrus Jacobus Botha", nextBirthday: "29 January", age: 55, advisorInitials: "JB" },
    { name: "Maria Susanna van Zyl", nextBirthday: "29 January", age: 48, advisorInitials: "JB" },
    { name: "Elsie Sophia Lourens", nextBirthday: "28 January", age: 65, advisorInitials: "SM" },
    { name: "Melia Nocwaka Malgas", nextBirthday: "28 January", age: 73, advisorInitials: "SM" },
    { name: "Hendrik Willem Venter", nextBirthday: "30 January", age: 62, advisorInitials: "SM" },
    { name: "Anna Elizabeth Joubert", nextBirthday: "30 January", age: 51, advisorInitials: "SM" },
    { name: "Samuel de Jager", nextBirthday: "28 January", age: 69, advisorInitials: "PN" },
    { name: "Denise Thiart", nextBirthday: "28 January", age: 69, advisorInitials: "PN" },
    { name: "Gideon Francois Steyn", nextBirthday: "31 January", age: 44, advisorInitials: "PN" },
    { name: "Catharina Maria le Roux", nextBirthday: "31 January", age: 59, advisorInitials: "PN" },
    { name: "Elana Wasmuth", nextBirthday: "28 January", age: 34, advisorInitials: "LV" },
    { name: "Elizabeth Saunders", nextBirthday: "28 January", age: 77, advisorInitials: "LV" },
    { name: "Barend Johannes Marais", nextBirthday: "1 February", age: 67, advisorInitials: "LV" },
    { name: "Susanna Petronella du Toit", nextBirthday: "1 February", age: 43, advisorInitials: "LV" },
    { name: "Angeline Loraine Mostert", nextBirthday: "28 January", age: 63, advisorInitials: "DG" },
    { name: "Zonwabele Harry Molefe", nextBirthday: "28 January", age: 64, advisorInitials: "DG" },
    { name: "Willem Adriaan Coetzee", nextBirthday: "2 February", age: 56, advisorInitials: "DG" },
    { name: "Johanna Cornelia Jacobs", nextBirthday: "2 February", age: 38, advisorInitials: "DG" },
  ],
  products: [
    { name: "Cash Management", value: 12.2, color: "hsl(210, 70%, 40%)" },
    { name: "Endowment", value: 14.0, color: "hsl(142, 76%, 36%)" },
    { name: "Investment Plan", value: 5.8, color: "hsl(45, 93%, 47%)" },
    { name: "Living Annuity", value: 21.2, color: "hsl(280, 65%, 50%)" },
    { name: "Other", value: 1.3, color: "hsl(0, 0%, 60%)" },
    { name: "Pension Preservation Fund", value: 5.9, color: "hsl(210, 100%, 50%)" },
    { name: "Preservation Fund", value: 39.1, color: "hsl(160, 60%, 45%)" },
    { name: "Provident Preservation Fund", value: 0.5, color: "hsl(18, 86%, 56%)" },
  ],
  clientsByValue: [
    { range: "R0 – R100 000", value: "R 15,579,983", investors: 468 },
    { range: "R100 001 – R1M", value: "R 371,511,255", investors: 850 },
    { range: "R1 000 001 – R3M", value: "R 831,330,967", investors: 469 },
    { range: "R3 000 001 – R10M", value: "R 1,501,814,056", investors: 286 },
    { range: "> R10M", value: "R 947,490,312", investors: 52 },
  ],
  advisors: [
    { initials: "JB", name: "Johan Botha", aum: 980000000, clientCount: 425 },
    { initials: "SM", name: "Sarah Mostert", aum: 850000000, clientCount: 380 },
    { initials: "PN", name: "Pieter Naudé", aum: 720000000, clientCount: 340 },
    { initials: "LV", name: "Linda van Wyk", aum: 650000000, clientCount: 310 },
    { initials: "DG", name: "David Greenberg", aum: 467726572.38, clientCount: 270 },
  ],
  tasks: [
    { id: "Onboard-81443", clientName: "Van Niekerk, Marthinus", taskType: "Client onboarding", title: "Client onboarding", dueDate: "21/05/2025", followupDate: "19/05/2025", status: "In Progress", lastComment: "", advisorInitials: "JB", advisorName: "Johan Botha", assigneeName: "Johan Botha", isUrgent: false, isOverdue: false },
    { id: "CRM-95294", clientName: "Venter, Isabella", taskType: "Claim", title: "Claim vir huis", dueDate: "04/08/2025", followupDate: "21/08/2025", status: "Not Started", lastComment: "", advisorInitials: "JB", advisorName: "Johan Botha", assigneeName: "Johan Botha", isUrgent: false, isOverdue: false },
    { id: "Task-95188", clientName: "Joubert, Francois", taskType: "Transfer", title: "Transfer to Ninety One", dueDate: "15/08/2025", followupDate: "13/08/2025", status: "In Progress", lastComment: "Documents received", advisorInitials: "SM", advisorName: "Sarah Mostert", assigneeName: "Sarah Mostert", isUrgent: false, isOverdue: false },
    { id: "CRM-96774", clientName: "Le Roux, Werner", taskType: "Annuity review", title: "Annual review", dueDate: "01/09/2025", followupDate: "18/09/2025", status: "Not Started", lastComment: "", advisorInitials: "PN", advisorName: "Pieter Naudé", assigneeName: "Pieter Naudé", isUrgent: false, isOverdue: false },
    { id: "Trans-42156", clientName: "Steyn, Chanelle", taskType: "Additional Contribution", title: "Additional contribution processing", dueDate: "12/01/2025", followupDate: "10/01/2025", status: "In Progress", lastComment: "Awaiting client signature", advisorInitials: "SM", advisorName: "Sarah Mostert", assigneeName: "Sarah Mostert", isUrgent: true, isOverdue: true },
    { id: "CRM-88321", clientName: "Du Toit, Lizelle", taskType: "Quote", title: "Life cover quote", dueDate: "25/02/2025", followupDate: "23/02/2025", status: "Not Started", lastComment: "", advisorInitials: "LV", advisorName: "Linda van Wyk", assigneeName: "Linda van Wyk", isUrgent: false, isOverdue: true },
    { id: "Onboard-79882", clientName: "Pretorius, Johannes", taskType: "Client onboarding", title: "New client onboarding", dueDate: "18/03/2025", followupDate: "16/03/2025", status: "In Progress", lastComment: "FICA pending", advisorInitials: "LV", advisorName: "Linda van Wyk", assigneeName: "Linda van Wyk", isUrgent: false, isOverdue: false },
    { id: "Task-67291", clientName: "Coetzee, Hendrik", taskType: "Switch", title: "Fund switch request", dueDate: "05/04/2025", followupDate: "03/04/2025", status: "Not Started", lastComment: "", advisorInitials: "DG", advisorName: "David Greenberg", assigneeName: "David Greenberg", isUrgent: false, isOverdue: false },
    { id: "CRM-91823", clientName: "Jacobs, Marlene", taskType: "New Business", title: "Investment application", dueDate: "22/04/2025", followupDate: "20/04/2025", status: "In Progress", lastComment: "Under review", advisorInitials: "DG", advisorName: "David Greenberg", assigneeName: "David Greenberg", isUrgent: false, isOverdue: false },
    { id: "Trans-55672", clientName: "Marais, Annika", taskType: "Transfer", title: "Pension transfer", dueDate: "08/05/2025", followupDate: "06/05/2025", status: "Not Started", lastComment: "", advisorInitials: "PN", advisorName: "Pieter Naudé", assigneeName: "Pieter Naudé", isUrgent: false, isOverdue: false },
    { id: "CRM-73419", clientName: "De Villiers, Jean", taskType: "Annuity review", title: "Portfolio review", dueDate: "30/01/2025", followupDate: "28/01/2025", status: "Completed", lastComment: "Completed successfully", advisorInitials: "SM", advisorName: "Sarah Mostert", assigneeName: "Sarah Mostert", isUrgent: false, isOverdue: false },
    { id: "Task-84521", clientName: "Louw, Rudolph", taskType: "Claim", title: "Death benefit claim", dueDate: "15/02/2025", followupDate: "13/02/2025", status: "In Progress", lastComment: "Documentation submitted", advisorInitials: "PN", advisorName: "Pieter Naudé", assigneeName: "Pieter Naudé", isUrgent: true, isOverdue: true },
    { id: "Onboard-92134", clientName: "Daan Van Der Sijde", taskType: "Client onboarding", title: "Corporate client setup", dueDate: "10/06/2025", followupDate: "08/06/2025", status: "Not Started", lastComment: "", advisorInitials: "LV", advisorName: "Linda van Wyk", assigneeName: "Linda van Wyk", isUrgent: false, isOverdue: false },
    { id: "CRM-68745", clientName: "Philippus Koon", taskType: "Quote", title: "Retirement annuity quote", dueDate: "28/06/2025", followupDate: "26/06/2025", status: "In Progress", lastComment: "Awaiting provider response", advisorInitials: "DG", advisorName: "David Greenberg", assigneeName: "David Greenberg", isUrgent: false, isOverdue: false },
    { id: "Trans-39821", clientName: "NG Kerk Sinode Oos-Kaapland", taskType: "Additional Contribution", title: "Annual contribution", dueDate: "15/07/2025", followupDate: "13/07/2025", status: "Not Started", lastComment: "", advisorInitials: "JB", advisorName: "Johan Botha", assigneeName: "Johan Botha", isUrgent: false, isOverdue: false },
  ],
};

const australiaData: RegionalData = {
  currencySymbol: "A$",
  totalAUM: "4,389,625,872.00",
  totalAUMNumber: 4389625872,
  providers: [
    { name: "Macquarie Wrap", bookPercent: "42.1 %", value: "A$ 1,847,293,441" },
    { name: "AMP North", bookPercent: "18.3 %", value: "A$ 803,156,229" },
    { name: "BT Wrap", bookPercent: "15.7 %", value: "A$ 689,321,847" },
    { name: "Colonial First State", bookPercent: "12.4 %", value: "A$ 544,871,203" },
    { name: "Hub24", bookPercent: "11.5 %", value: "A$ 504,983,152" },
  ],
  topAccounts: [
    { investor: "Melbourne Grammar School Foundation", bookPercent: "1.3 %", value: "A$ 57,182,342", advisorInitials: "JM" },
    { investor: "Papadopoulos, Konstantinos", bookPercent: "0.7 %", value: "A$ 28,500,000", advisorInitials: "JM" },
    { investor: "Nguyen, David", bookPercent: "0.6 %", value: "A$ 26,200,000", advisorInitials: "JM" },
    { investor: "O'Connor, Michael", bookPercent: "1.1 %", value: "A$ 48,347,892", advisorInitials: "ST" },
    { investor: "Romano, Giuseppe", bookPercent: "0.6 %", value: "A$ 24,800,000", advisorInitials: "ST" },
    { investor: "Chen, William", bookPercent: "0.5 %", value: "A$ 22,500,000", advisorInitials: "ST" },
    { investor: "Thompson, Sarah", bookPercent: "0.9 %", value: "A$ 39,506,633", advisorInitials: "MO" },
    { investor: "Kelly, Brendan", bookPercent: "0.5 %", value: "A$ 20,300,000", advisorInitials: "MO" },
    { investor: "Patel, Rajesh", bookPercent: "0.4 %", value: "A$ 18,100,000", advisorInitials: "MO" },
    { investor: "Williams, David", bookPercent: "0.8 %", value: "A$ 35,117,007", advisorInitials: "EA" },
    { investor: "Stavros, Helena", bookPercent: "0.4 %", value: "A$ 16,500,000", advisorInitials: "EA" },
    { investor: "Morrison, Andrew", bookPercent: "0.3 %", value: "A$ 14,200,000", advisorInitials: "EA" },
    { investor: "Brown, Jennifer", bookPercent: "0.7 %", value: "A$ 30,727,381", advisorInitials: "TM" },
    { investor: "Lee, Benjamin", bookPercent: "0.3 %", value: "A$ 12,800,000", advisorInitials: "TM" },
    { investor: "Walsh, Catherine", bookPercent: "0.2 %", value: "A$ 11,400,000", advisorInitials: "TM" },
  ],
  birthdays: [
    { name: "William James Mitchell", nextBirthday: "3 February", age: 58, advisorInitials: "JM" },
    { name: "Charlotte Grace Wilson", nextBirthday: "5 February", age: 55, advisorInitials: "JM" },
    { name: "Konstantinos Papadopoulos", nextBirthday: "8 February", age: 62, advisorInitials: "JM" },
    { name: "Mai Linh Nguyen", nextBirthday: "9 February", age: 45, advisorInitials: "JM" },
    { name: "Sarah Elizabeth Thompson", nextBirthday: "3 February", age: 44, advisorInitials: "ST" },
    { name: "Thomas Edward Murphy", nextBirthday: "6 February", age: 48, advisorInitials: "ST" },
    { name: "Giuseppe Romano", nextBirthday: "10 February", age: 57, advisorInitials: "ST" },
    { name: "Sophia Chen", nextBirthday: "11 February", age: 41, advisorInitials: "ST" },
    { name: "James Robert O'Brien", nextBirthday: "4 February", age: 52, advisorInitials: "MO" },
    { name: "Olivia Jane Campbell", nextBirthday: "6 February", age: 42, advisorInitials: "MO" },
    { name: "Brendan Patrick Kelly", nextBirthday: "12 February", age: 63, advisorInitials: "MO" },
    { name: "Priya Patel", nextBirthday: "13 February", age: 38, advisorInitials: "MO" },
    { name: "Emily Rose Anderson", nextBirthday: "4 February", age: 37, advisorInitials: "EA" },
    { name: "Henry William Scott", nextBirthday: "7 February", age: 67, advisorInitials: "EA" },
    { name: "Helena Maria Stavros", nextBirthday: "14 February", age: 54, advisorInitials: "EA" },
    { name: "Andrew James Morrison", nextBirthday: "15 February", age: 49, advisorInitials: "EA" },
    { name: "Michael Patrick Kelly", nextBirthday: "5 February", age: 61, advisorInitials: "TM" },
    { name: "Sophie Anne Martin", nextBirthday: "7 February", age: 39, advisorInitials: "TM" },
    { name: "Benjamin Wei Lee", nextBirthday: "16 February", age: 46, advisorInitials: "TM" },
    { name: "Catherine Mary Walsh", nextBirthday: "17 February", age: 59, advisorInitials: "TM" },
  ],
  products: [
    { name: "Superannuation", value: 35.2, color: "hsl(210, 70%, 40%)" },
    { name: "SMSF", value: 22.8, color: "hsl(142, 76%, 36%)" },
    { name: "Pension Phase", value: 18.4, color: "hsl(45, 93%, 47%)" },
    { name: "Investment Bond", value: 12.1, color: "hsl(280, 65%, 50%)" },
    { name: "Managed Fund", value: 6.8, color: "hsl(0, 0%, 60%)" },
    { name: "Direct Shares", value: 3.2, color: "hsl(210, 100%, 50%)" },
    { name: "Term Deposit", value: 1.5, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "A$0 – A$100,000", value: "A$ 18,947,231", investors: 512 },
    { range: "A$100,001 – A$500K", value: "A$ 284,127,582", investors: 723 },
    { range: "A$500,001 – A$1M", value: "A$ 567,834,291", investors: 682 },
    { range: "A$1M – A$5M", value: "A$ 1,892,471,038", investors: 518 },
    { range: "> A$5M", value: "A$ 1,626,245,730", investors: 89 },
  ],
  advisors: [
    { initials: "JM", name: "James Mitchell", aum: 1100000000, clientCount: 512 },
    { initials: "ST", name: "Sarah Thompson", aum: 950000000, clientCount: 480 },
    { initials: "MO", name: "Michael O'Brien", aum: 820000000, clientCount: 445 },
    { initials: "EA", name: "Emily Anderson", aum: 780000000, clientCount: 420 },
    { initials: "TM", name: "Thomas Murphy", aum: 739625872, clientCount: 367 },
  ],
  tasks: [
    { id: "Onboard-91234", clientName: "Papadopoulos, Konstantinos", taskType: "Client onboarding", title: "Super fund setup", dueDate: "18/05/2025", followupDate: "16/05/2025", status: "In Progress", lastComment: "TFN declaration received", advisorInitials: "JM", advisorName: "James Mitchell", assigneeName: "James Mitchell", isUrgent: false, isOverdue: false },
    { id: "CRM-82341", clientName: "Nguyen, David", taskType: "SMSF setup", title: "SMSF establishment", dueDate: "02/06/2025", followupDate: "31/05/2025", status: "Not Started", lastComment: "", advisorInitials: "JM", advisorName: "James Mitchell", assigneeName: "James Mitchell", isUrgent: false, isOverdue: false },
    { id: "Task-73456", clientName: "O'Connor, Michael", taskType: "Pension transition", title: "Account based pension", dueDate: "25/03/2025", followupDate: "23/03/2025", status: "In Progress", lastComment: "Condition of release confirmed", advisorInitials: "ST", advisorName: "Sarah Thompson", assigneeName: "Sarah Thompson", isUrgent: false, isOverdue: false },
    { id: "CRM-64521", clientName: "Romano, Giuseppe", taskType: "Review", title: "Annual super review", dueDate: "10/07/2025", followupDate: "08/07/2025", status: "Not Started", lastComment: "", advisorInitials: "ST", advisorName: "Sarah Thompson", assigneeName: "Sarah Thompson", isUrgent: false, isOverdue: false },
    { id: "Trans-58912", clientName: "Chen, William", taskType: "Rollover", title: "Super rollover request", dueDate: "15/01/2025", followupDate: "13/01/2025", status: "In Progress", lastComment: "Awaiting previous fund", advisorInitials: "MO", advisorName: "Michael O'Brien", assigneeName: "Michael O'Brien", isUrgent: true, isOverdue: true },
    { id: "CRM-49823", clientName: "Thompson, Sarah", taskType: "Insurance", title: "Life cover review", dueDate: "28/02/2025", followupDate: "26/02/2025", status: "Not Started", lastComment: "", advisorInitials: "MO", advisorName: "Michael O'Brien", assigneeName: "Michael O'Brien", isUrgent: false, isOverdue: true },
    { id: "Onboard-85621", clientName: "Kelly, Brendan", taskType: "Client onboarding", title: "New client setup", dueDate: "05/04/2025", followupDate: "03/04/2025", status: "In Progress", lastComment: "ID verified", advisorInitials: "EA", advisorName: "Emily Anderson", assigneeName: "Emily Anderson", isUrgent: false, isOverdue: false },
    { id: "Task-76543", clientName: "Patel, Rajesh", taskType: "Contribution", title: "Salary sacrifice setup", dueDate: "20/04/2025", followupDate: "18/04/2025", status: "Not Started", lastComment: "", advisorInitials: "EA", advisorName: "Emily Anderson", assigneeName: "Emily Anderson", isUrgent: false, isOverdue: false },
    { id: "CRM-67891", clientName: "Williams, David", taskType: "Estate planning", title: "Binding nomination update", dueDate: "12/05/2025", followupDate: "10/05/2025", status: "In Progress", lastComment: "Form sent to client", advisorInitials: "TM", advisorName: "Thomas Murphy", assigneeName: "Thomas Murphy", isUrgent: false, isOverdue: false },
    { id: "Trans-43217", clientName: "Stavros, Helena", taskType: "Transfer", title: "Platform transfer", dueDate: "30/05/2025", followupDate: "28/05/2025", status: "Not Started", lastComment: "", advisorInitials: "TM", advisorName: "Thomas Murphy", assigneeName: "Thomas Murphy", isUrgent: false, isOverdue: false },
    { id: "CRM-91456", clientName: "Morrison, Andrew", taskType: "Review", title: "Investment strategy review", dueDate: "18/06/2025", followupDate: "16/06/2025", status: "Completed", lastComment: "Review completed", advisorInitials: "EA", advisorName: "Emily Anderson", assigneeName: "Emily Anderson", isUrgent: false, isOverdue: false },
    { id: "Task-82134", clientName: "Brown, Jennifer", taskType: "Claim", title: "TPD claim assistance", dueDate: "08/02/2025", followupDate: "06/02/2025", status: "In Progress", lastComment: "Medical evidence submitted", advisorInitials: "TM", advisorName: "Thomas Murphy", assigneeName: "Thomas Murphy", isUrgent: true, isOverdue: true },
    { id: "Onboard-74892", clientName: "Lee, Benjamin", taskType: "Client onboarding", title: "Corporate super member", dueDate: "25/06/2025", followupDate: "23/06/2025", status: "Not Started", lastComment: "", advisorInitials: "JM", advisorName: "James Mitchell", assigneeName: "James Mitchell", isUrgent: false, isOverdue: false },
    { id: "CRM-58234", clientName: "Walsh, Catherine", taskType: "Quote", title: "Income protection quote", dueDate: "10/07/2025", followupDate: "08/07/2025", status: "In Progress", lastComment: "Underwriting in progress", advisorInitials: "ST", advisorName: "Sarah Thompson", assigneeName: "Sarah Thompson", isUrgent: false, isOverdue: false },
    { id: "Trans-36781", clientName: "Melbourne Grammar School Foundation", taskType: "Contribution", title: "Annual contribution processing", dueDate: "22/07/2025", followupDate: "20/07/2025", status: "Not Started", lastComment: "", advisorInitials: "JM", advisorName: "James Mitchell", assigneeName: "James Mitchell", isUrgent: false, isOverdue: false },
  ],
};

const canadaData: RegionalData = {
  currencySymbol: "C$",
  totalAUM: "5,572,649,990.00",
  totalAUMNumber: 5572649990,
  providers: [
    { name: "RBC Dominion Securities", bookPercent: "32.4 %", value: "C$ 1,805,538,597" },
    { name: "TD Wealth Private", bookPercent: "24.8 %", value: "C$ 1,382,016,998" },
    { name: "CIBC Wood Gundy", bookPercent: "18.2 %", value: "C$ 1,014,222,298" },
    { name: "BMO Nesbitt Burns", bookPercent: "14.1 %", value: "C$ 785,743,649" },
    { name: "National Bank Financial", bookPercent: "10.5 %", value: "C$ 585,128,449" },
  ],
  topAccounts: [
    { investor: "Toronto General Hospital Foundation", bookPercent: "1.4 %", value: "C$ 78,017,100", advisorInitials: "PT" },
    { investor: "Lavoie, Jean-François", bookPercent: "0.7 %", value: "C$ 38,500,000", advisorInitials: "PT" },
    { investor: "Bergeron, Émilie", bookPercent: "0.6 %", value: "C$ 35,200,000", advisorInitials: "PT" },
    { investor: "Tremblay, Pierre", bookPercent: "1.2 %", value: "C$ 66,871,800", advisorInitials: "MB" },
    { investor: "Wong, David", bookPercent: "0.6 %", value: "C$ 32,800,000", advisorInitials: "MB" },
    { investor: "Kim, Jennifer", bookPercent: "0.5 %", value: "C$ 29,500,000", advisorInitials: "MB" },
    { investor: "Roy, Marie-Claire", bookPercent: "1.0 %", value: "C$ 55,726,500", advisorInitials: "JM" },
    { investor: "Campbell, Alexander", bookPercent: "0.5 %", value: "C$ 27,200,000", advisorInitials: "JM" },
    { investor: "O'Brien, Kathleen", bookPercent: "0.4 %", value: "C$ 24,100,000", advisorInitials: "JM" },
    { investor: "Gagnon, Jean-Luc", bookPercent: "0.9 %", value: "C$ 50,153,850", advisorInitials: "SG" },
    { investor: "Patel, Arun", bookPercent: "0.4 %", value: "C$ 21,800,000", advisorInitials: "SG" },
    { investor: "Leblanc, Nathalie", bookPercent: "0.3 %", value: "C$ 18,600,000", advisorInitials: "SG" },
    { investor: "MacDonald, Angus", bookPercent: "0.8 %", value: "C$ 44,581,200", advisorInitials: "RS" },
    { investor: "Singh, Harpreet", bookPercent: "0.3 %", value: "C$ 16,400,000", advisorInitials: "RS" },
    { investor: "Dumont, Jacques", bookPercent: "0.3 %", value: "C$ 14,200,000", advisorInitials: "RS" },
  ],
  birthdays: [
    { name: "Pierre Antoine Tremblay", nextBirthday: "4 February", age: 56, advisorInitials: "PT" },
    { name: "Catherine Marie Roy", nextBirthday: "6 February", age: 67, advisorInitials: "PT" },
    { name: "Jean-François Lavoie", nextBirthday: "9 February", age: 52, advisorInitials: "PT" },
    { name: "Émilie Bergeron", nextBirthday: "10 February", age: 43, advisorInitials: "PT" },
    { name: "Marie-Claire Bouchard", nextBirthday: "4 February", age: 48, advisorInitials: "MB" },
    { name: "David Chen Wong", nextBirthday: "7 February", age: 45, advisorInitials: "MB" },
    { name: "Wei Lin Chen", nextBirthday: "11 February", age: 61, advisorInitials: "MB" },
    { name: "Jennifer Soo-Yeon Kim", nextBirthday: "12 February", age: 39, advisorInitials: "MB" },
    { name: "James William MacDonald", nextBirthday: "5 February", age: 63, advisorInitials: "JM" },
    { name: "Elizabeth Anne Thompson", nextBirthday: "7 February", age: 59, advisorInitials: "JM" },
    { name: "Alexander Scott Campbell", nextBirthday: "13 February", age: 54, advisorInitials: "JM" },
    { name: "Kathleen Mary O'Brien", nextBirthday: "14 February", age: 47, advisorInitials: "JM" },
    { name: "Sophie Anne Gagnon", nextBirthday: "5 February", age: 41, advisorInitials: "SG" },
    { name: "François Xavier Leblanc", nextBirthday: "8 February", age: 72, advisorInitials: "SG" },
    { name: "Arun Kumar Patel", nextBirthday: "15 February", age: 58, advisorInitials: "SG" },
    { name: "Nathalie Anne Leblanc", nextBirthday: "16 February", age: 44, advisorInitials: "SG" },
    { name: "Robert Michael Singh", nextBirthday: "6 February", age: 54, advisorInitials: "RS" },
    { name: "Jennifer Mary O'Brien", nextBirthday: "8 February", age: 38, advisorInitials: "RS" },
    { name: "Harpreet Kaur Singh", nextBirthday: "17 February", age: 49, advisorInitials: "RS" },
    { name: "Jacques Henri Dumont", nextBirthday: "18 February", age: 66, advisorInitials: "RS" },
  ],
  products: [
    { name: "RRSP", value: 28.4, color: "hsl(210, 70%, 40%)" },
    { name: "TFSA", value: 19.2, color: "hsl(142, 76%, 36%)" },
    { name: "RRIF", value: 16.8, color: "hsl(45, 93%, 47%)" },
    { name: "Non-Registered", value: 14.5, color: "hsl(280, 65%, 50%)" },
    { name: "RESP", value: 8.3, color: "hsl(0, 0%, 60%)" },
    { name: "LIRA", value: 7.2, color: "hsl(210, 100%, 50%)" },
    { name: "Corporate Account", value: 5.6, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "C$0 – C$100,000", value: "C$ 22,290,600", investors: 534 },
    { range: "C$100,001 – C$500K", value: "C$ 334,358,999", investors: 812 },
    { range: "C$500,001 – C$1M", value: "C$ 668,717,999", investors: 756 },
    { range: "C$1M – C$5M", value: "C$ 2,229,059,996", investors: 623 },
    { range: "> C$5M", value: "C$ 2,318,222,396", investors: 142 },
  ],
  advisors: [
    { initials: "PT", name: "Pierre Tremblay", aum: 1400000000, clientCount: 578 },
    { initials: "MB", name: "Marie Bouchard", aum: 1200000000, clientCount: 534 },
    { initials: "JM", name: "James MacDonald", aum: 1100000000, clientCount: 512 },
    { initials: "SG", name: "Sophie Gagnon", aum: 950000000, clientCount: 467 },
    { initials: "RS", name: "Robert Singh", aum: 922649990, clientCount: 376 },
  ],
  tasks: [
    { id: "Onboard-71234", clientName: "Lavoie, Jean-François", taskType: "Client onboarding", title: "RRSP account setup", dueDate: "15/05/2025", followupDate: "13/05/2025", status: "In Progress", lastComment: "SIN verified", advisorInitials: "PT", advisorName: "Pierre Tremblay", assigneeName: "Pierre Tremblay", isUrgent: false, isOverdue: false },
    { id: "CRM-62345", clientName: "Bergeron, Émilie", taskType: "TFSA", title: "TFSA contribution", dueDate: "28/05/2025", followupDate: "26/05/2025", status: "Not Started", lastComment: "", advisorInitials: "PT", advisorName: "Pierre Tremblay", assigneeName: "Pierre Tremblay", isUrgent: false, isOverdue: false },
    { id: "Task-53456", clientName: "Wong, David", taskType: "Transfer", title: "LIRA transfer", dueDate: "10/04/2025", followupDate: "08/04/2025", status: "In Progress", lastComment: "Transfer form submitted", advisorInitials: "MB", advisorName: "Marie Bouchard", assigneeName: "Marie Bouchard", isUrgent: false, isOverdue: false },
    { id: "CRM-44567", clientName: "Kim, Jennifer", taskType: "RESP", title: "RESP contribution", dueDate: "22/06/2025", followupDate: "20/06/2025", status: "Not Started", lastComment: "", advisorInitials: "MB", advisorName: "Marie Bouchard", assigneeName: "Marie Bouchard", isUrgent: false, isOverdue: false },
    { id: "Trans-35678", clientName: "Campbell, Alexander", taskType: "RRIF", title: "RRIF conversion", dueDate: "05/02/2025", followupDate: "03/02/2025", status: "In Progress", lastComment: "Age requirement met", advisorInitials: "JM", advisorName: "James MacDonald", assigneeName: "James MacDonald", isUrgent: true, isOverdue: true },
    { id: "CRM-26789", clientName: "O'Brien, Kathleen", taskType: "Review", title: "Annual portfolio review", dueDate: "18/02/2025", followupDate: "16/02/2025", status: "Not Started", lastComment: "", advisorInitials: "JM", advisorName: "James MacDonald", assigneeName: "James MacDonald", isUrgent: false, isOverdue: true },
    { id: "Onboard-17891", clientName: "Patel, Arun", taskType: "Client onboarding", title: "New client intake", dueDate: "02/04/2025", followupDate: "31/03/2025", status: "In Progress", lastComment: "KYC completed", advisorInitials: "SG", advisorName: "Sophie Gagnon", assigneeName: "Sophie Gagnon", isUrgent: false, isOverdue: false },
    { id: "Task-98123", clientName: "Leblanc, Nathalie", taskType: "Insurance", title: "Critical illness quote", dueDate: "15/04/2025", followupDate: "13/04/2025", status: "Not Started", lastComment: "", advisorInitials: "SG", advisorName: "Sophie Gagnon", assigneeName: "Sophie Gagnon", isUrgent: false, isOverdue: false },
    { id: "CRM-89234", clientName: "Singh, Harpreet", taskType: "Tax planning", title: "Tax optimization review", dueDate: "28/04/2025", followupDate: "26/04/2025", status: "In Progress", lastComment: "Tax returns received", advisorInitials: "RS", advisorName: "Robert Singh", assigneeName: "Robert Singh", isUrgent: false, isOverdue: false },
    { id: "Trans-71345", clientName: "Dumont, Jacques", taskType: "Transfer", title: "Account consolidation", dueDate: "10/05/2025", followupDate: "08/05/2025", status: "Not Started", lastComment: "", advisorInitials: "RS", advisorName: "Robert Singh", assigneeName: "Robert Singh", isUrgent: false, isOverdue: false },
    { id: "CRM-62456", clientName: "Tremblay, Pierre", taskType: "Review", title: "Estate planning review", dueDate: "25/05/2025", followupDate: "23/05/2025", status: "Completed", lastComment: "Plan updated", advisorInitials: "PT", advisorName: "Pierre Tremblay", assigneeName: "Pierre Tremblay", isUrgent: false, isOverdue: false },
    { id: "Task-53567", clientName: "Roy, Marie-Claire", taskType: "Claim", title: "Insurance claim", dueDate: "08/01/2025", followupDate: "06/01/2025", status: "In Progress", lastComment: "Claim under review", advisorInitials: "JM", advisorName: "James MacDonald", assigneeName: "James MacDonald", isUrgent: true, isOverdue: true },
    { id: "Onboard-44678", clientName: "Gagnon, Jean-Luc", taskType: "Client onboarding", title: "Corporate account setup", dueDate: "18/06/2025", followupDate: "16/06/2025", status: "Not Started", lastComment: "", advisorInitials: "SG", advisorName: "Sophie Gagnon", assigneeName: "Sophie Gagnon", isUrgent: false, isOverdue: false },
    { id: "CRM-35789", clientName: "MacDonald, Angus", taskType: "Quote", title: "Disability insurance quote", dueDate: "02/07/2025", followupDate: "30/06/2025", status: "In Progress", lastComment: "Medical questionnaire sent", advisorInitials: "RS", advisorName: "Robert Singh", assigneeName: "Robert Singh", isUrgent: false, isOverdue: false },
    { id: "Trans-26891", clientName: "Toronto General Hospital Foundation", taskType: "Contribution", title: "Annual charitable contribution", dueDate: "15/07/2025", followupDate: "13/07/2025", status: "Not Started", lastComment: "", advisorInitials: "PT", advisorName: "Pierre Tremblay", assigneeName: "Pierre Tremblay", isUrgent: false, isOverdue: false },
  ],
};

const unitedKingdomData: RegionalData = {
  currencySymbol: "£",
  totalAUM: "2,847,392,156.00",
  totalAUMNumber: 2847392156,
  providers: [
    { name: "Hargreaves Lansdown", bookPercent: "36.2 %", value: "£ 1,030,755,960" },
    { name: "AJ Bell Youinvest", bookPercent: "22.4 %", value: "£ 637,815,843" },
    { name: "Interactive Investor", bookPercent: "17.8 %", value: "£ 506,835,644" },
    { name: "Fidelity Personal Investing", bookPercent: "13.1 %", value: "£ 373,008,372" },
    { name: "Vanguard UK", bookPercent: "10.5 %", value: "£ 298,976,176" },
  ],
  topAccounts: [
    { investor: "The Royal Foundation", bookPercent: "1.5 %", value: "£ 42,710,882", advisorInitials: "WS" },
    { investor: "Thompson, Richard", bookPercent: "0.7 %", value: "£ 19,800,000", advisorInitials: "WS" },
    { investor: "Khan, Amir", bookPercent: "0.6 %", value: "£ 17,500,000", advisorInitials: "WS" },
    { investor: "Smith, William", bookPercent: "1.2 %", value: "£ 34,168,706", advisorInitials: "EJ" },
    { investor: "Patel, Meera", bookPercent: "0.5 %", value: "£ 15,200,000", advisorInitials: "EJ" },
    { investor: "O'Sullivan, Patrick", bookPercent: "0.5 %", value: "£ 13,800,000", advisorInitials: "EJ" },
    { investor: "Jones, Elizabeth", bookPercent: "1.0 %", value: "£ 28,473,922", advisorInitials: "TW" },
    { investor: "Murphy, Ciara", bookPercent: "0.4 %", value: "£ 12,400,000", advisorInitials: "TW" },
    { investor: "Okonkwo, Chidi", bookPercent: "0.4 %", value: "£ 11,200,000", advisorInitials: "TW" },
    { investor: "Williams, Thomas", bookPercent: "0.9 %", value: "£ 25,626,529", advisorInitials: "VB" },
    { investor: "Kaur, Simran", bookPercent: "0.3 %", value: "£ 9,800,000", advisorInitials: "VB" },
    { investor: "Campbell, Fiona", bookPercent: "0.3 %", value: "£ 8,600,000", advisorInitials: "VB" },
    { investor: "Taylor, James", bookPercent: "0.8 %", value: "£ 22,779,137", advisorInitials: "JT" },
    { investor: "Kowalski, Marta", bookPercent: "0.3 %", value: "£ 7,400,000", advisorInitials: "JT" },
    { investor: "Ahmed, Fatima", bookPercent: "0.2 %", value: "£ 6,200,000", advisorInitials: "JT" },
  ],
  birthdays: [
    { name: "William Arthur Smith", nextBirthday: "5 February", age: 64, advisorInitials: "WS" },
    { name: "Charlotte Emma Davies", nextBirthday: "7 February", age: 43, advisorInitials: "WS" },
    { name: "Richard James Thompson", nextBirthday: "10 February", age: 57, advisorInitials: "WS" },
    { name: "Amir Hassan Khan", nextBirthday: "11 February", age: 49, advisorInitials: "WS" },
    { name: "Elizabeth Mary Jones", nextBirthday: "5 February", age: 52, advisorInitials: "EJ" },
    { name: "George Henry Wilson", nextBirthday: "8 February", age: 66, advisorInitials: "EJ" },
    { name: "Meera Anand Patel", nextBirthday: "12 February", age: 44, advisorInitials: "EJ" },
    { name: "Patrick Francis O'Sullivan", nextBirthday: "13 February", age: 61, advisorInitials: "EJ" },
    { name: "Thomas Edward Williams", nextBirthday: "6 February", age: 47, advisorInitials: "TW" },
    { name: "Amelia Rose Evans", nextBirthday: "8 February", age: 39, advisorInitials: "TW" },
    { name: "Ciara Anne Murphy", nextBirthday: "14 February", age: 53, advisorInitials: "TW" },
    { name: "Chidi Emmanuel Okonkwo", nextBirthday: "15 February", age: 46, advisorInitials: "TW" },
    { name: "Victoria Anne Brown", nextBirthday: "6 February", age: 58, advisorInitials: "VB" },
    { name: "Oliver Charles Thomas", nextBirthday: "9 February", age: 55, advisorInitials: "VB" },
    { name: "Simran Kaur Singh", nextBirthday: "16 February", age: 42, advisorInitials: "VB" },
    { name: "Fiona Margaret Campbell", nextBirthday: "17 February", age: 68, advisorInitials: "VB" },
    { name: "James Robert Taylor", nextBirthday: "7 February", age: 71, advisorInitials: "JT" },
    { name: "Isabella Grace Roberts", nextBirthday: "9 February", age: 48, advisorInitials: "JT" },
    { name: "Marta Anna Kowalski", nextBirthday: "18 February", age: 51, advisorInitials: "JT" },
    { name: "Fatima Zahra Ahmed", nextBirthday: "19 February", age: 37, advisorInitials: "JT" },
  ],
  products: [
    { name: "Stocks & Shares ISA", value: 31.5, color: "hsl(210, 70%, 40%)" },
    { name: "SIPP", value: 24.8, color: "hsl(142, 76%, 36%)" },
    { name: "General Investment Account", value: 18.2, color: "hsl(45, 93%, 47%)" },
    { name: "Junior ISA", value: 8.7, color: "hsl(280, 65%, 50%)" },
    { name: "Cash ISA", value: 7.4, color: "hsl(0, 0%, 60%)" },
    { name: "Lifetime ISA", value: 5.2, color: "hsl(210, 100%, 50%)" },
    { name: "Offshore Bond", value: 4.2, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "£0 – £50,000", value: "£ 14,236,961", investors: 423 },
    { range: "£50,001 – £250K", value: "£ 199,317,451", investors: 687 },
    { range: "£250,001 – £500K", value: "£ 398,634,902", investors: 542 },
    { range: "£500,001 – £2M", value: "£ 1,138,956,862", investors: 398 },
    { range: "> £2M", value: "£ 1,096,245,980", investors: 76 },
  ],
  advisors: [
    { initials: "WS", name: "William Smith", aum: 710000000, clientCount: 430 },
    { initials: "EJ", name: "Elizabeth Jones", aum: 620000000, clientCount: 412 },
    { initials: "TW", name: "Thomas Williams", aum: 580000000, clientCount: 398 },
    { initials: "VB", name: "Victoria Brown", aum: 520000000, clientCount: 378 },
    { initials: "JT", name: "James Taylor", aum: 417392156, clientCount: 308 },
  ],
  tasks: [
    { id: "Onboard-81234", clientName: "Smith, William", taskType: "Client onboarding", title: "ISA account setup", dueDate: "20/05/2025", followupDate: "18/05/2025", status: "In Progress", lastComment: "NI number verified", advisorInitials: "WS", advisorName: "William Smith", assigneeName: "William Smith", isUrgent: false, isOverdue: false },
    { id: "CRM-72345", clientName: "Jones, Elizabeth", taskType: "SIPP", title: "SIPP contribution", dueDate: "05/06/2025", followupDate: "03/06/2025", status: "Not Started", lastComment: "", advisorInitials: "WS", advisorName: "William Smith", assigneeName: "William Smith", isUrgent: false, isOverdue: false },
    { id: "Task-63456", clientName: "Williams, Thomas", taskType: "Transfer", title: "Pension transfer", dueDate: "18/04/2025", followupDate: "16/04/2025", status: "In Progress", lastComment: "CETV received", advisorInitials: "EJ", advisorName: "Elizabeth Jones", assigneeName: "Elizabeth Jones", isUrgent: false, isOverdue: false },
    { id: "CRM-54567", clientName: "Brown, Victoria", taskType: "ISA", title: "ISA top-up", dueDate: "30/06/2025", followupDate: "28/06/2025", status: "Not Started", lastComment: "", advisorInitials: "EJ", advisorName: "Elizabeth Jones", assigneeName: "Elizabeth Jones", isUrgent: false, isOverdue: false },
    { id: "Trans-45678", clientName: "Taylor, James", taskType: "Drawdown", title: "Pension drawdown setup", dueDate: "12/02/2025", followupDate: "10/02/2025", status: "In Progress", lastComment: "FAD options reviewed", advisorInitials: "TW", advisorName: "Thomas Williams", assigneeName: "Thomas Williams", isUrgent: true, isOverdue: true },
    { id: "CRM-36789", clientName: "Wilson, Charles", taskType: "Review", title: "Annual portfolio review", dueDate: "25/02/2025", followupDate: "23/02/2025", status: "Not Started", lastComment: "", advisorInitials: "TW", advisorName: "Thomas Williams", assigneeName: "Thomas Williams", isUrgent: false, isOverdue: true },
    { id: "Onboard-27891", clientName: "Davies, Margaret", taskType: "Client onboarding", title: "New client setup", dueDate: "08/04/2025", followupDate: "06/04/2025", status: "In Progress", lastComment: "AML checks complete", advisorInitials: "VB", advisorName: "Victoria Brown", assigneeName: "Victoria Brown", isUrgent: false, isOverdue: false },
    { id: "Task-18912", clientName: "Evans, Robert", taskType: "Insurance", title: "Life cover review", dueDate: "22/04/2025", followupDate: "20/04/2025", status: "Not Started", lastComment: "", advisorInitials: "VB", advisorName: "Victoria Brown", assigneeName: "Victoria Brown", isUrgent: false, isOverdue: false },
    { id: "CRM-99123", clientName: "Thomas, Patricia", taskType: "Tax planning", title: "CGT mitigation", dueDate: "05/05/2025", followupDate: "03/05/2025", status: "In Progress", lastComment: "Gains calculated", advisorInitials: "JT", advisorName: "James Taylor", assigneeName: "James Taylor", isUrgent: false, isOverdue: false },
    { id: "Trans-81234", clientName: "Roberts, Henry", taskType: "Transfer", title: "Platform consolidation", dueDate: "18/05/2025", followupDate: "16/05/2025", status: "Not Started", lastComment: "", advisorInitials: "JT", advisorName: "James Taylor", assigneeName: "James Taylor", isUrgent: false, isOverdue: false },
    { id: "CRM-72345", clientName: "Walker, Elizabeth", taskType: "Review", title: "Retirement planning review", dueDate: "02/06/2025", followupDate: "31/05/2025", status: "Completed", lastComment: "Plan finalised", advisorInitials: "WS", advisorName: "William Smith", assigneeName: "William Smith", isUrgent: false, isOverdue: false },
    { id: "Task-63456", clientName: "Wright, Andrew", taskType: "Claim", title: "Critical illness claim", dueDate: "15/01/2025", followupDate: "13/01/2025", status: "In Progress", lastComment: "Medical evidence submitted", advisorInitials: "EJ", advisorName: "Elizabeth Jones", assigneeName: "Elizabeth Jones", isUrgent: true, isOverdue: true },
    { id: "Onboard-54567", clientName: "Green, Sophie", taskType: "Client onboarding", title: "Junior ISA setup", dueDate: "25/06/2025", followupDate: "23/06/2025", status: "Not Started", lastComment: "", advisorInitials: "VB", advisorName: "Victoria Brown", assigneeName: "Victoria Brown", isUrgent: false, isOverdue: false },
    { id: "CRM-45678", clientName: "Hall, Richard", taskType: "Quote", title: "Income protection quote", dueDate: "10/07/2025", followupDate: "08/07/2025", status: "In Progress", lastComment: "Underwriting in progress", advisorInitials: "TW", advisorName: "Thomas Williams", assigneeName: "Thomas Williams", isUrgent: false, isOverdue: false },
    { id: "Trans-36789", clientName: "King, Catherine", taskType: "Contribution", title: "Pension contribution", dueDate: "22/07/2025", followupDate: "20/07/2025", status: "Not Started", lastComment: "", advisorInitials: "JT", advisorName: "James Taylor", assigneeName: "James Taylor", isUrgent: false, isOverdue: false },
  ],
};

const unitedStatesData: RegionalData = {
  currencySymbol: "$",
  totalAUM: "5,572,649,990.00",
  totalAUMNumber: 5572649990,
  providers: [
    { name: "Fidelity Investments", bookPercent: "38.7 %", value: "$ 2,156,595,346" },
    { name: "Charles Schwab", bookPercent: "24.2 %", value: "$ 1,348,581,298" },
    { name: "Vanguard", bookPercent: "19.8 %", value: "$ 1,103,384,498" },
    { name: "TD Ameritrade", bookPercent: "10.1 %", value: "$ 562,837,649" },
    { name: "E*TRADE", bookPercent: "7.2 %", value: "$ 401,250,719" },
  ],
  topAccounts: [
    { investor: "St. Mary's Hospital Foundation", bookPercent: "1.4 %", value: "$ 78,017,100", advisorInitials: "MJ" },
    { investor: "Chen, Wei", bookPercent: "0.7 %", value: "$ 38,500,000", advisorInitials: "MJ" },
    { investor: "Washington, Marcus", bookPercent: "0.6 %", value: "$ 35,200,000", advisorInitials: "MJ" },
    { investor: "Johnson, Robert", bookPercent: "1.2 %", value: "$ 66,871,800", advisorInitials: "JW" },
    { investor: "Hernandez, Carlos", bookPercent: "0.6 %", value: "$ 32,800,000", advisorInitials: "JW" },
    { investor: "Kim, Jennifer", bookPercent: "0.5 %", value: "$ 29,500,000", advisorInitials: "JW" },
    { investor: "Williams, Patricia", bookPercent: "1.0 %", value: "$ 55,726,500", advisorInitials: "RB" },
    { investor: "Patel, Vikram", bookPercent: "0.5 %", value: "$ 27,200,000", advisorInitials: "RB" },
    { investor: "O'Connor, Sean", bookPercent: "0.4 %", value: "$ 24,100,000", advisorInitials: "RB" },
    { investor: "Garcia, Miguel", bookPercent: "0.9 %", value: "$ 50,153,850", advisorInitials: "MG" },
    { investor: "Washington, Angela", bookPercent: "0.4 %", value: "$ 21,800,000", advisorInitials: "MG" },
    { investor: "Nakamura, Kenji", bookPercent: "0.3 %", value: "$ 18,600,000", advisorInitials: "MG" },
    { investor: "Martinez, Isabella", bookPercent: "0.8 %", value: "$ 44,581,200", advisorInitials: "WD" },
    { investor: "Rodriguez, Sofia", bookPercent: "0.3 %", value: "$ 16,400,000", advisorInitials: "WD" },
    { investor: "Thompson, Jamal", bookPercent: "0.3 %", value: "$ 14,200,000", advisorInitials: "WD" },
  ],
  birthdays: [
    { name: "Michael David Johnson", nextBirthday: "5 February", age: 52, advisorInitials: "MJ" },
    { name: "Patricia Ann Martinez", nextBirthday: "7 February", age: 53, advisorInitials: "MJ" },
    { name: "Wei Chen", nextBirthday: "10 February", age: 48, advisorInitials: "MJ" },
    { name: "Marcus Anthony Washington", nextBirthday: "11 February", age: 62, advisorInitials: "MJ" },
    { name: "Jennifer Marie Williams", nextBirthday: "5 February", age: 47, advisorInitials: "JW" },
    { name: "James Michael Wilson", nextBirthday: "8 February", age: 67, advisorInitials: "JW" },
    { name: "Carlos Eduardo Hernandez", nextBirthday: "12 February", age: 54, advisorInitials: "JW" },
    { name: "Jennifer Soo-Min Kim", nextBirthday: "13 February", age: 41, advisorInitials: "JW" },
    { name: "Robert James Brown", nextBirthday: "6 February", age: 61, advisorInitials: "RB" },
    { name: "Linda Sue Anderson", nextBirthday: "8 February", age: 49, advisorInitials: "RB" },
    { name: "Vikram Raj Patel", nextBirthday: "14 February", age: 57, advisorInitials: "RB" },
    { name: "Sean Patrick O'Connor", nextBirthday: "15 February", age: 44, advisorInitials: "RB" },
    { name: "Maria Elena Garcia", nextBirthday: "6 February", age: 44, advisorInitials: "MG" },
    { name: "David Lee Thompson", nextBirthday: "9 February", age: 72, advisorInitials: "MG" },
    { name: "Angela Marie Washington", nextBirthday: "16 February", age: 51, advisorInitials: "MG" },
    { name: "Kenji Nakamura", nextBirthday: "17 February", age: 59, advisorInitials: "MG" },
    { name: "William Thomas Davis", nextBirthday: "7 February", age: 58, advisorInitials: "WD" },
    { name: "Susan Marie Jackson", nextBirthday: "9 February", age: 56, advisorInitials: "WD" },
    { name: "Sofia Elena Rodriguez", nextBirthday: "18 February", age: 38, advisorInitials: "WD" },
    { name: "Jamal DeShawn Thompson", nextBirthday: "19 February", age: 46, advisorInitials: "WD" },
  ],
  products: [
    { name: "401(k)", value: 32.1, color: "hsl(210, 70%, 40%)" },
    { name: "Traditional IRA", value: 24.3, color: "hsl(142, 76%, 36%)" },
    { name: "Roth IRA", value: 18.9, color: "hsl(45, 93%, 47%)" },
    { name: "Brokerage Account", value: 12.4, color: "hsl(280, 65%, 50%)" },
    { name: "529 Plan", value: 6.8, color: "hsl(0, 0%, 60%)" },
    { name: "SEP IRA", value: 3.2, color: "hsl(210, 100%, 50%)" },
    { name: "HSA", value: 2.3, color: "hsl(160, 60%, 45%)" },
  ],
  clientsByValue: [
    { range: "$0 – $100,000", value: "$ 22,290,600", investors: 498 },
    { range: "$100,001 – $500K", value: "$ 334,358,999", investors: 756 },
    { range: "$500,001 – $1M", value: "$ 668,717,999", investors: 684 },
    { range: "$1M – $5M", value: "$ 2,229,059,996", investors: 547 },
    { range: "> $5M", value: "$ 2,318,222,396", investors: 118 },
  ],
  advisors: [
    { initials: "MJ", name: "Michael Johnson", aum: 1400000000, clientCount: 534 },
    { initials: "JW", name: "Jennifer Williams", aum: 1200000000, clientCount: 498 },
    { initials: "RB", name: "Robert Brown", aum: 1100000000, clientCount: 467 },
    { initials: "MG", name: "Maria Garcia", aum: 950000000, clientCount: 412 },
    { initials: "WD", name: "William Davis", aum: 922649990, clientCount: 392 },
  ],
  tasks: [
    { id: "Onboard-91234", clientName: "Johnson, Michael", taskType: "Client onboarding", title: "401(k) rollover setup", dueDate: "22/05/2025", followupDate: "20/05/2025", status: "In Progress", lastComment: "SSN verified", advisorInitials: "MJ", advisorName: "Michael Johnson", assigneeName: "Michael Johnson", isUrgent: false, isOverdue: false },
    { id: "CRM-82345", clientName: "Williams, Patricia", taskType: "IRA", title: "Roth conversion", dueDate: "08/06/2025", followupDate: "06/06/2025", status: "Not Started", lastComment: "", advisorInitials: "MJ", advisorName: "Michael Johnson", assigneeName: "Michael Johnson", isUrgent: false, isOverdue: false },
    { id: "Task-73456", clientName: "Brown, Robert", taskType: "Transfer", title: "401(k) rollover", dueDate: "20/04/2025", followupDate: "18/04/2025", status: "In Progress", lastComment: "Prior plan contacted", advisorInitials: "JW", advisorName: "Jennifer Williams", assigneeName: "Jennifer Williams", isUrgent: false, isOverdue: false },
    { id: "CRM-64567", clientName: "Garcia, Maria", taskType: "529 Plan", title: "529 contribution", dueDate: "02/07/2025", followupDate: "30/06/2025", status: "Not Started", lastComment: "", advisorInitials: "JW", advisorName: "Jennifer Williams", assigneeName: "Jennifer Williams", isUrgent: false, isOverdue: false },
    { id: "Trans-55678", clientName: "Martinez, David", taskType: "RMD", title: "Required minimum distribution", dueDate: "15/02/2025", followupDate: "13/02/2025", status: "In Progress", lastComment: "Calculation complete", advisorInitials: "RB", advisorName: "Robert Brown", assigneeName: "Robert Brown", isUrgent: true, isOverdue: true },
    { id: "CRM-46789", clientName: "Anderson, Susan", taskType: "Review", title: "Annual portfolio review", dueDate: "28/02/2025", followupDate: "26/02/2025", status: "Not Started", lastComment: "", advisorInitials: "RB", advisorName: "Robert Brown", assigneeName: "Robert Brown", isUrgent: false, isOverdue: true },
    { id: "Onboard-37891", clientName: "Taylor, Christopher", taskType: "Client onboarding", title: "New client intake", dueDate: "10/04/2025", followupDate: "08/04/2025", status: "In Progress", lastComment: "W-9 received", advisorInitials: "MG", advisorName: "Maria Garcia", assigneeName: "Maria Garcia", isUrgent: false, isOverdue: false },
    { id: "Task-28912", clientName: "Thomas, Jessica", taskType: "Insurance", title: "Life insurance review", dueDate: "25/04/2025", followupDate: "23/04/2025", status: "Not Started", lastComment: "", advisorInitials: "MG", advisorName: "Maria Garcia", assigneeName: "Maria Garcia", isUrgent: false, isOverdue: false },
    { id: "CRM-19123", clientName: "Hernandez, Daniel", taskType: "Tax planning", title: "Tax-loss harvesting", dueDate: "08/05/2025", followupDate: "06/05/2025", status: "In Progress", lastComment: "Loss positions identified", advisorInitials: "WD", advisorName: "William Davis", assigneeName: "William Davis", isUrgent: false, isOverdue: false },
    { id: "Trans-91234", clientName: "Moore, Emily", taskType: "Transfer", title: "Brokerage consolidation", dueDate: "20/05/2025", followupDate: "18/05/2025", status: "Not Started", lastComment: "", advisorInitials: "WD", advisorName: "William Davis", assigneeName: "William Davis", isUrgent: false, isOverdue: false },
    { id: "CRM-82345", clientName: "Wilson, Brian", taskType: "Review", title: "Retirement income review", dueDate: "05/06/2025", followupDate: "03/06/2025", status: "Completed", lastComment: "Strategy confirmed", advisorInitials: "MJ", advisorName: "Michael Johnson", assigneeName: "Michael Johnson", isUrgent: false, isOverdue: false },
    { id: "Task-73456", clientName: "Clark, Nancy", taskType: "Claim", title: "Beneficiary claim", dueDate: "18/01/2025", followupDate: "16/01/2025", status: "In Progress", lastComment: "Death certificate received", advisorInitials: "JW", advisorName: "Jennifer Williams", assigneeName: "Jennifer Williams", isUrgent: true, isOverdue: true },
    { id: "Onboard-64567", clientName: "Lewis, Kevin", taskType: "Client onboarding", title: "HSA account setup", dueDate: "28/06/2025", followupDate: "26/06/2025", status: "Not Started", lastComment: "", advisorInitials: "MG", advisorName: "Maria Garcia", assigneeName: "Maria Garcia", isUrgent: false, isOverdue: false },
    { id: "CRM-55678", clientName: "Lee, Sandra", taskType: "Quote", title: "Long-term care quote", dueDate: "12/07/2025", followupDate: "10/07/2025", status: "In Progress", lastComment: "Underwriting started", advisorInitials: "RB", advisorName: "Robert Brown", assigneeName: "Robert Brown", isUrgent: false, isOverdue: false },
    { id: "Trans-46789", clientName: "Walker, Paul", taskType: "Contribution", title: "IRA contribution", dueDate: "25/07/2025", followupDate: "23/07/2025", status: "Not Started", lastComment: "", advisorInitials: "WD", advisorName: "William Davis", assigneeName: "William Davis", isUrgent: false, isOverdue: false },
  ],
};

const regionalDataMap: Record<string, RegionalData> = {
  ZA: southAfricaData,
  AU: australiaData,
  CA: canadaData,
  GB: unitedKingdomData,
  US: unitedStatesData,
};

export function getRegionalData(regionCode: string): RegionalData {
  return regionalDataMap[regionCode] || southAfricaData;
}

// Get filtered regional data based on selected advisors
export function getFilteredRegionalData(
  regionCode: string,
  selectedAdvisors: string[]
): RegionalData {
  const baseData = getRegionalData(regionCode);
  
  // If all advisors are selected or none selected, return base data
  if (selectedAdvisors.length === 0 || selectedAdvisors.length === baseData.advisors.length) {
    return baseData;
  }
  
  // Calculate the selected advisors' total AUM and percentage
  const selectedAdvisorsData = baseData.advisors.filter(a => selectedAdvisors.includes(a.initials));
  const totalSelectedAUM = selectedAdvisorsData.reduce((sum, a) => sum + a.aum, 0);
  const totalSelectedClients = selectedAdvisorsData.reduce((sum, a) => sum + a.clientCount, 0);
  const aumRatio = totalSelectedAUM / baseData.totalAUMNumber;
  
  // Filter top accounts, birthdays, and tasks by selected advisors
  const filteredTopAccounts = baseData.topAccounts.filter(
    account => selectedAdvisors.includes(account.advisorInitials)
  );
  
  const filteredBirthdays = baseData.birthdays.filter(
    bday => selectedAdvisors.includes(bday.advisorInitials)
  );
  
  const filteredTasks = baseData.tasks.filter(
    task => selectedAdvisors.includes(task.advisorInitials)
  );
  
  // Scale provider values proportionally
  const scaledProviders = baseData.providers.map(provider => {
    const originalValue = parseFloat(provider.value.replace(/[^0-9.-]/g, ''));
    const scaledValue = originalValue * aumRatio;
    return {
      ...provider,
      bookPercent: provider.bookPercent, // Keep same book percentage
      value: formatCurrency(scaledValue, baseData.currencySymbol),
    };
  });
  
  // Scale clients by value proportionally
  const scaledClientsByValue = baseData.clientsByValue.map(row => {
    const originalValue = parseFloat(row.value.replace(/[^0-9.-]/g, ''));
    const scaledValue = originalValue * aumRatio;
    const scaledInvestors = Math.round(row.investors * aumRatio);
    return {
      ...row,
      value: formatCurrency(scaledValue, baseData.currencySymbol),
      investors: scaledInvestors,
    };
  });
  
  return {
    ...baseData,
    totalAUM: formatAUM(totalSelectedAUM),
    totalAUMNumber: totalSelectedAUM,
    providers: scaledProviders,
    topAccounts: filteredTopAccounts,
    birthdays: filteredBirthdays,
    clientsByValue: scaledClientsByValue,
    advisors: baseData.advisors, // Keep all advisors for the filter UI
    tasks: filteredTasks,
  };
}

// Regional Opportunity Data for AI Assistant
export interface RegionalOpportunity {
  clientId: string;
  clientName: string;
  currentValue: number;
  opportunityType: "upsell" | "cross-sell" | "migration" | "platform";
  potentialRevenue: number;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

const southAfricaOpportunities: RegionalOpportunity[] = [
  {
    clientId: "za-1",
    clientName: "Johan van der Merwe",
    currentValue: 2500000,
    opportunityType: "upsell",
    potentialRevenue: 125000,
    reasoning: "Client has excess liquidity in low-yield savings. Strong candidate for Living Annuity expansion.",
    suggestedAction: "Recommend diversified Living Annuity portfolio",
    confidence: 85,
  },
  {
    clientId: "za-2",
    clientName: "Thandi Nkosi",
    currentValue: 4200000,
    opportunityType: "migration",
    potentialRevenue: 210000,
    reasoning: "Preservation Fund with external manager underperforming by 3.2%. Ready for house view migration.",
    suggestedAction: "Present house view performance comparison",
    confidence: 92,
  },
  {
    clientId: "za-3",
    clientName: "Pieter du Plessis",
    currentValue: 1800000,
    opportunityType: "cross-sell",
    potentialRevenue: 45000,
    reasoning: "No life cover despite dependents. Gap analysis shows significant protection need.",
    suggestedAction: "Schedule protection needs analysis",
    confidence: 78,
  },
  {
    clientId: "za-4",
    clientName: "Nomvula Dlamini",
    currentValue: 3600000,
    opportunityType: "platform",
    potentialRevenue: 180000,
    reasoning: "Assets spread across 4 providers. Consolidation to Ninety One would reduce fees.",
    suggestedAction: "Propose platform consolidation strategy",
    confidence: 88,
  },
  {
    clientId: "za-5",
    clientName: "Willem Botha",
    currentValue: 890000,
    opportunityType: "upsell",
    potentialRevenue: 35000,
    reasoning: "Recent inheritance not yet invested. Conservative profile but open to Endowment products.",
    suggestedAction: "Discuss balanced Endowment approach",
    confidence: 72,
  },
];

const australiaOpportunities: RegionalOpportunity[] = [
  {
    clientId: "au-1",
    clientName: "James Mitchell",
    currentValue: 3200000,
    opportunityType: "upsell",
    potentialRevenue: 160000,
    reasoning: "Superannuation balance well below contribution cap. Strong salary supports additional contributions.",
    suggestedAction: "Recommend salary sacrifice strategy for Super",
    confidence: 87,
  },
  {
    clientId: "au-2",
    clientName: "Sarah Thompson",
    currentValue: 5100000,
    opportunityType: "migration",
    potentialRevenue: 255000,
    reasoning: "Industry super fund underperforming. SMSF setup would provide better control and returns.",
    suggestedAction: "Present SMSF establishment proposal",
    confidence: 91,
  },
  {
    clientId: "au-3",
    clientName: "Michael O'Brien",
    currentValue: 2100000,
    opportunityType: "cross-sell",
    potentialRevenue: 52500,
    reasoning: "No income protection despite high earning role. Risk assessment shows coverage gap.",
    suggestedAction: "Schedule income protection review",
    confidence: 76,
  },
  {
    clientId: "au-4",
    clientName: "Emily Anderson",
    currentValue: 4400000,
    opportunityType: "platform",
    potentialRevenue: 220000,
    reasoning: "Assets across multiple wrap platforms. Macquarie Wrap consolidation would streamline.",
    suggestedAction: "Propose wrap platform consolidation",
    confidence: 84,
  },
  {
    clientId: "au-5",
    clientName: "David Wilson",
    currentValue: 1200000,
    opportunityType: "upsell",
    potentialRevenue: 48000,
    reasoning: "Approaching preservation age. Pension phase transition opportunity.",
    suggestedAction: "Discuss transition to pension strategy",
    confidence: 79,
  },
];

const canadaOpportunities: RegionalOpportunity[] = [
  {
    clientId: "ca-1",
    clientName: "Pierre Tremblay",
    currentValue: 2800000,
    opportunityType: "upsell",
    potentialRevenue: 140000,
    reasoning: "RRSP contribution room unused for 3 years. Tax optimization opportunity significant.",
    suggestedAction: "Recommend RRSP catch-up strategy",
    confidence: 88,
  },
  {
    clientId: "ca-2",
    clientName: "Marie-Claire Bouchard",
    currentValue: 4600000,
    opportunityType: "migration",
    potentialRevenue: 230000,
    reasoning: "Portfolio with bank advisor underperforming. Independent management would improve returns.",
    suggestedAction: "Present fee and performance comparison",
    confidence: 90,
  },
  {
    clientId: "ca-3",
    clientName: "James MacDonald",
    currentValue: 1900000,
    opportunityType: "cross-sell",
    potentialRevenue: 47500,
    reasoning: "TFSA not maximized. Children approaching university age - RESP opportunity.",
    suggestedAction: "Schedule RESP and TFSA optimization review",
    confidence: 81,
  },
  {
    clientId: "ca-4",
    clientName: "Sophie Gagnon",
    currentValue: 3800000,
    opportunityType: "platform",
    potentialRevenue: 190000,
    reasoning: "Accounts spread across RBC, TD, and CIBC. Consolidation would reduce complexity.",
    suggestedAction: "Propose single-platform consolidation",
    confidence: 86,
  },
  {
    clientId: "ca-5",
    clientName: "Robert Singh",
    currentValue: 950000,
    opportunityType: "upsell",
    potentialRevenue: 38000,
    reasoning: "Recent business sale proceeds in high-interest savings. Investment planning needed.",
    suggestedAction: "Discuss corporate investment structure",
    confidence: 74,
  },
];

const unitedKingdomOpportunities: RegionalOpportunity[] = [
  {
    clientId: "gb-1",
    clientName: "William Smith",
    currentValue: 2200000,
    opportunityType: "upsell",
    potentialRevenue: 110000,
    reasoning: "ISA allowance underutilized for 4 years. Significant tax-free growth opportunity.",
    suggestedAction: "Recommend ISA maximization strategy",
    confidence: 86,
  },
  {
    clientId: "gb-2",
    clientName: "Elizabeth Jones",
    currentValue: 4800000,
    opportunityType: "migration",
    potentialRevenue: 240000,
    reasoning: "SIPP with high-fee provider. Transfer to lower-cost platform would save significantly.",
    suggestedAction: "Present SIPP transfer analysis",
    confidence: 93,
  },
  {
    clientId: "gb-3",
    clientName: "Thomas Williams",
    currentValue: 1600000,
    opportunityType: "cross-sell",
    potentialRevenue: 40000,
    reasoning: "No Junior ISA for children despite high net worth. Intergenerational planning gap.",
    suggestedAction: "Schedule family wealth planning session",
    confidence: 77,
  },
  {
    clientId: "gb-4",
    clientName: "Victoria Brown",
    currentValue: 3400000,
    opportunityType: "platform",
    potentialRevenue: 170000,
    reasoning: "Assets across Hargreaves, AJ Bell, and II. Single platform would improve oversight.",
    suggestedAction: "Propose platform consolidation",
    confidence: 85,
  },
  {
    clientId: "gb-5",
    clientName: "James Taylor",
    currentValue: 780000,
    opportunityType: "upsell",
    potentialRevenue: 31200,
    reasoning: "Lifetime ISA not utilized. First-time buyer or retirement savings opportunity.",
    suggestedAction: "Discuss LISA benefits and strategy",
    confidence: 71,
  },
];

const unitedStatesOpportunities: RegionalOpportunity[] = [
  {
    clientId: "us-1",
    clientName: "Michael Johnson",
    currentValue: 2900000,
    opportunityType: "upsell",
    potentialRevenue: 145000,
    reasoning: "401(k) not maxed despite high income. Catch-up contributions available at 50+.",
    suggestedAction: "Recommend 401(k) maximization strategy",
    confidence: 89,
  },
  {
    clientId: "us-2",
    clientName: "Patricia Williams",
    currentValue: 5200000,
    opportunityType: "migration",
    potentialRevenue: 260000,
    reasoning: "Old employer 401(k) with limited options. IRA rollover would expand investment choices.",
    suggestedAction: "Present IRA rollover benefits",
    confidence: 94,
  },
  {
    clientId: "us-3",
    clientName: "Robert Brown",
    currentValue: 2000000,
    opportunityType: "cross-sell",
    potentialRevenue: 50000,
    reasoning: "No 529 Plan despite children approaching college age. Tax-advantaged savings gap.",
    suggestedAction: "Schedule 529 Plan consultation",
    confidence: 80,
  },
  {
    clientId: "us-4",
    clientName: "Maria Garcia",
    currentValue: 4000000,
    opportunityType: "platform",
    potentialRevenue: 200000,
    reasoning: "Accounts at Fidelity, Schwab, and Vanguard. Consolidation would simplify management.",
    suggestedAction: "Propose brokerage consolidation",
    confidence: 87,
  },
  {
    clientId: "us-5",
    clientName: "David Martinez",
    currentValue: 850000,
    opportunityType: "upsell",
    potentialRevenue: 34000,
    reasoning: "Roth IRA conversion opportunity during lower income year. Tax planning potential.",
    suggestedAction: "Discuss Roth conversion strategy",
    confidence: 73,
  },
];

const regionalOpportunitiesMap: Record<string, RegionalOpportunity[]> = {
  ZA: southAfricaOpportunities,
  AU: australiaOpportunities,
  CA: canadaOpportunities,
  GB: unitedKingdomOpportunities,
  US: unitedStatesOpportunities,
};

export function getRegionalOpportunities(regionCode: string): RegionalOpportunity[] {
  return regionalOpportunitiesMap[regionCode] || southAfricaOpportunities;
}
