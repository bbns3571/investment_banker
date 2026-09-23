import { useState, useMemo } from 'react';
import { InputForm } from './components/InputForm';
import type { PlanConfig } from './components/InputForm';
import { ResultsView } from './components/ResultsView';
import { calculateSIP, calculateLumpSum, calculateRD, calculateRealEstate, calculateEquity, alignPlans } from './lib/engines';
import { PlusCircle } from 'lucide-react';
import './App.css';

function App() {
  const [plans, setPlans] = useState<PlanConfig[]>([
    {
      id: 'plan-1',
      type: 'sip',
      name: 'Plan 1',
      monthlyContribution: 5000,
      annualReturn: 12,
      tenureYears: 10,
      stepUpPercent: 5,
    }
  ]);
  const [isReal, setIsReal] = useState(false);
  const [equityScenario, setEquityScenario] = useState<'conservative' | 'expected' | 'optimistic'>('expected');
  const [inflationRate, setInflationRate] = useState(6); // Default inflation rate for India

  const handleAddPlan = () => {
    if (plans.length >= 3) return;
    setPlans([
      ...plans,
      {
        id: `plan-${Date.now()}`,
        type: 'sip',
        name: `Plan ${plans.length + 1}`,
        monthlyContribution: 5000,
        annualReturn: 12,
        tenureYears: 10,
      }
    ]);
  };

  const handleUpdatePlan = (updatedPlan: PlanConfig) => {
    setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const handleRemovePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  const resultsAndAlignedData = useMemo(() => {
    const calculatedResults: { [key: string]: any } = {};
    const formattedPlans: { id: string; data: { year: number; corpus: number }[] }[] = [];

    plans.forEach(plan => {
      let result;
      switch (plan.type) {
        case 'sip':
          result = calculateSIP(plan.monthlyContribution || 0, plan.annualReturn || 0, plan.tenureYears || 0, plan.stepUpPercent || 0);
          // SIP gives monthByMonth, we need year by year for alignment
          const sipYearData = result.monthByMonth.filter((m: any) => m.month % 12 === 0).map((m: any) => ({ year: m.year, corpus: m.corpus }));
          formattedPlans.push({ id: plan.id, data: sipYearData });
          break;
        case 'lumpSum':
          result = calculateLumpSum(plan.principal || 0, plan.annualReturn || 0, plan.tenureYears || 0, plan.compoundingFrequency);
          formattedPlans.push({ id: plan.id, data: result.yearByYear });
          break;
        case 'rd':
          result = calculateRD(plan.monthlyContribution || 0, plan.annualReturn || 0, plan.tenureMonths || 0);
          const rdYearData = result.monthByMonth.filter((m: any) => m.month % 12 === 0 || m.month === plan.tenureMonths).map((m: any) => ({ year: m.year, corpus: m.corpus }));
          formattedPlans.push({ id: plan.id, data: rdYearData });
          break;
        case 'realEstate':
          result = calculateRealEstate(plan.purchasePrice || 0, plan.annualAppreciation || 0, plan.tenureYears || 0, plan.annualMaintenancePercent || 0);
          formattedPlans.push({ id: plan.id, data: result.yearByYear });
          break;
        case 'equity':
          result = calculateEquity(plan.equityType || 'lumpSum', (plan.equityType === 'sip' ? plan.monthlyContribution : plan.principal) || 0, plan.annualReturn || 0, plan.volatility || 0, plan.tenureYears || 0, plan.stepUpPercent || 0);
          const scenarioResult: any = result[equityScenario];
          const eqData = scenarioResult.yearByYear || scenarioResult.monthByMonth.filter((m: any) => m.month % 12 === 0).map((m: any) => ({ year: m.year, corpus: m.corpus }));
          formattedPlans.push({ id: plan.id, data: eqData });
          // overwrite result for summary cards based on scenario
          result = scenarioResult;
          break;
      }
      calculatedResults[plan.id] = result;
    });

    let alignedData = alignPlans(formattedPlans);

    if (isReal) {
       alignedData = alignedData.map((yearData: any) => {
          const adjusted: any = { year: yearData.year };
          Object.keys(yearData).forEach(key => {
             if (key !== 'year') {
                 adjusted[key] = yearData[key] / Math.pow(1 + inflationRate / 100, yearData.year);
             }
          });
          return adjusted;
       });
    }

    return { calculatedResults, alignedData };
  }, [plans, isReal]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Investment Outcome Simulator</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Compare SIPs, FDs, Real Estate, and more. See your projected growth and milestones.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="w-full lg:w-1/3 space-y-4">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold text-gray-900">Your Plans</h2>
               {plans.length < 3 && (
                 <button
                   onClick={handleAddPlan}
                   className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-accent hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                 >
                   <PlusCircle className="mr-2 h-4 w-4" /> Add Plan
                 </button>
               )}
            </div>

            {plans.map((plan) => (
              <InputForm
                key={plan.id}
                plan={plan}
                onChange={handleUpdatePlan}
                onRemove={handleRemovePlan}
              />
            ))}

            <div className="mt-8 border p-4 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-lg mb-2">Global Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Inflation Rate (%)
                </label>
                <input
                  type="number"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
             <ResultsView
                data={resultsAndAlignedData.alignedData}
                plans={plans}
                isReal={isReal}
                onToggleReal={() => setIsReal(!isReal)}
                results={resultsAndAlignedData.calculatedResults}
                equityScenario={equityScenario}
                onToggleScenario={setEquityScenario}
             />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
