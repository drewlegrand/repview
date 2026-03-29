import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';

const DEVICE_REMEMBER_KEY = 'repview-mfa-device';
const DEVICE_REMEMBER_HOURS = 12;

export function generateDeviceId(): string {
  const nav = window.navigator;
  const raw = `${nav.userAgent}|${nav.language}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  // Simple hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function isDeviceRemembered(userId: string): boolean {
  try {
    const stored = localStorage.getItem(DEVICE_REMEMBER_KEY);
    if (!stored) return false;
    const data = JSON.parse(stored);
    if (data.userId !== userId || data.deviceId !== generateDeviceId()) return false;
    return new Date(data.expiresAt) > new Date();
  } catch {
    return false;
  }
}

export function rememberDevice(userId: string) {
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + DEVICE_REMEMBER_HOURS * 60 * 60 * 1000);
  localStorage.setItem(
    DEVICE_REMEMBER_KEY,
    JSON.stringify({ userId, deviceId: generateDeviceId(), expiresAt: expiresAt.toISOString() })
  );
}

interface MFAChallengeProps {
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFAChallenge({ factorId, onSuccess, onCancel }: MFAChallengeProps) {
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      if (remember) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) rememberDevice(user.id);
      }

      toast.success('Verified successfully!');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Invalid verification code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Two-Factor Authentication</h1>
          <p className="text-sm text-muted">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification Code</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-device"
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
            />
            <label
              htmlFor="remember-device"
              className="text-sm text-muted cursor-pointer select-none"
            >
              Remember this device for 30 days
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify
          </Button>

          <p className="text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-primary hover:underline"
            >
              Sign in with a different account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
