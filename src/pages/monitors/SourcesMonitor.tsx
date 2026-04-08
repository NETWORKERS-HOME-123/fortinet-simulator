import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiviewSources } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function SourcesMonitor() {
  return (
    <DashboardLayout title="FortiView: Sources" subtitle="Top source IPs by sessions & bandwidth">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewSources.length} Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">IP Address</TableHead>
                <TableHead className="text-xs">Hostname</TableHead>
                <TableHead className="text-xs">Country</TableHead>
                <TableHead className="text-xs">Sessions</TableHead>
                <TableHead className="text-xs">Bandwidth</TableHead>
                <TableHead className="text-xs">Threat Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fortiviewSources.map((s) => (
                <TableRow key={s.ip}>
                  <TableCell className="text-xs font-mono py-2">{s.ip}</TableCell>
                  <TableCell className="text-xs py-2">{s.hostname}</TableCell>
                  <TableCell className="text-xs py-2">{s.country}</TableCell>
                  <TableCell className="text-xs py-2">{s.sessions.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2">{s.bandwidth}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={s.threatScore} className="h-1.5 w-16" />
                      <span className="text-xs">{s.threatScore}</span>
                      {s.threatScore > 70 && <StatusBadge status="critical" />}
                      {s.threatScore > 40 && s.threatScore <= 70 && <StatusBadge status="warning" />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
