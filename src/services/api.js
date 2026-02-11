// Simulating API calls with delays
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data
const USERS = [
    { id: 1, email: "admin@avaloon.com", password: "123", role: "admin", name: "Admin User", sector: "Management" },
    { id: 2, email: "video@avaloon.com", password: "123", role: "videomaker", name: "John Video", sector: "Production" },
    { id: 3, email: "traffic@avaloon.com", password: "123", role: "traffic_manager", name: "Emily Traffic", sector: "Marketing" },
];

const SHOOTS = [
    { id: 1, title: "Mountain Gear Commercial", client: "Banff National Park", date: new Date(2024, 9, 14), status: "Active", crew: ["Sarah Jenkins", "Alex Thompson"] },
    { id: 2, title: "SolarStream Testimonials", client: "Studio 8 - HQ", date: new Date(2024, 9, 11), status: "Pending", crew: ["Davide Russo"] },
    { id: 3, title: "Nike Runner - Rough Cut", client: "Post Production Room 4", date: new Date(2024, 9, 24), status: "Done", crew: ["Elena Rodriguez"] },
];

const TEAM = [
    { id: 1, name: "Sarah Jenkins", role: "Lead Videographer", specialty: "Steadicam, 4K Cinema", status: "On-Set", equipment: "Sony FX6 Cinema Line" },
    { id: 2, name: "Elena Rodriguez", role: "Sound Engineer", specialty: "Field Recording, Post-Prod", status: "Return Holiday", equipment: "Zoom Field Pro" },
    { id: 3, name: "Jessica Lee", role: "VFX Artist", specialty: "3D/4D Max, Motion Graphics", status: "Home Studio", equipment: "Mac Studio M2 Ultra" },
    { id: 4, name: "Alex Thompson", role: "Grip / Lighting", specialty: "Dolly Ops, Rigging", status: "Exterior Location", equipment: "Standard Grip Truck" },
    { id: 5, name: "Davide Russo", role: "Drone Operator", specialty: "Aerial Piloting, FPV Racing", status: "Remote / On-Call", equipment: "DJI Mavic 3 Cine" },
    { id: 6, name: "Marcus Chen", role: "Senior Producer", specialty: "Budget, DMX Control", status: "On-Set", equipment: "Aputure 600d Pro" },
];

const KPI_DATA = {
    activeShoots: 12,
    pendingEdits: 8,
    teamAvailability: 95,
    monthlyRevenue: 124500,
    costDistribution: [
        { name: "Marketing", value: 3000 },
        { name: "Operations", value: 4500 },
        { name: "Content", value: 4500 },
    ],
    mediaDaysPerMonth: [
        { name: "Jan", value: 12 },
        { name: "Feb", value: 19 },
        { name: "Mar", value: 10 },
        { name: "Apr", value: 24 },
        { name: "May", value: 28 },
        { name: "Jun", value: 20 },
    ]
};

export const api = {
    auth: {
        login: async (email, password) => {
            await delay(800);
            const user = USERS.find((u) => u.email === email && u.password === password);
            if (user) return { user, token: "mock-jwt-token" };
            throw new Error("Invalid credentials");
        },
        getUser: async () => {
            // Mock checking token
            return USERS[0];
        }
    },
    dashboard: {
        getShoots: async () => {
            await delay(500);
            return SHOOTS;
        },
        getKPIs: async () => {
            await delay(500);
            return KPI_DATA;
        }
    },
    team: {
        getAll: async () => {
            await delay(600);
            return TEAM;
        }
    }
};
