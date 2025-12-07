import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const forgotPasswordSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await apiClient.resetPassword(data.username, data.newPassword);
      showToast('Password reset successful! Please log in.', 'success');
      onNavigate('login');
    } catch (error: any) {
      showToast(error.message || 'Password reset failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Reset Password</h1>
          <p className="text-text-secondary">Enter your username and new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Username"
            placeholder="Enter your username"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="text-center text-sm text-text-secondary">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

