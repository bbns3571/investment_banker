import React from 'react';

export type PlanType = 'sip' | 'lumpSum' | 'rd' | 'realEstate' | 'equity';

export interface PlanConfig {
  id: string;
  type: PlanType;
  name: string;
  monthlyContribution?: number;
  principal?: number;
  purchasePrice?: number;
  annualReturn?: number;
  annualAppreciation?: number;
  tenureYears?: number;
  tenureMonths?: number;
  stepUpPercent?: number;
  compoundingFrequency?: 'annual' | 'quarterly' | 'monthly';
  annualMaintenancePercent?: number;
  equityType?: 'lumpSum' | 'sip';
  volatility?: number;
}

interface InputFormProps {
  plan: PlanConfig;
  onChange: (updatedPlan: PlanConfig) => void;
  onRemove: (id: string) => void;
}

export function InputForm({ plan, onChange, onRemove }: InputFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...plan,
      [name]: e.target.type === 'number' ? Number(value) : value,
    });
  };

  return (
    <div className="border p-4 rounded-lg bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          name="name"
          value={plan.name}
          onChange={handleChange}
          className="text-lg font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-accent"
        />
        <button onClick={() => onRemove(plan.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
          Remove
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
        <select
          name="type"
          value={plan.type}
          onChange={handleChange}
          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:border-accent focus:ring-accent"
        >
          <option value="sip">SIP / Mutual Fund</option>
          <option value="lumpSum">Lump Sum / FD</option>
          <option value="rd">Recurring Deposit (RD)</option>
          <option value="realEstate">Real Estate / Land</option>
          <option value="equity">Equity / Stocks</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.type === 'sip' && (
          <>
            <div>
              <label className="block text-sm text-gray-600">Monthly Contribution (₹)</label>
              <input type="number" name="monthlyContribution" value={plan.monthlyContribution || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Expected Annual Return (%)</label>
              <input type="number" name="annualReturn" value={plan.annualReturn || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Tenure (Years)</label>
              <input type="number" name="tenureYears" value={plan.tenureYears || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Step-up % (Optional)</label>
              <input type="number" name="stepUpPercent" value={plan.stepUpPercent || 0} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
          </>
        )}

        {plan.type === 'lumpSum' && (
          <>
            <div>
              <label className="block text-sm text-gray-600">Principal Amount (₹)</label>
              <input type="number" name="principal" value={plan.principal || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Annual Rate (%)</label>
              <input type="number" name="annualReturn" value={plan.annualReturn || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Tenure (Years)</label>
              <input type="number" name="tenureYears" value={plan.tenureYears || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Compounding Frequency</label>
              <select name="compoundingFrequency" value={plan.compoundingFrequency || 'annual'} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md">
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </>
        )}

        {plan.type === 'rd' && (
          <>
            <div>
              <label className="block text-sm text-gray-600">Monthly Deposit (₹)</label>
              <input type="number" name="monthlyContribution" value={plan.monthlyContribution || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Annual Rate (%)</label>
              <input type="number" name="annualReturn" value={plan.annualReturn || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Tenure (Months)</label>
              <input type="number" name="tenureMonths" value={plan.tenureMonths || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
          </>
        )}

        {plan.type === 'realEstate' && (
          <>
            <div>
              <label className="block text-sm text-gray-600">Purchase Price (₹)</label>
              <input type="number" name="purchasePrice" value={plan.purchasePrice || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Expected Annual Appreciation (%)</label>
              <input type="number" name="annualAppreciation" value={plan.annualAppreciation || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Holding Period (Years)</label>
              <input type="number" name="tenureYears" value={plan.tenureYears || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Annual Costs (% of value, optional)</label>
              <input type="number" name="annualMaintenancePercent" value={plan.annualMaintenancePercent || 0} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
          </>
        )}

        {plan.type === 'equity' && (
          <>
            <div>
              <label className="block text-sm text-gray-600">Investment Method</label>
              <select name="equityType" value={plan.equityType || 'lumpSum'} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md">
                <option value="lumpSum">Lump Sum</option>
                <option value="sip">SIP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Amount (₹)</label>
              <input type="number" name={plan.equityType === 'sip' ? 'monthlyContribution' : 'principal'} value={plan.equityType === 'sip' ? plan.monthlyContribution || '' : plan.principal || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Expected Avg Annual Return (%)</label>
              <input type="number" name="annualReturn" value={plan.annualReturn || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Volatility / Band (%)</label>
              <input type="number" name="volatility" value={plan.volatility || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Tenure (Years)</label>
              <input type="number" name="tenureYears" value={plan.tenureYears || ''} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
            </div>
            {plan.equityType === 'sip' && (
              <div>
                <label className="block text-sm text-gray-600">Step-up % (Optional)</label>
                <input type="number" name="stepUpPercent" value={plan.stepUpPercent || 0} onChange={handleChange} className="mt-1 block w-full border p-2 rounded-md" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
