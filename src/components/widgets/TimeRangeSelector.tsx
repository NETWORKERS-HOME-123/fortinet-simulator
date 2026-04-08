import { Button } from "@/components/ui/button";
import { useState } from "react";

const ranges = ["1m", "5m", "1h", "24h"];

export function TimeRangeSelector() {
  const [selected, setSelected] = useState("5m");
  return (
    <div className="flex gap-1">
      {ranges.map((r) => (
        <Button
          key={r}
          variant={selected === r ? "default" : "ghost"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setSelected(r)}
        >
          {r}
        </Button>
      ))}
    </div>
  );
}
