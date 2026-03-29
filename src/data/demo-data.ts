// ─── Types ──────────────────────────────────────────────────────────────
export type AccountType = 'Architect' | 'Consultant' | 'Building Owner' | 'General Contractor' | 'Roofing Contractor' | 'Waterproofing Contractor' | 'Glazing Contractor' | 'Distributor' | 'Manufacturer' | 'Developer' | 'Facilities Owner';
export type OppStage = 'Prospect' | 'Specification' | 'Specified' | 'Bid' | 'Awarded' | string;
export type OrderStage = 'Pending' | 'Booked' | 'Shipped';
export type ForecastStatus = 'Open' | 'Closed Won' | 'Closed Lost';
export type QuoteStatus = 'Draft' | 'Internal Review' | 'Submitted' | 'Revised' | 'Accepted' | 'Rejected' | 'Expired';
export type OrderStatus = 'Entered' | 'Acknowledged' | 'In Production' | 'Shipped' | 'Delivered' | 'Complete' | 'Hold' | 'Cancelled';
export type ProjectStatus = 'Pre-Design' | 'Design' | 'Bidding' | 'Construction' | 'Complete' | 'On Hold';

export interface ManufacturerLine {
  id: string; name: string; categories: string[]; status: 'Active' | 'Inactive'; apiConnected: boolean;
}

export interface Account {
  id: string; name: string; type: AccountType; territory: string; owner: string; city: string; state: string;
  phone: string; website: string; lastActivity: string; contactCount: number; oppCount: number;
}

export interface Contact {
  id: string; name: string; title: string; accountId: string; accountName: string; email: string;
  phone: string; role: string; influenceLevel: 'High' | 'Medium' | 'Low'; lastActivity: string;
}

export interface Opportunity {
  id: string; name: string; accountName: string; stage: OppStage; value: number; probability: number;
  closeDate: string; manufacturerLine: string; productCategory: string; territory: string; owner: string;
  projectName?: string; bidDate?: string; source: string; forecastStatus: ForecastStatus;
}

export interface Project {
  id: string; name: string; address: string; city: string; state: string; type: string;
  status: ProjectStatus; sqft: number; bidDate: string; owner: string; architect: string;
  gc: string; oppCount: number;
}

export interface Quote {
  id: string; number: string; oppName: string; accountName: string; manufacturerLine: string;
  status: QuoteStatus; total: number; created: string; expires: string; version: number;
}

export interface Order {
  id: string; orderNumber: string; mfgOrderNumber: string; accountName: string; manufacturerLine: string;
  status: OrderStatus; total: number; orderDate: string; expectedShip: string; project: string;
  orderStage: OrderStage; opportunityId?: string;
}

export interface Activity {
  id: string; type: 'Call' | 'Meeting' | 'Email' | 'Site Visit' | 'Lunch & Learn' | 'Submittal Support';
  subject: string; accountName: string; contactName: string; date: string; owner: string; notes: string;
}

export interface Task {
  id: string; title: string; dueDate: string; priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Complete'; linkedTo: string; owner: string;
}

// ─── Demo Data ──────────────────────────────────────────────────────────
export const manufacturerLines: ManufacturerLine[] = [
  { id: 'ml1', name: 'Carlisle SynTec', categories: ['Roofing', 'Waterproofing'], status: 'Active', apiConnected: true },
  { id: 'ml2', name: 'VELUX Skylights', categories: ['Skylights', 'Daylighting'], status: 'Active', apiConnected: true },
  { id: 'ml3', name: 'Hunter Panels', categories: ['Insulation'], status: 'Active', apiConnected: false },
  { id: 'ml4', name: 'Tremco Roofing', categories: ['Roofing', 'Waterproofing'], status: 'Active', apiConnected: true },
  { id: 'ml5', name: 'Kingspan Insulation', categories: ['Insulation', 'Cladding'], status: 'Active', apiConnected: false },
  { id: 'ml6', name: 'Georgia-Pacific DensDeck', categories: ['Cover Boards'], status: 'Active', apiConnected: false },
  { id: 'ml7', name: 'Soprema', categories: ['Roofing', 'Waterproofing'], status: 'Active', apiConnected: true },
  { id: 'ml8', name: 'Major Industries', categories: ['Skylights', 'Translucent Panels'], status: 'Inactive', apiConnected: false },
];

export const accounts: Account[] = [
  { id: 'a1', name: 'Henderson Architecture Group', type: 'Architect', territory: 'Northeast', owner: 'Mike Torres', city: 'Boston', state: 'MA', phone: '(617) 555-0142', website: 'hendersonarch.com', lastActivity: '2026-03-27', contactCount: 4, oppCount: 6 },
  { id: 'a2', name: 'Summit Roofing Contractors', type: 'Roofing Contractor', territory: 'Northeast', owner: 'Mike Torres', city: 'Hartford', state: 'CT', phone: '(860) 555-0198', website: 'summitroofing.com', lastActivity: '2026-03-28', contactCount: 3, oppCount: 8 },
  { id: 'a3', name: 'Beacon Building Products', type: 'Distributor', territory: 'Northeast', owner: 'Sarah Chen', city: 'New York', state: 'NY', phone: '(212) 555-0234', website: 'becn.com', lastActivity: '2026-03-25', contactCount: 5, oppCount: 12 },
  { id: 'a4', name: 'Patriot Development Corp', type: 'Developer', territory: 'Mid-Atlantic', owner: 'Sarah Chen', city: 'Philadelphia', state: 'PA', phone: '(215) 555-0167', website: 'patriotdev.com', lastActivity: '2026-03-20', contactCount: 2, oppCount: 3 },
  { id: 'a5', name: 'Atlantic Waterproofing Inc', type: 'Waterproofing Contractor', territory: 'Mid-Atlantic', owner: 'James Wright', city: 'Baltimore', state: 'MD', phone: '(410) 555-0189', website: 'atlanticwp.com', lastActivity: '2026-03-26', contactCount: 3, oppCount: 5 },
  { id: 'a6', name: 'Northstar Consulting Engineers', type: 'Consultant', territory: 'Northeast', owner: 'James Wright', city: 'Providence', state: 'RI', phone: '(401) 555-0145', website: 'northstarce.com', lastActivity: '2026-03-22', contactCount: 2, oppCount: 4 },
  { id: 'a7', name: 'Metro General Contractors', type: 'General Contractor', territory: 'Northeast', owner: 'Mike Torres', city: 'Newark', state: 'NJ', phone: '(973) 555-0211', website: 'metrogc.com', lastActivity: '2026-03-24', contactCount: 4, oppCount: 7 },
  { id: 'a8', name: 'Skyline Glass & Glazing', type: 'Glazing Contractor', territory: 'Mid-Atlantic', owner: 'Sarah Chen', city: 'Washington', state: 'DC', phone: '(202) 555-0178', website: 'skylineglazing.com', lastActivity: '2026-03-18', contactCount: 2, oppCount: 3 },
  { id: 'a9', name: 'Greenfield University', type: 'Building Owner', territory: 'Northeast', owner: 'Mike Torres', city: 'Worcester', state: 'MA', phone: '(508) 555-0299', website: 'greenfieldu.edu', lastActivity: '2026-03-15', contactCount: 3, oppCount: 2 },
  { id: 'a10', name: 'Capital Facilities Group', type: 'Facilities Owner', territory: 'Mid-Atlantic', owner: 'James Wright', city: 'Richmond', state: 'VA', phone: '(804) 555-0122', website: 'capitalfacilities.com', lastActivity: '2026-03-19', contactCount: 2, oppCount: 4 },
];

export const contacts: Contact[] = [
  { id: 'c1', name: 'Robert Henderson', title: 'Principal', accountId: 'a1', accountName: 'Henderson Architecture Group', email: 'rhenderson@hendersonarch.com', phone: '(617) 555-0142', role: 'Decision Maker', influenceLevel: 'High', lastActivity: '2026-03-27' },
  { id: 'c2', name: 'Lisa Chang', title: 'Project Architect', accountId: 'a1', accountName: 'Henderson Architecture Group', email: 'lchang@hendersonarch.com', phone: '(617) 555-0143', role: 'Specifier', influenceLevel: 'High', lastActivity: '2026-03-25' },
  { id: 'c3', name: 'Tom Sullivan', title: 'President', accountId: 'a2', accountName: 'Summit Roofing Contractors', email: 'tsullivan@summitroofing.com', phone: '(860) 555-0198', role: 'Decision Maker', influenceLevel: 'High', lastActivity: '2026-03-28' },
  { id: 'c4', name: 'Maria Gonzalez', title: 'Estimator', accountId: 'a2', accountName: 'Summit Roofing Contractors', email: 'mgonzalez@summitroofing.com', phone: '(860) 555-0199', role: 'Evaluator', influenceLevel: 'Medium', lastActivity: '2026-03-26' },
  { id: 'c5', name: 'David Park', title: 'Branch Manager', accountId: 'a3', accountName: 'Beacon Building Products', email: 'dpark@becn.com', phone: '(212) 555-0234', role: 'Decision Maker', influenceLevel: 'High', lastActivity: '2026-03-25' },
  { id: 'c6', name: 'Jennifer Okafor', title: 'VP Development', accountId: 'a4', accountName: 'Patriot Development Corp', email: 'jokafor@patriotdev.com', phone: '(215) 555-0167', role: 'Champion', influenceLevel: 'High', lastActivity: '2026-03-20' },
  { id: 'c7', name: 'Kevin Walsh', title: 'Operations Manager', accountId: 'a5', accountName: 'Atlantic Waterproofing Inc', email: 'kwalsh@atlanticwp.com', phone: '(410) 555-0189', role: 'Technical Buyer', influenceLevel: 'Medium', lastActivity: '2026-03-26' },
  { id: 'c8', name: 'Amy Nguyen', title: 'Senior Engineer', accountId: 'a6', accountName: 'Northstar Consulting Engineers', email: 'anguyen@northstarce.com', phone: '(401) 555-0145', role: 'Specifier', influenceLevel: 'High', lastActivity: '2026-03-22' },
  { id: 'c9', name: 'Brian Miller', title: 'Project Manager', accountId: 'a7', accountName: 'Metro General Contractors', email: 'bmiller@metrogc.com', phone: '(973) 555-0211', role: 'Evaluator', influenceLevel: 'Medium', lastActivity: '2026-03-24' },
  { id: 'c10', name: 'Sandra Hayes', title: 'Director of Facilities', accountId: 'a9', accountName: 'Greenfield University', email: 'shayes@greenfieldu.edu', phone: '(508) 555-0299', role: 'Decision Maker', influenceLevel: 'High', lastActivity: '2026-03-15' },
];

export const opportunities: Opportunity[] = [
  { id: 'o1', name: 'City Center Tower - Roof Replacement', accountName: 'Summit Roofing Contractors', stage: 'Bid', value: 485000, probability: 60, closeDate: '2026-05-15', manufacturerLine: 'Carlisle SynTec', productCategory: 'Roofing', territory: 'Northeast', owner: 'Mike Torres', projectName: 'City Center Tower', bidDate: '2026-04-10', source: 'Existing Relationship' },
  { id: 'o2', name: 'Harbor Medical Campus - Skylights', accountName: 'Henderson Architecture Group', stage: 'Specification', value: 320000, probability: 40, closeDate: '2026-07-20', manufacturerLine: 'VELUX Skylights', productCategory: 'Skylights', territory: 'Northeast', owner: 'Mike Torres', projectName: 'Harbor Medical Campus', source: 'Architect Spec' },
  { id: 'o3', name: 'Patriot Plaza Ph2 - Waterproofing', accountName: 'Patriot Development Corp', stage: 'Bid', value: 275000, probability: 70, closeDate: '2026-04-30', manufacturerLine: 'Tremco Roofing', productCategory: 'Waterproofing', territory: 'Mid-Atlantic', owner: 'Sarah Chen', projectName: 'Patriot Plaza Phase 2', bidDate: '2026-03-28', source: 'Developer Direct' },
  { id: 'o4', name: 'Greenfield Science Hall - Insulation', accountName: 'Greenfield University', stage: 'Specification', value: 142000, probability: 30, closeDate: '2026-08-15', manufacturerLine: 'Hunter Panels', productCategory: 'Insulation', territory: 'Northeast', owner: 'Mike Torres', projectName: 'Greenfield Science Hall', source: 'Owner Direct' },
  { id: 'o5', name: 'Metro Office Complex - Full Envelope', accountName: 'Metro General Contractors', stage: 'Specified', value: 890000, probability: 75, closeDate: '2026-04-20', manufacturerLine: 'Carlisle SynTec', productCategory: 'Roofing', territory: 'Northeast', owner: 'Mike Torres', projectName: 'Metro Office Complex', source: 'GC Bid Request' },
  { id: 'o6', name: 'Capital Center Reroof', accountName: 'Capital Facilities Group', stage: 'Awarded', value: 356000, probability: 95, closeDate: '2026-04-05', manufacturerLine: 'Soprema', productCategory: 'Roofing', territory: 'Mid-Atlantic', owner: 'James Wright', source: 'Existing Relationship', orderStage: 'Pending' },
  { id: 'o7', name: 'Beacon Distribution Center - Cladding', accountName: 'Beacon Building Products', stage: 'Prospect', value: 210000, probability: 15, closeDate: '2026-09-30', manufacturerLine: 'Kingspan Insulation', productCategory: 'Cladding', territory: 'Northeast', owner: 'Sarah Chen', source: 'Cold Call' },
  { id: 'o8', name: 'Atlantic WP - Cover Board Supply', accountName: 'Atlantic Waterproofing Inc', stage: 'Bid', value: 95000, probability: 55, closeDate: '2026-05-01', manufacturerLine: 'Georgia-Pacific DensDeck', productCategory: 'Cover Boards', territory: 'Mid-Atlantic', owner: 'James Wright', source: 'Contractor Direct' },
  { id: 'o9', name: 'Skyline HQ Curtainwall Skylights', accountName: 'Skyline Glass & Glazing', stage: 'Specification', value: 420000, probability: 35, closeDate: '2026-08-01', manufacturerLine: 'VELUX Skylights', productCategory: 'Skylights', territory: 'Mid-Atlantic', owner: 'Sarah Chen', source: 'Architect Referral' },
  { id: 'o10', name: 'Harbor Medical - Roofing', accountName: 'Summit Roofing Contractors', stage: 'Awarded', value: 615000, probability: 100, closeDate: '2026-01-15', manufacturerLine: 'Carlisle SynTec', productCategory: 'Roofing', territory: 'Northeast', owner: 'Mike Torres', projectName: 'Harbor Medical Campus', source: 'Existing Relationship', orderStage: 'Shipped' },
  { id: 'o11', name: 'Providence Library Reroof', accountName: 'Northstar Consulting Engineers', stage: 'Prospect', value: 188000, probability: 10, closeDate: '2026-02-28', manufacturerLine: 'Tremco Roofing', productCategory: 'Roofing', territory: 'Northeast', owner: 'James Wright', source: 'Consultant Spec' },
  { id: 'o12', name: 'Patriot Plaza Ph1 - Insulation', accountName: 'Patriot Development Corp', stage: 'Awarded', value: 198000, probability: 100, closeDate: '2025-11-20', manufacturerLine: 'Kingspan Insulation', productCategory: 'Insulation', territory: 'Mid-Atlantic', owner: 'Sarah Chen', source: 'Developer Direct', orderStage: 'Booked' },
];

export const projects: Project[] = [
  { id: 'p1', name: 'City Center Tower', address: '200 Main Street', city: 'Hartford', state: 'CT', type: 'Commercial Office', status: 'Bidding', sqft: 85000, bidDate: '2026-04-10', owner: 'City Center LLC', architect: 'Henderson Architecture Group', gc: 'Metro General Contractors', oppCount: 2 },
  { id: 'p2', name: 'Harbor Medical Campus', address: '45 Harbor Blvd', city: 'Boston', state: 'MA', type: 'Healthcare', status: 'Design', sqft: 120000, bidDate: '2026-06-15', owner: 'Harbor Health Systems', architect: 'Henderson Architecture Group', gc: 'TBD', oppCount: 3 },
  { id: 'p3', name: 'Patriot Plaza Phase 2', address: '1600 Market St', city: 'Philadelphia', state: 'PA', type: 'Mixed Use', status: 'Bidding', sqft: 65000, bidDate: '2026-03-28', owner: 'Patriot Development Corp', architect: 'KPF Associates', gc: 'Turner Construction', oppCount: 2 },
  { id: 'p4', name: 'Greenfield Science Hall', address: '100 University Drive', city: 'Worcester', state: 'MA', type: 'Education', status: 'Pre-Design', sqft: 42000, bidDate: '2026-07-01', owner: 'Greenfield University', architect: 'Payette', gc: 'TBD', oppCount: 1 },
  { id: 'p5', name: 'Metro Office Complex', address: '500 Broad St', city: 'Newark', state: 'NJ', type: 'Commercial Office', status: 'Construction', sqft: 175000, bidDate: '2026-02-15', owner: 'Metro Properties LLC', architect: 'Gensler', gc: 'Metro General Contractors', oppCount: 1 },
  { id: 'p6', name: 'Capital Center', address: '800 Capitol Ave', city: 'Richmond', state: 'VA', type: 'Government', status: 'Construction', sqft: 55000, bidDate: '2026-01-10', owner: 'State of Virginia', architect: 'Clark Nexsen', gc: 'Whiting-Turner', oppCount: 1 },
];

export const quotes: Quote[] = [
  { id: 'q1', number: 'QT-2026-0042', oppName: 'City Center Tower - Roof Replacement', accountName: 'Summit Roofing Contractors', manufacturerLine: 'Carlisle SynTec', status: 'Submitted', total: 485000, created: '2026-03-15', expires: '2026-04-15', version: 2 },
  { id: 'q2', number: 'QT-2026-0041', oppName: 'Atlantic WP - Cover Board Supply', accountName: 'Atlantic Waterproofing Inc', manufacturerLine: 'Georgia-Pacific DensDeck', status: 'Submitted', total: 95000, created: '2026-03-12', expires: '2026-04-12', version: 1 },
  { id: 'q3', number: 'QT-2026-0040', oppName: 'Patriot Plaza Ph2 - Waterproofing', accountName: 'Patriot Development Corp', manufacturerLine: 'Tremco Roofing', status: 'Accepted', total: 275000, created: '2026-03-01', expires: '2026-04-01', version: 3 },
  { id: 'q4', number: 'QT-2026-0039', oppName: 'Metro Office Complex - Full Envelope', accountName: 'Metro General Contractors', manufacturerLine: 'Carlisle SynTec', status: 'Internal Review', total: 890000, created: '2026-03-20', expires: '2026-04-20', version: 1 },
  { id: 'q5', number: 'QT-2026-0038', oppName: 'Greenfield Science Hall - Insulation', accountName: 'Greenfield University', manufacturerLine: 'Hunter Panels', status: 'Draft', total: 142000, created: '2026-03-22', expires: '2026-04-22', version: 1 },
  { id: 'q6', number: 'QT-2025-0187', oppName: 'Harbor Medical - Roofing', accountName: 'Summit Roofing Contractors', manufacturerLine: 'Carlisle SynTec', status: 'Accepted', total: 615000, created: '2025-10-15', expires: '2025-11-15', version: 4 },
];

export const orders: Order[] = [
  { id: 'ord1', orderNumber: 'ORD-2026-0018', mfgOrderNumber: 'CST-882341', accountName: 'Summit Roofing Contractors', manufacturerLine: 'Carlisle SynTec', status: 'In Production', total: 615000, orderDate: '2026-01-20', expectedShip: '2026-04-10', project: 'Harbor Medical Campus' },
  { id: 'ord2', orderNumber: 'ORD-2026-0019', mfgOrderNumber: 'SOP-443211', accountName: 'Capital Facilities Group', manufacturerLine: 'Soprema', status: 'Entered', total: 356000, orderDate: '2026-03-28', expectedShip: '2026-05-15', project: 'Capital Center' },
  { id: 'ord3', orderNumber: 'ORD-2026-0017', mfgOrderNumber: 'TRM-991287', accountName: 'Patriot Development Corp', manufacturerLine: 'Tremco Roofing', status: 'Acknowledged', total: 275000, orderDate: '2026-03-25', expectedShip: '2026-05-01', project: 'Patriot Plaza Phase 2' },
  { id: 'ord4', orderNumber: 'ORD-2025-0145', mfgOrderNumber: 'KSP-228834', accountName: 'Patriot Development Corp', manufacturerLine: 'Kingspan Insulation', status: 'Delivered', total: 198000, orderDate: '2025-09-15', expectedShip: '2025-10-30', project: 'Patriot Plaza Phase 1' },
  { id: 'ord5', orderNumber: 'ORD-2025-0152', mfgOrderNumber: 'CST-871290', accountName: 'Metro General Contractors', manufacturerLine: 'Carlisle SynTec', status: 'Shipped', total: 445000, orderDate: '2025-12-10', expectedShip: '2026-03-25', project: 'Metro Office Complex' },
];

export const activities: Activity[] = [
  { id: 'act1', type: 'Meeting', subject: 'Roof system review - City Center Tower', accountName: 'Henderson Architecture Group', contactName: 'Lisa Chang', date: '2026-03-27', owner: 'Mike Torres', notes: 'Reviewed TPO vs PVC options. Architect leaning toward Carlisle 60-mil TPO. Will spec in next CD set.' },
  { id: 'act2', type: 'Site Visit', subject: 'Pre-bid walkthrough - Patriot Plaza Ph2', accountName: 'Atlantic Waterproofing Inc', contactName: 'Kevin Walsh', date: '2026-03-26', owner: 'Sarah Chen', notes: 'Walked below-grade areas. Significant water table concerns. Recommending Tremco hot-applied system.' },
  { id: 'act3', type: 'Call', subject: 'Quote follow-up - Cover boards', accountName: 'Atlantic Waterproofing Inc', contactName: 'Kevin Walsh', date: '2026-03-26', owner: 'James Wright', notes: 'Kevin reviewing pricing. Needs freight clarification. Will call back Thursday.' },
  { id: 'act4', type: 'Lunch & Learn', subject: 'VELUX skylight systems presentation', accountName: 'Henderson Architecture Group', contactName: 'Robert Henderson', date: '2026-03-25', owner: 'Mike Torres', notes: '8 attendees from firm. Strong interest in modular skylight for Harbor Medical Campus.' },
  { id: 'act5', type: 'Email', subject: 'Metro Office Complex - updated pricing', accountName: 'Metro General Contractors', contactName: 'Brian Miller', date: '2026-03-24', owner: 'Mike Torres', notes: 'Sent revised pricing per VE discussion. Removed walkway pads, added edge metal detail.' },
  { id: 'act6', type: 'Submittal Support', subject: 'Carlisle product submittal prep', accountName: 'Summit Roofing Contractors', contactName: 'Tom Sullivan', date: '2026-03-28', owner: 'Mike Torres', notes: 'Prepared submittal package for Harbor Medical. Included shop drawings and warranty letter.' },
];

export const tasks: Task[] = [
  { id: 't1', title: 'Follow up on City Center bid results', dueDate: '2026-04-11', priority: 'High', status: 'Open', linkedTo: 'City Center Tower - Roof Replacement', owner: 'Mike Torres' },
  { id: 't2', title: 'Send revised Harbor Medical skylight layout', dueDate: '2026-03-31', priority: 'High', status: 'In Progress', linkedTo: 'Harbor Medical Campus - Skylights', owner: 'Mike Torres' },
  { id: 't3', title: 'Prepare Greenfield budget pricing', dueDate: '2026-04-05', priority: 'Medium', status: 'Open', linkedTo: 'Greenfield Science Hall - Insulation', owner: 'Mike Torres' },
  { id: 't4', title: 'Schedule Capital Center pre-install meeting', dueDate: '2026-04-01', priority: 'Medium', status: 'Open', linkedTo: 'Capital Center Reroof', owner: 'James Wright' },
  { id: 't5', title: 'Submit Kingspan samples to Beacon', dueDate: '2026-04-03', priority: 'Low', status: 'Open', linkedTo: 'Beacon Distribution Center - Cladding', owner: 'Sarah Chen' },
  { id: 't6', title: 'Update Metro Office Complex quote v2', dueDate: '2026-03-30', priority: 'High', status: 'In Progress', linkedTo: 'Metro Office Complex - Full Envelope', owner: 'Mike Torres' },
];

// ─── Dashboard stats ────────────────────────────────────────────────────
export const dashboardStats = {
  pipelineValue: 3195000,
  weightedForecast: 1842750,
  openOpps: 9,
  wonThisYear: 813000,
  quotesOutstanding: 4,
  ordersInProgress: 3,
  activitiesThisMonth: 24,
  avgDealSize: 355000,
};

export const pipelineByStage = [
  { stage: 'Lead', value: 210000, count: 1 },
  { stage: 'Spec Influence', value: 740000, count: 2 },
  { stage: 'Budget Pricing', value: 142000, count: 1 },
  { stage: 'Quoted', value: 580000, count: 2 },
  { stage: 'Bid Submitted', value: 275000, count: 1 },
  { stage: 'Negotiation', value: 890000, count: 1 },
  { stage: 'Awarded', value: 356000, count: 1 },
];

export const revenueByLine = [
  { name: 'Carlisle SynTec', value: 1990000 },
  { name: 'VELUX Skylights', value: 740000 },
  { name: 'Tremco Roofing', value: 463000 },
  { name: 'Soprema', value: 356000 },
  { name: 'Kingspan', value: 408000 },
  { name: 'Hunter Panels', value: 142000 },
  { name: 'GP DensDeck', value: 95000 },
];

export const monthlyTrend = [
  { month: 'Oct', won: 280000, pipeline: 2100000 },
  { month: 'Nov', won: 198000, pipeline: 2350000 },
  { month: 'Dec', won: 445000, pipeline: 2680000 },
  { month: 'Jan', won: 615000, pipeline: 2900000 },
  { month: 'Feb', won: 0, pipeline: 3050000 },
  { month: 'Mar', won: 356000, pipeline: 3195000 },
];

export const forecastByRep = [
  { rep: 'Mike Torres', commit: 890000, bestCase: 1475000, upside: 1827000 },
  { rep: 'Sarah Chen', commit: 275000, bestCase: 695000, upside: 905000 },
  { rep: 'James Wright', commit: 356000, bestCase: 451000, upside: 639000 },
];
