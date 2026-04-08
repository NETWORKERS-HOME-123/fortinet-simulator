import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSimulation, FirewallPolicy } from "@/simulation/simulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, GripVertical, Shield } from "lucide-react";
import { toast } from "sonner";

const emptyPolicy: Omit<FirewallPolicy, "id"> = {
  name: "", srcintf: "port3", dstintf: "port1", srcaddr: "all", dstaddr: "all",
  service: "ALL", action: "accept", nat: true, logTraffic: true, schedule: "always",
  status: "enabled", utmProfiles: {
    av: "none", ips: "none", webFilter: "none", appControl: "none",
    dnsFilter: "none", fileFilter: "none", emailFilter: "none",
    dlp: "none", voip: "none", icap: "none", sslInspection: "certificate-inspection",
  }, hitCount: 0,
};

export default function PolicyEditor() {
  const { state, addPolicy, updatePolicy, deletePolicy, reorderPolicies } = useSimulation();
  const [editingPolicy, setEditingPolicy] = useState<FirewallPolicy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<FirewallPolicy, "id">>(emptyPolicy);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [comments, setComments] = useState("");

  const openCreate = () => {
    setFormData({ ...emptyPolicy });
    setEditingPolicy(null);
    setComments("");
    setIsCreating(true);
  };

  const openEdit = (p: FirewallPolicy) => {
    setFormData({ ...p });
    setEditingPolicy(p);
    setComments("");
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error("Policy name is required"); return; }
    if (editingPolicy) {
      updatePolicy(editingPolicy.id, formData);
      toast.success(`Policy ${editingPolicy.id} updated`);
    } else {
      const maxId = Math.max(0, ...state.policies.map(p => p.id));
      addPolicy({ ...formData, id: maxId + 1 } as FirewallPolicy);
      toast.success("Policy created");
    }
    setIsCreating(false);
  };

  const handleDelete = (id: number) => {
    deletePolicy(id);
    toast.success(`Policy ${id} deleted`);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const items = [...state.policies];
    const [moved] = items.splice(dragIdx, 1);
    items.splice(idx, 0, moved);
    reorderPolicies(items);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const ifaceOptions = state.interfaces.map(i => i.name);
  const addrOptions = ["all", ...state.addressObjects.map(a => a.name)];
  const serviceOptions = ["ALL", "HTTP", "HTTPS", "SSH", "DNS", "SMTP", "IMAP", "POP3", "RDP", "FTP", "SNMP", "NTP", "LDAP", "SMB", "HTTP HTTPS", "HTTP HTTPS DNS"];
  const scheduleOptions = ["always", "business-hours", "after-hours", "weekends"];
  const utmOptions = ["none", "default", "high-security", "monitor-only", "strict", "protect_http_server"];
  const sslInspOptions = ["no-inspection", "certificate-inspection", "deep-inspection"];
  const logOptions: Array<{ label: string; value: string }> = [
    { label: "All Sessions", value: "all" },
    { label: "Security Events", value: "utm" },
    { label: "Disable", value: "disable" },
  ];

  // All 11 UTM security profile types from FortiOS 7.6.6
  const utmProfileFields: Array<{ key: string; label: string; options: string[] }> = [
    { key: "av", label: "AntiVirus", options: utmOptions },
    { key: "webFilter", label: "Web Filter", options: utmOptions },
    { key: "dnsFilter", label: "DNS Filter", options: utmOptions },
    { key: "appControl", label: "Application Control", options: utmOptions },
    { key: "ips", label: "IPS", options: utmOptions },
    { key: "fileFilter", label: "File Filter", options: utmOptions },
    { key: "emailFilter", label: "Email Filter", options: utmOptions },
    { key: "dlp", label: "DLP", options: utmOptions },
    { key: "voip", label: "VoIP", options: utmOptions },
    { key: "icap", label: "ICAP", options: utmOptions },
    { key: "sslInspection", label: "SSL Inspection", options: sslInspOptions },
  ];

  return (
    <DashboardLayout title="Firewall Policies" subtitle="Policy & Objects > IPv4 Policy">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{state.policies.length} policies configured — drag to reorder (top-to-bottom processing)</span>
          </div>
          <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Create New</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-12">Seq#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Incoming Interface</TableHead>
                  <TableHead>Outgoing Interface</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>NAT</TableHead>
                  <TableHead>Log</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Hit Count</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.policies.map((p, idx) => (
                  <TableRow
                    key={p.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-pointer ${dragIdx === idx ? "opacity-50" : ""}`}
                    onClick={() => openEdit(p)}
                  >
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium text-sm">{p.name}</TableCell>
                    <TableCell className="text-xs">{p.srcintf}</TableCell>
                    <TableCell className="text-xs">{p.dstintf}</TableCell>
                    <TableCell className="text-xs">{p.srcaddr}</TableCell>
                    <TableCell className="text-xs">{p.dstaddr}</TableCell>
                    <TableCell className="text-xs">{p.service}</TableCell>
                    <TableCell>
                      <Badge variant={p.action === "accept" ? "default" : "destructive"} className="text-[10px]">
                        {p.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{p.nat ? "Enabled" : "—"}</TableCell>
                    <TableCell className="text-xs">{p.logTraffic ? "All" : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "enabled" ? "outline" : "secondary"} className="text-[10px]">
                        {p.status === "enabled" ? "✓" : "✗"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{p.hitCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Policy Edit Sheet — matches FortiOS 7.6.6 policy form */}
        <Sheet open={isCreating} onOpenChange={setIsCreating}>
          <SheetContent className="w-[540px] sm:w-[640px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingPolicy ? `Edit Policy ${editingPolicy.id}` : "Create New Policy"}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <Label>Name <span className="text-destructive">*</span></Label>
                <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Enter policy name" />
              </div>

              {/* Incoming / Outgoing Interface */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Incoming Interface</Label>
                  <Select value={formData.srcintf} onValueChange={v => setFormData(f => ({ ...f, srcintf: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["any", ...ifaceOptions].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Outgoing Interface</Label>
                  <Select value={formData.dstintf} onValueChange={v => setFormData(f => ({ ...f, dstintf: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["any", ...ifaceOptions].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Source / Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Source</Label>
                  <Select value={formData.srcaddr} onValueChange={v => setFormData(f => ({ ...f, srcaddr: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{addrOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Destination</Label>
                  <Select value={formData.dstaddr} onValueChange={v => setFormData(f => ({ ...f, dstaddr: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{addrOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <Label>Schedule</Label>
                <Select value={formData.schedule} onValueChange={v => setFormData(f => ({ ...f, schedule: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{scheduleOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Service */}
              <div>
                <Label>Service</Label>
                <Select value={formData.service} onValueChange={v => setFormData(f => ({ ...f, service: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{serviceOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Action */}
              <div>
                <Label>Action</Label>
                <Select value={formData.action} onValueChange={v => setFormData(f => ({ ...f, action: v as "accept" | "deny" | "ipsec" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accept">ACCEPT</SelectItem>
                    <SelectItem value="deny">DENY</SelectItem>
                    <SelectItem value="ipsec">IPSEC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* NAT */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.nat} onCheckedChange={v => setFormData(f => ({ ...f, nat: v }))} />
                  <Label>NAT</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.status === "enabled"} onCheckedChange={v => setFormData(f => ({ ...f, status: v ? "enabled" : "disabled" }))} />
                  <Label>Enable this policy</Label>
                </div>
              </div>

              {/* Security Profiles — All 11 types from FortiOS 7.6.6 */}
              <div className="border rounded-md p-3 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1"><Shield className="h-4 w-4" /> Security Profiles</h4>
                <div className="grid grid-cols-2 gap-3">
                  {utmProfileFields.map(({ key, label, options }) => (
                    <div key={key}>
                      <Label className="text-xs">{label}</Label>
                      <Select
                        value={(formData.utmProfiles as Record<string, string>)[key] || "none"}
                        onValueChange={v => setFormData(f => ({ ...f, utmProfiles: { ...f.utmProfiles, [key]: v } }))}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logging Options */}
              <div className="border rounded-md p-3 space-y-3">
                <h4 className="text-sm font-semibold">Logging Options</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Log Allowed Traffic</Label>
                    <Select
                      value={formData.logTraffic ? "all" : "disable"}
                      onValueChange={v => setFormData(f => ({ ...f, logTraffic: v !== "disable" }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {logOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label>Comments</Label>
                <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Optional description for this policy" rows={2} />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">{editingPolicy ? "OK" : "OK"}</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
