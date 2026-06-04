import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryTotals } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';

interface FinanceChartProps {
  incomeData: CategoryTotals[];
  expenseData: CategoryTotals[];
}

const COLORS = ['#3ECFA8', '#7C6AF7', '#F76A8A', '#F7A26A', '#5B8DEF', '#FF6B9D'];

function sumTotal(data: CategoryTotals[]) {
  return data.reduce((acc, cur) => acc + cur.total, 0);
}

function TooltipContent({ active, payload }: any) {
  if (!active || !payload || !payload[0]) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-dark-border bg-dark-card px-3 py-2 shadow-xl">
      <p className="text-xs text-dark-muted">{entry.payload.category}</p>
      <p className="text-sm font-medium text-white">
        {formatCurrency(entry.value)}
      </p>
      <p className="text-[10px] text-dark-muted">{entry.payload.percentage}%</p>
    </div>
  );
}

export function FinanceChart({ incomeData, expenseData }: FinanceChartProps) {
  const [view, setView] = useState<'income' | 'expense'>('expense');

  const data = view === 'income' ? incomeData : expenseData;
  const total = sumTotal(data);
  const hasData = data.length > 0;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-white">
          Pengeluaran per Kategori
        </h3>

        {/* Toggle */}
        <div className="flex gap-1 rounded-lg bg-dark-bg p-0.5">
          <button
            type="button"
            onClick={() => setView('expense')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              view === 'expense'
                ? 'bg-accent-pink text-white'
                : 'text-dark-muted hover:text-white'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setView('income')}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              view === 'income'
                ? 'bg-secondary text-white'
                : 'text-dark-muted hover:text-white'
            }`}
          >
            Pemasukan
          </button>
        </div>
      </div>

      {hasData ? (
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          {/* Donut */}
          <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="category"
                  animationDuration={400}
                  animationBegin={0}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={entry.category}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<TooltipContent />} wrapperStyle={{ zIndex: 50 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] text-dark-muted">Total</span>
              <span className="text-xs font-bold text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex-1 self-center sm:mt-0">
            <div className="space-y-1">
              {data.map((entry, idx) => (
                <div
                  key={entry.category}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1 transition-colors hover:bg-dark-hover"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-[11px] text-dark-muted">{entry.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-white">
                      {formatCurrency(entry.total)}
                    </span>
                    <span className="w-8 text-right text-[10px] text-dark-muted">
                      {entry.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="py-10 text-center text-xs text-dark-muted">
          Belum ada {view === 'income' ? 'pemasukan' : 'pengeluaran'} bulan ini
        </p>
      )}
    </Card>
  );
}