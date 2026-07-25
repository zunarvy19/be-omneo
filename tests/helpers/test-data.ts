export const testUsers = {
  valid: {
    name: "Test User",
    email: `testuser_${Date.now()}@example.com`,
    password: "password123",
  },
  another: {
    name: "Another User",
    email: `anotheruser_${Date.now()}@example.com`,
    password: "password123",
  },
  invalidEmail: {
    name: "Invalid Email",
    email: "not-an-email",
    password: "password123",
  },
  shortPassword: {
    name: "Short Password",
    email: `shortpw_${Date.now()}@example.com`,
    password: "123",
  },
};

export const testOrders = {
  first: {
    client: "PT Maju Jaya",
    todo: "Landing Page Company Profile",
    price: 2500000,
    description: "Landing page modern dengan 5 section.",
  },
  second: {
    client: "CV Berkah",
    todo: "Logo Design",
    price: 1500000,
    description: "Desain logo untuk brand baru.",
  },
  third: {
    client: "PT Tech Solution",
    todo: "Mobile App UI Design",
    price: 5000000,
    description: "UI/UX design untuk aplikasi mobile.",
  },
  updated: {
    client: "PT Maju Jaya Updated",
    todo: "Landing Page Company Profile v2",
    price: 3000000,
    status: "On Progress",
    description: "Revisi sesuai feedback client.",
  },
};
