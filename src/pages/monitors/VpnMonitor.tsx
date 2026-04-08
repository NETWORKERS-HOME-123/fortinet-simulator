import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { fortiviewVpn } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VpnMonitor() {
  return (
    <DashboardLayout title="FortiView: VPN Monitor" subtitle="VPN session monitoring">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewVpn.length} VPN Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">User / Tunnel</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Source IP</TableHead>
                <TableHead className="text-xs">Duration</TableHead>
                <TableHead className="text-xs">Bytes In</TableHead>
                <TableHead className="text-xs">Bytes Out</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fortiviewVpn.map((v) => (
                <TableRow key={v.user}>
                  <TableCell className="text-xs font-medium py-2">{v.user}</TableCell>
                  <TableCell className="text-xs py-2">{v.tunnelType}</TableCell>
                  <TableCell className="text-xs font-mono py-2">{v.sourceIp}</TableCell>
                  <TableCell className="text-xs py-2">{v.duration}</TableCell>
                  <TableCell className="text-xs py-2">{v.bytesIn}</TableCell>
                  <TableCell className="text-xs py-2">{v.bytesOut}</TableCell>
                  <TableCell className="py-2"><StatusBadge status={v.status === "active" ? "up" : "down"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
