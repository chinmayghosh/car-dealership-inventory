import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { AuthLayout } from '../components/AuthLayout';
import { FormError } from '../components/FormError';
import { FormField } from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../lib/errors';

const MIN_PASSWORD_LENGTH = 6;

interface Fields {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

/** Mirrors the backend rules so users get instant feedback before a round trip. */
function validate({ name, email, password, confirm }: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!name.trim()) errors.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address';
  if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (confirm !== password) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Fields>({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((current) => ({ ...current, [key]: e.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const errors = validate(fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await register(fields.name, fields.email, fields.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join to browse the full inventory and reserve your next car.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
        <FormField label="Full name" autoComplete="name" value={fields.name} onChange={update('name')} error={fieldErrors.name} />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          onChange={update('password')}
          error={fieldErrors.password}
        />
        <FormField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={fields.confirm}
          onChange={update('confirm')}
          error={fieldErrors.confirm}
        />
        <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-gold-400 hover:text-gold-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
