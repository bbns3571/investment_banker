import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateMilestoneAndPercentile, calculateCAGR } from '../lib/engines';
import type { PlanConfig } from './InputForm';

interface ResultsViewProps {
  data: any[];
  plans: PlanConfig[];
  isReal: boolean;
  onToggleReal: () => void;
  results: { [key: string]: any };
  equityScenario: 'conservative' | 'expected' | 'optimistic';
  onToggleScenario: (scenario: 'conservative' | 'expected' | 'optimistic') => void;
}

const COLORS = ['#aa3bff', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

export function ResultsView({ data, plans, isReal, onToggleReal, results, equityScenario, onToggleScenario }: ResultsViewProps) {
  if (!data || data.length === 0) {
    return <div className="text-center p-8 text-gray-500">Configure a plan to see results.</div>;
  }

  // Calculate highest final value across all plans to show a milestone
  let maxFinalValue = 0;
  Object.keys(results).forEach(key => {
    if (results[key] && results[key].maturityValue > maxFinalValue) {
      maxFinalValue = results[key].maturityValue;
    }
  });

  const { milestone, percentile } = generateMilestoneAndPercentile(maxFinalValue);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Growth Projection</h2>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Nominal</label>
            <button
              onClick={onToggleReal}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${isReal ? 'bg-accent' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isReal ? 'translate-x-6' : ''}`} />
            </button>
            <label className="text-sm font-medium text-gray-700">Inflation Adjusted (Real)</label>
          </div>

          {plans.some(p => p.type === 'equity') && (
            <div className="flex bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => onToggleScenario('conservative')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${equityScenario === 'conservative' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Conservative
              </button>
              <button
                onClick={() => onToggleScenario('expected')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${equityScenario === 'expected' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Expected
              </button>
              <button
                onClick={() => onToggleScenario('optimistic')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${equityScenario === 'optimistic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Optimistic
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-80 w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }} />
            <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
            <Tooltip formatter={(value: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)} />
            <Legend />
            {plans.map((plan, index) => (
              <Line
                key={plan.id}
                type="monotone"
                dataKey={plan.id}
                name={plan.name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan, index) => {
          const res = results[plan.id];
          if (!res) return null;

          let totalInvested = 0;
          if (res.yearByYear && res.yearByYear.length > 0) {
            totalInvested = res.yearByYear[res.yearByYear.length - 1].totalInvested;
          } else if (res.monthByMonth && res.monthByMonth.length > 0) {
            totalInvested = res.monthByMonth[res.monthByMonth.length - 1].totalInvested;
          }

          const maturityValue = res.maturityValue || 0;
          const totalGrowth = maturityValue - totalInvested;

          let cagr = 0;
          const tenureYears = plan.tenureYears || (plan.tenureMonths ? plan.tenureMonths / 12 : 1);
          if (plan.type === 'lumpSum' || (plan.type === 'equity' && plan.equityType === 'lumpSum')) {
            const principal = plan.principal || 1;
            cagr = calculateCAGR(principal, maturityValue, tenureYears);
          } else {
             // For SIP/RD, CAGR is complex. We'll use a simplified approximation or just the expected return.
             // A better approach is using IRR, but standard CAGR formula applies to initial investment.
             // Let's use the provided return as an approximation for display if it's a regular contribution plan
             cagr = plan.annualReturn || 0;
          }

          return (
            <div key={plan.id} className="border p-4 rounded-md shadow-sm" style={{ borderTopColor: COLORS[index % COLORS.length], borderTopWidth: 4 }}>
              <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Maturity Value:</span>
                  <span className="font-semibold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(maturityValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Invested:</span>
                  <span className="font-medium text-gray-700">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Wealth Gained:</span>
                  <span className="font-medium text-green-600">+{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalGrowth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CAGR:</span>
                  <span className="font-medium text-gray-900">{cagr.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {maxFinalValue > 0 && (
        <div className="bg-accent-bg border border-accent-border p-6 rounded-lg text-center">
          <h3 className="text-2xl font-bold text-accent mb-2">{milestone}</h3>
          <p className="text-gray-700">{percentile}</p>
          <p className="text-xs text-gray-500 mt-4">* Projections are illustrative based on your inputs and do not constitute financial advice or guaranteed returns.</p>
        </div>
      )}
    </div>
  );
}
