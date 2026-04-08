import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface GaugeWidgetProps {
  title: string;
  value: number;
  label?: string;
  color?: string;
}

export function GaugeWidget({ title, value, label = "%", color }: GaugeWidgetProps) {
  const [liveValue, setLiveValue] = useState(value);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveValue(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 6)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayValue = Math.round(liveValue);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (displayValue / 100) * circumference;
  const gaugeColor = color || (displayValue > 80 ? "hsl(var(--destructive))" : displayValue > 60 ? "hsl(var(--warning))" : "hsl(var(--success))");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={gaugeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold transition-all duration-500">{displayValue}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
