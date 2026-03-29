import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, Copy } from 'lucide-react';

export default function MFASetupPage() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to set up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      toast.success('Two-factor authentication enabled!');
      // Redirect to dashboard after successful setup
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary-foreground">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Set Up Two-Factor Authentication</h1>
          <p className="text-sm text-muted">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {qrCode && (
            <div className="p-4 bg-white rounded-xl">
              <img src={qrCode} alt="QR Code for 2FA setup" className="w-48 h-48" />
            </div>
          )}

          <div className="w-full space-y-1">
            <Label className="text-muted text-xs">Or enter this secret manually:</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted/20 text-primary-foreground px-3 py-2 rounded-lg font-mono break-all">
                {secret}
              </code>
              <Button variant="ghost" size="icon" onClick={copySecret} title="Copy secret">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" disabled={verifying || verifyCode.length !== 6}>
            {verifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify & Enable 2FA
          </Button>
        </form>
      </div>
    </div>
  );
}
