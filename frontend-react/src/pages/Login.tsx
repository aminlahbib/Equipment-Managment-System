import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
  recoveryCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [show2FA, setShow2FA] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(
        data.username,
        data.password,
        data.totpCode ? parseInt(data.totpCode) : undefined,
        data.recoveryCode
      );
      showToast('Login successful!', 'success');
      onNavigate('dashboard');
    } catch (error: any) {
      if (error.message?.includes('2FA')) {
        setShow2FA(true);
        showToast('Please enter your 2FA code', 'error');
      } else {
        showToast(error.message || 'Login failed', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-secondary">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Username"
            placeholder="Enter your username"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />

          {show2FA && (
            <>
              <Input
                label="2FA Code"
                placeholder="Enter 6-digit code"
                error={errors.totpCode?.message}
                {...register('totpCode')}
              />
              <div className="text-sm text-text-secondary">
                <p>Or use a recovery code:</p>
                <Input
                  label="Recovery Code"
                  placeholder="Enter recovery code"
                  error={errors.recoveryCode?.message}
                  {...register('recoveryCode')}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

