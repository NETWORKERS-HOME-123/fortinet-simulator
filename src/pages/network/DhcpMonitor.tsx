import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { dhcpLeases } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DhcpMonitor() {
  return (
    <DashboardLayout title="DHCP Monitor" subtitle="Active DHCP Leases">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{dhcpLeases.length} Leases</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">IP Address</TableHead>
                <TableHead className="text-xs">MAC Address</TableHead>
                <TableHead className="text-xs">Hostname</TableHead>
                <TableHead className="text-xs">Interface</TableHead>
                <TableHead className="text-xs">Expiry</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dhcpLeases.map((l) => (
                <TableRow key={l.ip}>
                  <TableCell className="text-xs font-mono py-2">{l.ip}</TableCell>
                  <TableCell className="text-xs font-mono py-2">{l.mac}</TableCell>
                  <TableCell className="text-xs py-2">{l.hostname}</TableCell>
                  <TableCell className="text-xs py-2">{l.interface}</TableCell>
                  <TableCell className="text-xs py-2">{l.expiry}</TableCell>
                  <TableCell className="py-2"><StatusBadge status={l.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
