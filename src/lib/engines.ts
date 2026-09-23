export function calculateSIP(
  monthlyContribution: number,
  annualReturn: number,
  tenureYears: number,
  stepUpPercent: number = 0
) {
  const monthlyRate = annualReturn / 12 / 100;
  const totalMonths = tenureYears * 12;

  let currentMonthlyContribution = monthlyContribution;
  let currentCorpus = 0;
  let totalInvested = 0;
  const monthByMonth = [];

  for (let m = 1; m <= totalMonths; m++) {
    if (m > 1 && (m - 1) % 12 === 0) {
      currentMonthlyContribution *= 1 + stepUpPercent / 100;
    }

    totalInvested += currentMonthlyContribution;
    currentCorpus += currentMonthlyContribution;
    currentCorpus *= 1 + monthlyRate;

    monthByMonth.push({
      month: m,
      year: Math.ceil(m / 12),
      contribution: currentMonthlyContribution,
      totalInvested: totalInvested,
      corpus: currentCorpus,
    });
  }

  return {
    monthByMonth,
    maturityValue: currentCorpus,
  };
}

export function calculateLumpSum(
  principal: number,
  annualRate: number,
  tenureYears: number,
  compoundingFrequency: 'annual' | 'quarterly' | 'monthly' = 'annual'
) {
  let n = 1;
  if (compoundingFrequency === 'quarterly') n = 4;
  if (compoundingFrequency === 'monthly') n = 12;

  const r = annualRate / 100;
  const yearByYear = [];

  for (let y = 1; y <= tenureYears; y++) {
    const value = principal * Math.pow(1 + r / n, n * y);
    yearByYear.push({
      year: y,
      totalInvested: principal,
      corpus: value,
    });
  }

  return {
    yearByYear,
    maturityValue: yearByYear.length > 0 ? yearByYear[yearByYear.length - 1].corpus : principal,
  };
}

export function calculateRD(
  monthlyDeposit: number,
  annualRate: number,
  tenureMonths: number
) {
  const R = annualRate / 400; // Rate per quarter
  const monthByMonth = [];
  let totalInvested = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    let corpusAtM = 0;
    for (let k = 1; k <= m; k++) {
      corpusAtM += monthlyDeposit * Math.pow(1 + R, (m - k + 1) / 3);
    }

    totalInvested += monthlyDeposit;
    monthByMonth.push({
      month: m,
      year: Math.ceil(m / 12),
      totalInvested: totalInvested,
      corpus: corpusAtM,
    });
  }

  return {
    monthByMonth,
    maturityValue: monthByMonth.length > 0 ? monthByMonth[monthByMonth.length - 1].corpus : 0,
  };
}

export function calculateRealEstate(
  purchasePrice: number,
  annualAppreciation: number,
  tenureYears: number,
  annualMaintenancePercent: number = 0
) {
  const yearByYear = [];
  let currentValue = purchasePrice;
  let cumulativeCosts = 0;

  for (let y = 1; y <= tenureYears; y++) {
    const costThisYear = currentValue * (annualMaintenancePercent / 100);
    cumulativeCosts += costThisYear;
    currentValue *= 1 + annualAppreciation / 100;

    yearByYear.push({
      year: y,
      totalInvested: purchasePrice + cumulativeCosts,
      corpus: currentValue - cumulativeCosts, // Net value
      grossValue: currentValue,
      cumulativeCosts: cumulativeCosts,
    });
  }

  return {
    yearByYear,
    maturityValue: yearByYear.length > 0 ? yearByYear[yearByYear.length - 1].corpus : purchasePrice,
  };
}

export function calculateEquity(
  type: 'lumpSum' | 'sip',
  amount: number,
  annualReturn: number,
  volatility: number,
  tenureYears: number,
  stepUpPercent: number = 0
) {
  const expectedReturn = annualReturn;
  const conservativeReturn = annualReturn - volatility;
  const optimisticReturn = annualReturn + volatility;

  let expected;
  let conservative;
  let optimistic;

  if (type === 'lumpSum') {
    expected = calculateLumpSum(amount, expectedReturn, tenureYears);
    conservative = calculateLumpSum(amount, conservativeReturn, tenureYears);
    optimistic = calculateLumpSum(amount, optimisticReturn, tenureYears);
  } else {
    expected = calculateSIP(amount, expectedReturn, tenureYears, stepUpPercent);
    conservative = calculateSIP(amount, conservativeReturn, tenureYears, stepUpPercent);
    optimistic = calculateSIP(amount, optimisticReturn, tenureYears, stepUpPercent);
  }

  return {
    conservative,
    expected,
    optimistic,
  };
}

export function calculateInflationAdjustment(
  nominalValues: { year: number; corpus: number; [key: string]: any }[],
  inflationRate: number = 6
) {
  return nominalValues.map(item => ({
    ...item,
    realCorpus: item.corpus / Math.pow(1 + inflationRate / 100, item.year)
  }));
}

export function alignPlans(plans: { id: string; data: { year: number; corpus: number }[] }[]) {
  if (plans.length === 0) return [];

  const maxYears = Math.max(...plans.map(p => p.data.length));
  const alignedData = [];

  for (let y = 1; y <= maxYears; y++) {
    const yearData: any = { year: y };
    plans.forEach(plan => {
      const planYearData = plan.data.find(d => d.year === y);
      yearData[plan.id] = planYearData ? planYearData.corpus : (plan.data.length > 0 ? plan.data[plan.data.length - 1].corpus : 0);
    });
    alignedData.push(yearData);
  }

  return alignedData;
}

export function calculateCAGR(initialValue: number, finalValue: number, years: number) {
  if (initialValue <= 0 || years <= 0) return 0;
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

export function generateMilestoneAndPercentile(finalValue: number) {
  let milestone = "";
  let percentile = "";

  if (finalValue >= 10000000) {
    milestone = "You crossed ₹1 crore!";
    percentile = "Top 1% of households (illustrative)";
  } else if (finalValue >= 5000000) {
    milestone = "You crossed ₹50 lakhs!";
    percentile = "Top 5% of households (illustrative)";
  } else if (finalValue >= 1000000) {
    milestone = "You crossed ₹10 lakhs!";
    percentile = "Top 20% of households (illustrative)";
  } else {
    milestone = "Keep going! Wealth takes time.";
    percentile = "Building your foundation";
  }

  return { milestone, percentile };
}
