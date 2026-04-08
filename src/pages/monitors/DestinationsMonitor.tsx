import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiviewDestinations } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DestinationsMonitor() {
  return (
    <DashboardLayout title="FortiView: Destinations" subtitle="Top destination IPs/domains by traffic">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewDestinations.length} Destinations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">IP Address</TableHead>
                <TableHead className="text-xs">Domain</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Sessions</TableHead>
                <TableHead className="text-xs">Bandwidth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fortiviewDestinations.map((d) => (
                <TableRow key={d.ip}>
                  <TableCell className="text-xs font-mono py-2">{d.ip}</TableCell>
                  <TableCell className="text-xs py-2">{d.domain}</TableCell>
                  <TableCell className="py-2">
                    <StatusBadge status={d.category === "Botnet C&C" ? "critical" : "info"} />
                    <span className="text-xs ml-1">{d.category}</span>
                  </TableCell>
                  <TableCell className="text-xs py-2">{d.sessions.toLocaleString()}</TableCell>
                  <TableCell className="text-xs py-2">{d.bandwidth}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
