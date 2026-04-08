import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSimulation, AddressObject } from "@/simulation/simulationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function AddressesPage() {
  const { state, addAddressObject, updateAddressObject, deleteAddressObject } = useSimulation();
  const [editing, setEditing] = useState<AddressObject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<AddressObject, "id">>({ name: "", type: "subnet", value: "", interface: "", comment: "" });

  const openCreate = () => {
    setFormData({ name: "", type: "subnet", value: "", interface: "", comment: "" });
    setEditing(null);
    setIsCreating(true);
  };

  const openEdit = (obj: AddressObject) => {
    setFormData({ ...obj });
    setEditing(obj);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error("Name is required"); return; }
    if (editing) {
      updateAddressObject(editing.id, formData);
      toast.success(`Address object "${editing.name}" updated`);
    } else {
      addAddressObject({ ...formData, id: Date.now().toString() });
      toast.success(`Address object "${formData.name}" created`);
    }
    setIsCreating(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteAddressObject(id);
    toast.success(`Deleted "${name}"`);
  };

  const typeColors: Record<string, string> = { subnet: "default", iprange: "secondary", fqdn: "outline", geography: "destructive", wildcard: "secondary" };

  return (
    <DashboardLayout title="Address Objects" subtitle="Firewall Address Configuration">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{state.addressObjects.length} address objects</span>
          </div>
          <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Create New</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.addressObjects.map(obj => (
                  <TableRow key={obj.id} className="cursor-pointer" onClick={() => openEdit(obj)}>
                    <TableCell className="font-medium">{obj.name}</TableCell>
                    <TableCell>
                      <Badge variant={typeColors[obj.type] as any} className="text-[10px] capitalize">{obj.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{obj.value}</TableCell>
                    <TableCell className="text-xs">{obj.interface || "any"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{obj.comment}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(obj)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(obj.id, obj.name)}>
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

        <Sheet open={isCreating} onOpenChange={setIsCreating}>
          <SheetContent className="w-[450px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editing ? `Edit: ${editing.name}` : "Create Address Object"}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="MY_SUBNET" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v as AddressObject["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subnet">Subnet</SelectItem>
                    <SelectItem value="iprange">IP Range</SelectItem>
                    <SelectItem value="fqdn">FQDN</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                    <SelectItem value="wildcard">Wildcard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{formData.type === "fqdn" ? "FQDN" : formData.type === "iprange" ? "IP Range" : "Subnet/Value"}</Label>
                <Input value={formData.value} onChange={e => setFormData(f => ({ ...f, value: e.target.value }))} placeholder={formData.type === "fqdn" ? "*.example.com" : "10.0.0.0/24"} />
              </div>
              <div>
                <Label>Interface (optional)</Label>
                <Select value={formData.interface || "any"} onValueChange={v => setFormData(f => ({ ...f, interface: v === "any" ? "" : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">any</SelectItem>
                    {state.interfaces.map(i => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Comment</Label>
                <Input value={formData.comment} onChange={e => setFormData(f => ({ ...f, comment: e.target.value }))} placeholder="Optional description" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">{editing ? "Update" : "Create"}</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
