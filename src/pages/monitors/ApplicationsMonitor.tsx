import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fortiviewApplications } from "@/data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function ApplicationsMonitor() {
  return (
    <DashboardLayout title="FortiView: Applications" subtitle="Application usage and risk assessment">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{fortiviewApplications.length} Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Application</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Bandwidth</TableHead>
                <TableHead className="text-xs">Sessions</TableHead>
                <TableHead className="text-xs">Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fortiviewApplications.map((a) => (
                <TableRow key={a.name}>
                  <TableCell className="text-xs font-medium py-2">{a.name}</TableCell>
                  <TableCell className="text-xs py-2">{a.category}</TableCell>
                  <TableCell className="text-xs py-2">{a.bandwidth}</TableCell>
                  <TableCell className="text-xs py-2">{a.sessions.toLocaleString()}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={a.risk * 20} className="h-1.5 w-12" />
                      <span className="text-xs">{a.risk}/5</span>
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
