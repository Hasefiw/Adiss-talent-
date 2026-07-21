/**
 * Validation schemas using simple validators
 * For production, consider using zod or joi
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

export function validateString(value: any, minLength: number = 1, maxLength: number = 500): string {
  if (typeof value !== 'string') {
    throw new ValidationError('Value must be a string');
  }
  if (value.length < minLength) {
    throw new ValidationError(`Value must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`Value must be at most ${maxLength} characters`);
  }
  return value.trim();
}

export function validateNumber(value: any, min?: number, max?: number): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError('Value must be a number');
  }
  if (min !== undefined && num < min) {
    throw new ValidationError(`Value must be at least ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new ValidationError(`Value must be at most ${max}`);
  }
  return num;
}

export function validateEnum<T>(value: any, allowedValues: T[]): T {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`Value must be one of: ${allowedValues.join(', ')}`);
  }
  return value as T;
}

export function validateObject(obj: any): Record<string, any> {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new ValidationError('Value must be an object');
  }
  return obj;
}
