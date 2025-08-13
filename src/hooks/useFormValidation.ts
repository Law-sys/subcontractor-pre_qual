export const useFormValidation = () => ({
  validateRequired: (v: any) => v && String(v).trim().length > 0,
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePhone: (p: string) => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(p),
});
