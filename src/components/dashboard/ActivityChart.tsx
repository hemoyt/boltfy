import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", subscribers: 12, emails: 45 },
  { name: "Tue", subscribers: 19, emails: 52 },
  { name: "Wed", subscribers: 15, emails: 38 },
  { name: "Thu", subscribers: 28, emails: 67 },
  { name: "Fri", subscribers: 22, emails: 55 },
  { name: "Sat", subscribers: 8, emails: 23 },
  { name: "Sun", subscribers: 14, emails: 41 },
];

export function ActivityChart() {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-md">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Weekly Activity
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(220, 70%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(220, 70%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
            <XAxis
              dataKey="name"
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(220, 10%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 25%, 12%)",
                border: "1px solid hsl(220, 20%, 18%)",
                borderRadius: "8px",
                color: "hsl(220, 15%, 95%)",
              }}
            />
            <Area
              type="monotone"
              dataKey="subscribers"
              stroke="hsl(174, 72%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubscribers)"
            />
            <Area
              type="monotone"
              dataKey="emails"
              stroke="hsl(220, 70%, 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEmails)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">New Subscribers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(220, 70%, 60%)" }} />
          <span className="text-sm text-muted-foreground">Emails Sent</span>
        </div>
      </div>
    </div>
  );
}
