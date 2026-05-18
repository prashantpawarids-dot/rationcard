export type Category = "AAY" | "BPL" | "APL" | "PHH";
export type Status = "Active" | "Inactive";

export interface FamilyMember {
  name: string;
  relation: string;
  age: number;
  aadhaar: string;
}

export interface Beneficiary {
  id: string;
  cardId: string;
  headName: string;
  cnic: string;
  aadhaar: string;
  phone: string;
  address: string;
  district: string;
  category: Category;
  status: Status;
  members: FamilyMember[];
  createdAt: string;
}

export interface Distribution {
  id: string;
  cardId: string;
  headName: string;
  month: string;
  wheatKg: number;
  sugarKg: number;
  gheeKg: number;
  status: "Distributed" | "Pending";
  shop: string;
  date: string;
}

export const RATION_RATES = {
  wheat: 5, // kg per member per month
  sugar: 0.5,
  ghee: 0.25,
};

export function calcRation(memberCount: number, category: Category) {
  const multiplier = category === "AAY" ? 1.4 : category === "BPL" ? 1.15 : category === "PHH" ? 1 : 0.75;
  return {
    wheatKg: +(memberCount * RATION_RATES.wheat * multiplier).toFixed(2),
    sugarKg: +(memberCount * RATION_RATES.sugar * multiplier).toFixed(2),
    gheeKg: +(memberCount * RATION_RATES.ghee * multiplier).toFixed(2),
  };
}

export const MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: "1", cardId: "MH-RC-2025-000123", headName: "Ramesh Patil", cnic: "MH27-8821-7765",
    aadhaar: "4521-8876-9981", phone: "+91 98765 43210",
    address: "Plot 14, Shivaji Nagar, Pune", district: "Pune", category: "BPL", status: "Active",
    members: [
      { name: "Ramesh Patil", relation: "Self", age: 42, aadhaar: "4521-8876-9981" },
      { name: "Sunita Patil", relation: "Wife", age: 38, aadhaar: "4521-8876-1122" },
      { name: "Aarav Patil", relation: "Son", age: 14, aadhaar: "4521-8876-3344" },
      { name: "Priya Patil", relation: "Daughter", age: 11, aadhaar: "4521-8876-5566" },
    ],
    createdAt: "2025-01-12",
  },
  {
    id: "2", cardId: "MH-RC-2025-000124", headName: "Sandeep Joshi", cnic: "MH12-4421-9982",
    aadhaar: "8821-4467-2231", phone: "+91 99887 76655",
    address: "B-203, Sai Residency, Nashik", district: "Nashik", category: "AAY", status: "Active",
    members: [
      { name: "Sandeep Joshi", relation: "Self", age: 55, aadhaar: "8821-4467-2231" },
      { name: "Meena Joshi", relation: "Wife", age: 50, aadhaar: "8821-4467-9912" },
      { name: "Rohit Joshi", relation: "Son", age: 22, aadhaar: "8821-4467-7711" },
    ],
    createdAt: "2025-02-04",
  },
  {
    id: "3", cardId: "MH-RC-2025-000125", headName: "Anjali Deshmukh", cnic: "MH33-1187-3321",
    aadhaar: "1129-6677-4421", phone: "+91 90909 12121",
    address: "Lane 5, Mahatma Phule Road, Nagpur", district: "Nagpur", category: "PHH", status: "Active",
    members: [
      { name: "Anjali Deshmukh", relation: "Self", age: 35, aadhaar: "1129-6677-4421" },
      { name: "Aditya Deshmukh", relation: "Son", age: 8, aadhaar: "1129-6677-9988" },
    ],
    createdAt: "2025-03-10",
  },
  {
    id: "4", cardId: "MH-RC-2025-000126", headName: "Vikas Shinde", cnic: "MH09-2244-5567",
    aadhaar: "3321-8870-1109", phone: "+91 88776 55443",
    address: "Flat 12, Lokhandwala, Mumbai", district: "Mumbai", category: "APL", status: "Inactive",
    members: [
      { name: "Vikas Shinde", relation: "Self", age: 47, aadhaar: "3321-8870-1109" },
      { name: "Kavita Shinde", relation: "Wife", age: 43, aadhaar: "3321-8870-7762" },
    ],
    createdAt: "2024-11-22",
  },
  {
    id: "5", cardId: "MH-RC-2025-000127", headName: "Mahesh Kulkarni", cnic: "MH18-7799-2210",
    aadhaar: "7710-3322-1198", phone: "+91 91234 56780",
    address: "Survey 22, Kothrud, Pune", district: "Pune", category: "BPL", status: "Active",
    members: [
      { name: "Mahesh Kulkarni", relation: "Self", age: 60, aadhaar: "7710-3322-1198" },
      { name: "Lata Kulkarni", relation: "Wife", age: 58, aadhaar: "7710-3322-9981" },
      { name: "Nikhil Kulkarni", relation: "Son", age: 28, aadhaar: "7710-3322-1145" },
      { name: "Snehal Kulkarni", relation: "Daughter-in-law", age: 25, aadhaar: "7710-3322-7723" },
      { name: "Aarya Kulkarni", relation: "Grandchild", age: 2, aadhaar: "7710-3322-3309" },
    ],
    createdAt: "2025-01-30",
  },
];

export const MOCK_DISTRIBUTIONS: Distribution[] = [
  { id: "d1", cardId: "MH-RC-2025-000123", headName: "Ramesh Patil", month: "Nov 2025", wheatKg: 23, sugarKg: 2.3, gheeKg: 1.15, status: "Distributed", shop: "FPS-Pune-014", date: "2025-11-05" },
  { id: "d2", cardId: "MH-RC-2025-000124", headName: "Sandeep Joshi", month: "Nov 2025", wheatKg: 21, sugarKg: 2.1, gheeKg: 1.05, status: "Distributed", shop: "FPS-Nashik-007", date: "2025-11-06" },
  { id: "d3", cardId: "MH-RC-2025-000125", headName: "Anjali Deshmukh", month: "Nov 2025", wheatKg: 10, sugarKg: 1, gheeKg: 0.5, status: "Pending", shop: "FPS-Nagpur-002", date: "—" },
  { id: "d4", cardId: "MH-RC-2025-000127", headName: "Mahesh Kulkarni", month: "Nov 2025", wheatKg: 28.75, sugarKg: 2.87, gheeKg: 1.43, status: "Distributed", shop: "FPS-Pune-014", date: "2025-11-09" },
];

export const MONTHLY_DISTRIBUTION = [
  { month: "Jun", distributed: 3120, pending: 410 },
  { month: "Jul", distributed: 3280, pending: 380 },
  { month: "Aug", distributed: 3402, pending: 290 },
  { month: "Sep", distributed: 3510, pending: 340 },
  { month: "Oct", distributed: 3680, pending: 220 },
  { month: "Nov", distributed: 3812, pending: 188 },
];

export const CATEGORY_BREAKDOWN = [
  { name: "AAY", value: 820 },
  { name: "BPL", value: 1540 },
  { name: "PHH", value: 1120 },
  { name: "APL", value: 520 },
];
