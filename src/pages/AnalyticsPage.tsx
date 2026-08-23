import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAnalyticsData } from '@/features/analytics/hooks/useAnalyticsData';
import { Skeleton } from '@/components/ui/Skeleton';

const STATUS_COLORS = ['#8e8e8e', '#10a37f', '#f59e0b', '#22c55e'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  // If label is present, use it; otherwise use single item name if applicable
  const headerLabel = label || (payload.length === 1 && payload[0].name !== payload[0].dataKey ? payload[0].name : null);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md dark:border-gray-700 dark:bg-gray-800">
      {headerLabel && (
        <p className="mb-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">{headerLabel}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const color = entry.color || entry.fill;
          const name = entry.name || entry.dataKey;
          return (
            <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              {(!headerLabel || payload.length > 1 || name !== headerLabel) && (
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {name} :
                </span>
              )}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { isLoading, velocity, statusDistribution, priorityBreakdown, completionTrend } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Sprint Velocity (tasks completed)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="sprint" stroke="#6b7280" />
              <YAxis allowDecimals={false} stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#10a37f" radius={[4, 4, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Task Status Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                isAnimationActive
              >
                {statusDistribution.map((_, index) => (
                  <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority Breakdown by Column">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="status" stroke="#6b7280" />
              <YAxis allowDecimals={false} stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="high" stackId="p" fill="#ef4444" isAnimationActive />
              <Bar dataKey="medium" stackId="p" fill="#f59e0b" isAnimationActive />
              <Bar dataKey="low" stackId="p" fill="#22c55e" isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis allowDecimals={false} stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="completed" stroke="#10a37f" strokeWidth={2} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

