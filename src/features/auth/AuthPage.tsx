import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, Terminal } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { Button, Input } from '../../components/ui';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login'),
    [show, setShow] = useState(false),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [displayName, setDisplayName] = useState(''),
    [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        await signup(email, password, displayName);
        setMode('login');
      } else {
        const u = await login(email, password);
        navigate(
          u.role === 'ADMIN'
            ? '/admin/users'
            : u.role === 'TA'
              ? '/ta/labs'
              : '/student/classes',
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể thực hiện yêu cầu');
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f8fb] px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#1d3f91] text-white">
            <Terminal size={21} />
          </div>
          <b className="text-xl">LeeTKOB</b>
        </div>
        <div className="rounded-xl border border-[#dde3ed] bg-white p-7">
          <h1 className="text-2xl font-bold">
            {mode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản Student'}
          </h1>
          <div className="mt-6 grid grid-cols-2 rounded-lg bg-[#f1f3f7] p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-md py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white' : 'text-[#737d90]'}`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-md py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white' : 'text-[#737d90]'}`}
            >
              Đăng ký
            </button>
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            {mode === 'signup' && (
              <label htmlFor="display-name" className="block">
                <span className="mb-1 block text-sm font-semibold">
                  Họ và tên
                </span>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </label>
            )}
            <label htmlFor="email" className="block">
              <span className="mb-1 block text-sm font-semibold">Email</span>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-[#98a0af]"
                  size={17}
                />
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  type="text"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </label>
            <label htmlFor="password" className="block">
              <span className="mb-1 block text-sm font-semibold">Mật khẩu</span>
              <div className="relative">
                <LockKeyhole
                  className="absolute left-3 top-3 text-[#98a0af]"
                  size={17}
                />
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-2.5 text-[#98a0af]"
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản Student'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
