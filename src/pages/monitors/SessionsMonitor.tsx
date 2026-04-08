import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fortiviewSessions } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeRangeSelector } from "@/components/widgets/TimeRangeSelector";
import { ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";

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

type Session = typeof fortiviewSessions[number];
type SortKey = "sourceIp" | "destIp" | "bytes" | "duration" | "protocol" | "application";

const PAGE_SIZE = 20;

export default function SessionsMonitor() {
  const [filter, setFilter] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("bytes");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let data = fortiviewSessions;
    if (filter) {
      data = data.filter(s =>
        s.sourceIp.includes(filter) || s.destIp.includes(filter) || s.application.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (protocolFilter !== "all") {
      data = data.filter(s => s.protocol === protocolFilter);
    }
    data = [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [filter, protocolFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <DashboardLayout title="FortiView: Sessions" subtitle="Active session monitor">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium">{filtered.length} Sessions</CardTitle>
          <div className="flex items-center gap-2">
            <TimeRangeSelector />
            <Select value={protocolFilter} onValueChange={setProtocolFilter}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="TCP">TCP</SelectItem>
                <SelectItem value="UDP">UDP</SelectItem>
                <SelectItem value="ICMP">ICMP</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Filter by IP or app..." value={filter} onChange={(e) => { setFilter(e.target.value); setPage(0); }} className="w-48 h-8 text-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {([
                    ["sourceIp", "Source IP"],
                    ["destIp", "Dest IP"],
                    ["protocol", "Protocol"],
                    ["application", "Application"],
                    ["bytes", "Bytes"],
                    ["duration", "Duration"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <TableHead key={key} className="text-xs cursor-pointer select-none" onClick={() => handleSort(key)}>
                      <span className="flex items-center gap-1">{label} <ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                  ))}
                  <TableHead className="text-xs">Policy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelectedSession(s)}>
                    <TableCell className="text-xs font-mono py-2">{s.sourceIp}:{s.sourcePort}</TableCell>
                    <TableCell className="text-xs font-mono py-2">{s.destIp}:{s.destPort}</TableCell>
                    <TableCell className="text-xs py-2">{s.protocol}</TableCell>
                    <TableCell className="text-xs py-2">{s.application}</TableCell>
                    <TableCell className="text-xs py-2">{formatBytes(s.bytes)}</TableCell>
                    <TableCell className="text-xs py-2">{formatDuration(s.duration)}</TableCell>
                    <TableCell className="text-xs py-2">{s.policy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-1">
                <button className="px-2 py-1 text-xs rounded bg-muted disabled:opacity-50" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="px-2 py-1 text-xs rounded bg-muted disabled:opacity-50" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Session Detail — #{selectedSession?.id}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Source:</span> <span className="font-mono text-xs">{selectedSession.sourceIp}:{selectedSession.sourcePort}</span></div>
              <div><span className="text-muted-foreground">Dest:</span> <span className="font-mono text-xs">{selectedSession.destIp}:{selectedSession.destPort}</span></div>
              <div><span className="text-muted-foreground">Protocol:</span> {selectedSession.protocol}</div>
              <div><span className="text-muted-foreground">Application:</span> {selectedSession.application}</div>
              <div><span className="text-muted-foreground">Policy:</span> {selectedSession.policy}</div>
              <div><span className="text-muted-foreground">Bytes:</span> {formatBytes(selectedSession.bytes)}</div>
              <div><span className="text-muted-foreground">Duration:</span> {formatDuration(selectedSession.duration)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
