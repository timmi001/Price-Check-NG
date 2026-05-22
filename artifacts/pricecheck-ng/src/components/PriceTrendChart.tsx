import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatNaira } from "@/lib/format";
import type { PriceHistoryPoint } from "@workspace/api-client-react";

interface PriceTrendChartProps {
  data: PriceHistoryPoint[];
  loading?: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-2 shadow text-xs">
        <p className="text-muted-foreground mb-1">{formatDate(label)}</p>
        <p className="font-semibold text-foreground">Avg: {formatNaira(payload[0]?.value)}</p>
        {payload[1] && <p className="text-primary">Min: {formatNaira(payload[1]?.value)}</p>}
      </div>
    );
  }
  return null;
};

export default function PriceTrendChart({ data, loading }: PriceTrendChartProps) {
  if (loading) {
    return <div className="h-40 bg-muted animate-pulse rounded-lg" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
        No price history available
      </div>
    );
  }

  const chartData = data.map((p) => ({
    date: p.date,
    avg: Number(p.average_price),
    min: Number(p.min_price),
  }));

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          interval={6}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="min" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
