import { calculateSIP, calculateLumpSum, calculateRD, calculateRealEstate, calculateEquity, calculateInflationAdjustment, alignPlans, generateMilestoneAndPercentile } from './src/lib/engines.js';

console.log("--- Testing calculateSIP ---");
const sip = calculateSIP(1000, 12, 1);
console.log("Maturity Value (1000/mo, 12%, 1 yr):", sip.maturityValue); // ~12682.5

console.log("\n--- Testing calculateLumpSum ---");
const lumpSum = calculateLumpSum(10000, 10, 5, 'annual');
console.log("Maturity Value (10000, 10%, 5 yr):", lumpSum.maturityValue); // ~16105.1

console.log("\n--- Testing calculateRD ---");
const rd = calculateRD(1000, 8, 12);
console.log("Maturity Value (1000/mo, 8%, 12 mos):", rd.maturityValue); // ~12528

console.log("\n--- Testing calculateRealEstate ---");
const realEstate = calculateRealEstate(5000000, 5, 5, 1);
console.log("Maturity Value (5000000, 5% apprec, 5 yr, 1% maint):", realEstate.maturityValue);

console.log("\n--- Testing calculateEquity ---");
const equity = calculateEquity('lumpSum', 10000, 12, 2, 5);
console.log("Expected Maturity (10000, 12%+/-2%, 5 yr):", equity.expected.maturityValue);

console.log("\n--- Testing calculateInflationAdjustment ---");
const nominal = [{ year: 1, corpus: 10600 }, { year: 2, corpus: 11236 }];
const real = calculateInflationAdjustment(nominal, 6);
console.log("Real Values (6% inf):", real);

console.log("\n--- Testing alignPlans ---");
const planA = { id: 'A', data: [{ year: 1, corpus: 100 }, { year: 2, corpus: 200 }] };
const planB = { id: 'B', data: [{ year: 1, corpus: 150 }] };
const aligned = alignPlans([planA, planB]);
console.log("Aligned Plans:", aligned);

console.log("\n--- Testing generateMilestoneAndPercentile ---");
console.log("1 Crore:", generateMilestoneAndPercentile(10000000));
console.log("5 Lakhs:", generateMilestoneAndPercentile(500000));
