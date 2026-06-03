import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-white">TF</span>
          </div>
          <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
          <p className="mt-1 text-sm text-dark-muted">
            Kelola keuangan, lamaran kerja, dan tugas harianmu
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-dark-border bg-dark-card px-6 py-3 text-sm font-medium text-white transition-all hover:bg-dark-hover hover:border-primary/30"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          Masuk dengan Google
        </button>

        <p className="mt-6 text-center text-xs text-dark-muted">
          Dengan masuk, kamu menyetujui syarat dan ketentuan yang berlaku
        </p>
      </div>
    </div>
  );
}
