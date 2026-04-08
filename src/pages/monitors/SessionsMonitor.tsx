import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fortiviewSessions } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

export default function SessionsMonitor() {
  const [filter, setFilter] = useState("");
  const filtered = fortiviewSessions.filter((s) =>
    !filter || s.sourceIp.includes(filter) || s.destIp.includes(filter) || s.application.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <DashboardLayout title="FortiView: Sessions" subtitle="Active session monitor">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">{filtered.length} Sessions</CardTitle>
          <Input placeholder="Filter by IP or application..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-64 h-8 text-xs" />
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Source IP</TableHead>
                  <TableHead className="text-xs">Src Port</TableHead>
                  <TableHead className="text-xs">Dest IP</TableHead>
                  <TableHead className="text-xs">Dst Port</TableHead>
                  <TableHead className="text-xs">Protocol</TableHead>
                  <TableHead className="text-xs">Application</TableHead>
                  <TableHead className="text-xs">Policy</TableHead>
                  <TableHead className="text-xs">Bytes</TableHead>
                  <TableHead className="text-xs">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs font-mono py-2">{s.sourceIp}</TableCell>
                    <TableCell className="text-xs py-2">{s.sourcePort}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{s.destIp}</TableCell>
                    <TableCell className="text-xs py-2">{s.destPort}</TableCell>
                    <TableCell className="text-xs py-2">{s.protocol}</TableCell>
                    <TableCell className="text-xs py-2">{s.application}</TableCell>
                    <TableCell className="text-xs py-2">{s.policy}</TableCell>
                    <TableCell className="text-xs py-2">{formatBytes(s.bytes)}</TableCell>
                    <TableCell className="text-xs py-2">{formatDuration(s.duration)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
