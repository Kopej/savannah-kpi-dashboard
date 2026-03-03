import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'User' });
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth not activated yet — structure only
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl kpi-gradient mb-4">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold font-display text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join Savannah Seritech</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" placeholder="Your name" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="mt-1" placeholder="you@seritech.com" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="mt-1" placeholder="••••••••" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Role</Label>
            <Select value={form.role} onValueChange={v => set('role', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full kpi-gradient border-0 text-primary-foreground">
            Register
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          Authentication is not yet activated. Access is unrestricted.
        </p>
      </div>
    </div>
  );
}
