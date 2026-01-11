import { validateBirthDate } from '@/src/utils/validation';

describe('Validation Tests', () => {
  it('should validate a valid birth date', () => {
    const validDate = new Date(1990, 0, 1);
    const result = validateBirthDate(validDate);
    expect(result.valid).toBe(true);
  });

  it('should reject future dates', () => {
    const futureDate = new Date(2100, 0, 1);
    const result = validateBirthDate(futureDate);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('未来');
  });

  it('should reject dates before 1900', () => {
    const oldDate = new Date(1899, 11, 31);
    const result = validateBirthDate(oldDate);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('1900年');
  });
});
