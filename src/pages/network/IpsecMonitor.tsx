import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { ipsecTunnels } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

type Tunnel = typeof ipsecTunnels[number];

export default function IpsecMonitor() {
  const [selected, setSelected] = useState<Tunnel | null>(null);

  return (
    <DashboardLayout title="IPsec Monitor" subtitle="IPsec VPN Tunnel Status">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{ipsecTunnels.length} Tunnels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Remote Gateway</TableHead>
                <TableHead className="text-xs">Phase 1</TableHead>
                <TableHead className="text-xs">Phase 2</TableHead>
                <TableHead className="text-xs">Incoming</TableHead>
                <TableHead className="text-xs">Outgoing</TableHead>
                <TableHead className="text-xs">Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ipsecTunnels.map((t) => (
                <TableRow key={t.name} className="cursor-pointer" onClick={() => setSelected(t)}>
                  <TableCell className="text-xs font-medium py-2">{t.name}</TableCell>
                  <TableCell className="text-xs font-mono py-2">{t.remote}</TableCell>
                  <TableCell className="py-2"><StatusBadge status={t.phase1} /></TableCell>
                  <TableCell className="py-2"><StatusBadge status={t.phase2} /></TableCell>
                  <TableCell className="text-xs py-2">{t.incoming}</TableCell>
                  <TableCell className="text-xs py-2">{t.outgoing}</TableCell>
                  <TableCell className="text-xs py-2">{t.uptime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">IPsec Tunnel — {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selected.name}</span></div>
              <div><span className="text-muted-foreground">Remote:</span> <span className="font-mono">{selected.remote}</span></div>
              <div><span className="text-muted-foreground">Phase 1:</span> <StatusBadge status={selected.phase1} /></div>
              <div><span className="text-muted-foreground">Phase 2:</span> <StatusBadge status={selected.phase2} /></div>
              <div><span className="text-muted-foreground">Incoming:</span> {selected.incoming}</div>
              <div><span className="text-muted-foreground">Outgoing:</span> {selected.outgoing}</div>
              <div><span className="text-muted-foreground">Uptime:</span> {selected.uptime}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
