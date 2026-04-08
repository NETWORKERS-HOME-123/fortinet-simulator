import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Widget {
  id: string;
  name: string;
  description: string;
}

interface AddWidgetDialogProps {
  widgets: Widget[];
  onAdd?: (id: string) => void;
}

export function AddWidgetDialog({ widgets, onAdd }: AddWidgetDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-auto">
          {widgets.map((w) => (
            <button
              key={w.id}
              className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
              onClick={() => onAdd?.(w.id)}
            >
              <div className="text-sm font-medium">{w.name}</div>
              <div className="text-xs text-muted-foreground">{w.description}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
