import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <h1 className="text-xl font-bold font-display text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to Savannah Seritech</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" placeholder="you@seritech.com" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full kpi-gradient border-0 text-primary-foreground">
            Sign In
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
        </p>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-6">
          Authentication is not yet activated. Access is unrestricted.
        </p>
      </div>
    </div>
  );
}
