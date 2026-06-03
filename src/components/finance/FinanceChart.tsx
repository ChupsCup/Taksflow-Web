import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { MonthlySummary, CategoryTotals } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';

interface FinanceChartProps {
  monthlyData: MonthlySummary[];
  categoryData: CategoryTotals[];
}

const CHART_COLORS = ['#7C6AF7', '#3ECFA8', '#F7A26A', '#F76A8A', '#6b6b80', '#9B8DF9'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-dark-border bg-dark-card px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs text-dark-muted">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload || !payload[0]) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-dark-border bg-dark-card px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-white">
        {entry.name}: {formatCurrency(entry.value)}
      </p>
    </div>
  );
}

export function FinanceChart({ monthlyData, categoryData }: FinanceChartProps) {
  const hasMonthlyData = monthlyData.length > 0;
  const hasCategoryData = categoryData.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* BarChart: Monthly Income vs Expense */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Pendapatan & Pengeluaran Bulanan</h3>
        {hasMonthlyData ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b6b80', fontSize: 12 }}
                  axisLine={{ stroke: '#1e1e2a' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b6b80', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Pemasukan" fill="#3ECFA8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#F76A8A" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-dark-muted">Belum ada data bulanan</p>
        )}
      </Card>

      {/* PieChart: Expense by Category */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-white">Pengeluaran per Kategori</h3>
        {hasCategoryData ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="category"
                >
                  {categoryData.map((entry, idx) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color || CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-xs text-dark-muted">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-dark-muted">
            Belum ada pengeluaran bulan ini
          </p>
        )}
      </Card>
    </div>
  );
}
