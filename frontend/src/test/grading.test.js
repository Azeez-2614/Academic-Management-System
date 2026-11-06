import { describe, it, expect } from 'vitest';

function calculateGrade(pct) {
  if (pct == null || pct < 0) return 'F';
  if (pct >= 90.0) return 'A+';
  if (pct >= 80.0) return 'A';
  if (pct >= 70.0) return 'B+';
  if (pct >= 60.0) return 'B';
  if (pct >= 50.0) return 'C';
  if (pct >= 40.0) return 'D';
  return 'F';
}

function calculatePercentage(obtained, total) {
  if (!total || total <= 0) return 0;
  return Math.round((obtained / total) * 10000) / 100;
}

describe('Institutional Grading Scale Tests', () => {
  it('correctly calculates percentages with two decimal precision', () => {
    expect(calculatePercentage(88.5, 100)).toBe(88.5);
    expect(calculatePercentage(25, 30)).toBe(83.33);
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  it('correctly assigns grades on precise policy boundaries', () => {
    expect(calculateGrade(100.0)).toBe('A+');
    expect(calculateGrade(90.0)).toBe('A+');
    expect(calculateGrade(89.99)).toBe('A');
    expect(calculateGrade(80.0)).toBe('A');
    expect(calculateGrade(79.99)).toBe('B+');
    expect(calculateGrade(70.0)).toBe('B+');
    expect(calculateGrade(69.99)).toBe('B');
    expect(calculateGrade(60.0)).toBe('B');
    expect(calculateGrade(59.99)).toBe('C');
    expect(calculateGrade(50.0)).toBe('C');
    expect(calculateGrade(49.99)).toBe('D');
    expect(calculateGrade(40.0)).toBe('D');
    expect(calculateGrade(39.99)).toBe('F');
    expect(calculateGrade(0.0)).toBe('F');
  });
});
