import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, Check, Clock, DollarSign, Lock, User, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOCK_MENTOR_SCHEDULE,
  MOCK_MENTOR_REQUESTS,
  type Session,
} from "@/lib/mock-data";
import { MENTEE_NAME_TO_ID, getMentee } from "@/lib/mentees-data";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/dashboard/mentor")({
  head: () => ({ meta: [{ title: "Mentor Dashboard — GuideMe" }] }),
  component: MentorDashboard,
});

function MentorDashboard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);
  if (!isAuthenticated) return null;

  const earningsThisMonth = MOCK_MENTOR_SCHEDULE.reduce((sum, s) => sum + s.price, 0) + 320;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your schedule, requests, and earnings.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="This week" value={String(MOCK_MENTOR_SCHEDULE.length)} sub="scheduled sessions" />
        <StatCard
          label="Pending requests"
          value={String(MOCK_MENTOR_REQUESTS.length)}
          sub="awaiting your reply"
        />
        <StatCard label="Earnings" value={`$${earningsThisMonth}`} sub="this month" />
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Schedule ({MOCK_MENTOR_SCHEDULE.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({MOCK_MENTOR_REQUESTS.length})</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <div className="grid gap-4">
            {MOCK_MENTOR_SCHEDULE.map((s) => (
              <ScheduleCard key={s.id} session={s} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="grid gap-4">
            {MOCK_MENTOR_REQUESTS.map((s) => (
              <RequestCard key={s.id} session={s} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="mt-6">
          <Card className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total earned (last 30 days)
            </p>
            <p className="mt-2 text-4xl font-bold text-gradient-primary">
              ${earningsThisMonth}
            </p>
            <div className="mt-6 space-y-3 border-t pt-4">
              {[...MOCK_MENTOR_SCHEDULE].map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{s.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      with {s.menteeName} · {s.date}
                    </p>
                  </div>
                  <p className="font-semibold">+${s.price}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PricingCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PricingCard() {
  const [hourlyRate, setHourlyRate] = useState(75);
  const [thirtyMinRate, setThirtyMinRate] = useState(40);
  const [packageRate, setPackageRate] = useState(280);
  const [currency, setCurrency] = useState("USD");

  return (
    <Card className="p-6">
      <div className="mb-2 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Mentorship pricing</h2>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Set the price mentees pay for your time. Adjust the slider or type a value.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Currency</Label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="PKR">PKR (₨)</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        <PriceRow
          label="60-minute session"
          description="Standard mentorship hour."
          value={hourlyRate}
          onChange={setHourlyRate}
          max={500}
          currency={currency}
        />
        <PriceRow
          label="30-minute session"
          description="Quick consult or follow-up."
          value={thirtyMinRate}
          onChange={setThirtyMinRate}
          max={300}
          currency={currency}
        />
        <PriceRow
          label="4-session package"
          description="Discounted bundle for committed mentees."
          value={packageRate}
          onChange={setPackageRate}
          max={2000}
          currency={currency}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          onClick={() => toast.success("Pricing updated.")}
        >
          Save pricing
        </Button>
      </div>
    </Card>
  );
}

function PriceRow({
  label,
  description,
  value,
  onChange,
  max,
  currency,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
  currency: string;
}) {
  const symbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₨";
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{symbol}</span>
          <Input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="h-9 w-24"
          />
        </div>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={max}
        step={5}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function ScheduleCard({ session }: { session: Session }) {
  const menteeId = session.menteeName ? MENTEE_NAME_TO_ID[session.menteeName] : undefined;
  const mentee = menteeId ? getMentee(menteeId) : undefined;
  // Mentor has booked this mentee, so they're allowed to view even if private.
  const canView = !!mentee;
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <img
        src={session.menteeAvatar}
        alt={session.menteeName}
        className="h-12 w-12 rounded-full border bg-muted"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{session.menteeName}</p>
          <Badge className="bg-gradient-primary text-primary-foreground">Confirmed</Badge>
          {mentee && !mentee.isPublic && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Lock className="h-2.5 w-2.5" /> Private
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{session.topic}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" /> {session.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {session.time} · {session.durationMinutes}m
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {canView ? (
          <Button size="sm" variant="outline" asChild>
            <Link to="/mentees/$id" params={{ id: menteeId! }}>
              <User className="mr-1 h-3.5 w-3.5" /> View Profile
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled title="Profile unavailable">
            <Lock className="mr-1 h-3.5 w-3.5" /> View Profile
          </Button>
        )}
        <Button size="sm" variant="outline">
          Reschedule
        </Button>
      </div>
    </Card>
  );
}

function RequestCard({ session }: { session: Session }) {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <img
        src={session.menteeAvatar}
        alt={session.menteeName}
        className="h-12 w-12 rounded-full border bg-muted"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{session.menteeName}</p>
        <p className="text-sm text-muted-foreground">{session.topic}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Requested: {session.date} · {session.time} · {session.durationMinutes}m · ${session.price}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <X className="mr-1 h-3.5 w-3.5" /> Decline
        </Button>
        <Button
          size="sm"
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          <Check className="mr-1 h-3.5 w-3.5" /> Accept
        </Button>
      </div>
    </Card>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gradient-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

