import { useState } from 'react';
import { useAppState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Ticket } from '@/lib/types';
import { MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackPage() {
  const { tickets, addTicket, updateTicket } = useAppState();
  const [form, setForm] = useState({ name: '', email: '', category: '' as string, description: '' });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: Ticket = {
      id: Math.random().toString(36).slice(2, 10),
      ticketId: `TKT-${String(tickets.length + 1).padStart(4, '0')}`,
      name: form.name,
      email: form.email,
      category: form.category as Ticket['category'],
      description: form.description,
      status: 'Open',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addTicket(ticket);
    setForm({ name: '', email: '', category: '', description: '' });
    toast.success(`Ticket ${ticket.ticketId} created`);
  };

  const statusColor = (s: string) => {
    if (s === 'Open') return 'bg-warning/15 text-warning border-warning/30';
    if (s === 'In Progress') return 'bg-info/15 text-info border-info/30';
    return 'bg-success/15 text-success border-success/30';
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Feedback & Tickets</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Report issues, suggest improvements, or flag data errors</p>
      </div>

      {/* Submit Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground font-display">Submit New Ticket</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required className="mt-1 h-9 text-sm" placeholder="Your name" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className="mt-1 h-9 text-sm" placeholder="you@company.com" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {['Bug', 'Data Issue', 'Suggestion', 'KPI Error', 'Other'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} required className="mt-1 text-sm" rows={3} placeholder="Describe the issue or suggestion..." />
          </div>
          <Button type="submit" className="kpi-gradient border-0 text-primary-foreground" disabled={!form.category}>
            <Send className="h-3.5 w-3.5 mr-2" />
            Submit Ticket
          </Button>
        </form>
      </motion.div>

      {/* Tickets List */}
      {tickets.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 font-display">All Tickets</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.ticketId}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.category}</Badge></TableCell>
                  <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={t.status} onValueChange={v => updateTicket(t.id, { status: v as Ticket['status'] })}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Open', 'In Progress', 'Resolved'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
