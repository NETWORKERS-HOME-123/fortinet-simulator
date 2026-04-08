import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSimulation, NetworkInterface } from "@/simulation/simulationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Network } from "lucide-react";
import { toast } from "sonner";

export default function InterfacesPage() {
  const { state, updateInterface } = useSimulation();
  const [editing, setEditing] = useState<NetworkInterface | null>(null);
  const [formData, setFormData] = useState<Partial<NetworkInterface>>({});

  const openEdit = (iface: NetworkInterface) => {
    setEditing(iface);
    setFormData({ ...iface });
  };

  const handleSave = () => {
    if (!editing) return;
    updateInterface(editing.name, formData);
    setEditing(null);
    toast.success(`Interface ${editing.name} updated`);
  };

  const toggleAccess = (access: string) => {
    const current = formData.adminAccess || [];
    setFormData(f => ({
      ...f,
      adminAccess: current.includes(access) ? current.filter(a => a !== access) : [...current, access],
    }));
  };

  return (
    <DashboardLayout title="Interfaces" subtitle="Network Interface Configuration">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">{state.interfaces.length} interfaces configured</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead>IP/Mask</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>MTU</TableHead>
                  <TableHead>Admin Access</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.interfaces.map(iface => (
                  <TableRow key={iface.name} className="cursor-pointer" onClick={() => openEdit(iface)}>
                    <TableCell className="font-mono text-sm font-medium">{iface.name}</TableCell>
                    <TableCell>{iface.alias}</TableCell>
                    <TableCell className="font-mono text-xs">{iface.ip}</TableCell>
                    <TableCell>
                      <Badge variant={iface.status === "up" ? "default" : "destructive"} className="text-[10px]">
                        {iface.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{iface.speed}</TableCell>
                    <TableCell className="text-xs capitalize">{iface.mode}</TableCell>
                    <TableCell className="text-xs">{iface.zone}</TableCell>
                    <TableCell className="text-xs">{iface.mtu}</TableCell>
                    <TableCell className="text-xs">{iface.adminAccess.join(", ")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(iface); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Sheet open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
          <SheetContent className="w-[450px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Interface: {editing?.name}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Alias</Label>
                <Input value={formData.alias || ""} onChange={e => setFormData(f => ({ ...f, alias: e.target.value }))} />
              </div>
              <div>
                <Label>IP / Mask</Label>
                <Input value={formData.ip || ""} onChange={e => setFormData(f => ({ ...f, ip: e.target.value }))} placeholder="10.0.1.1/24" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.status === "up"} onCheckedChange={v => setFormData(f => ({ ...f, status: v ? "up" : "down" }))} />
                <Label>Admin Status: {formData.status?.toUpperCase()}</Label>
              </div>
              <div>
                <Label>Addressing Mode</Label>
                <Select value={formData.mode} onValueChange={v => setFormData(f => ({ ...f, mode: v as "static" | "dhcp" | "pppoe" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="dhcp">DHCP</SelectItem>
                    <SelectItem value="pppoe">PPPoE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>MTU</Label>
                <Input type="number" value={formData.mtu || 1500} onChange={e => setFormData(f => ({ ...f, mtu: parseInt(e.target.value) || 1500 }))} />
              </div>
              <div>
                <Label>Zone</Label>
                <Select value={formData.zone || "LAN"} onValueChange={v => setFormData(f => ({ ...f, zone: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["WAN", "LAN", "DMZ", "MGMT", "VPN"].map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Administrative Access</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["HTTPS", "SSH", "Ping", "SNMP", "HTTP", "TELNET"].map(access => (
                    <div key={access} className="flex items-center gap-2">
                      <Checkbox checked={formData.adminAccess?.includes(access)} onCheckedChange={() => toggleAccess(access)} />
                      <span className="text-sm">{access}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">Save</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
