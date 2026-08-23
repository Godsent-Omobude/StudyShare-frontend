// Shared password requirement checklist for Register, Reset Password and
// Change Password forms. Mirrors the backend policy in
// backend/utils/passwordPolicy.js — the backend remains the final authority.

export const PASSWORD_MIN_LENGTH = 12;

export const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: "special",
    label: "One special character (e.g. ! @ # $ %)",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export const isPasswordValid = (value) =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(value || ""));
