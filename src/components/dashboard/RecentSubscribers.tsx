import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: "active" | "pending" | "unsubscribed";
}

interface RecentSubscribersProps {
  subscribers: Subscriber[];
}

const statusStyles = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  unsubscribed: "bg-muted text-muted-foreground border-muted",
};

export function RecentSubscribers({ subscribers }: RecentSubscribersProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-6 shadow-md">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recent Subscribers
      </h3>
      <div className="space-y-4">
        {subscribers.map((subscriber, index) => (
          <div
            key={subscriber.id}
            className={cn(
              "flex items-center justify-between py-3 animate-slide-up",
              index !== subscribers.length - 1 && "border-b border-border"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-accent text-accent-foreground font-medium">
                  {subscriber.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{subscriber.name}</p>
                <p className="text-sm text-muted-foreground">
                  {subscriber.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant="outline"
                className={cn("capitalize", statusStyles[subscriber.status])}
              >
                {subscriber.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {subscriber.subscribedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
