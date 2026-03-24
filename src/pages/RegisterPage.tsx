import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.name);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created! You are now signed in.');
      navigate('/');
    }
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
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1" placeholder="Your name" required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="mt-1" placeholder="you@seritech.com" required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="mt-1" placeholder="••••••••" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full kpi-gradient border-0 text-primary-foreground">
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          New users are assigned the "viewer" role by default. Contact an admin to get admin access.
        </p>
      </div>
    </div>
  );
}
