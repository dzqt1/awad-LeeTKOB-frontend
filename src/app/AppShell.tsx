import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  Settings2,
  Terminal,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuth } from './AuthContext';
export default function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-[#dfe6ff] text-[#203b86]' : 'text-[#667085] hover:bg-[#f1f3f7]'}`;
  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <aside className="fixed inset-y-0 left-0 w-[244px] border-r border-[#e2e6ed] bg-white px-3 py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#1d3f91] text-white">
            <Terminal size={19} />
          </div>
          <b>LeeTKOB</b>
        </div>
        <nav className="mt-7 flex flex-col gap-1">
          {user?.role === 'STU' && (
            <>
              <p className="px-3 py-2 text-xs font-bold text-[#98a0af]">
                STUDENT
              </p>
              <NavLink to="/student/classes" className={link}>
                <GraduationCap size={18} />
                Lớp học của tôi
              </NavLink>
            </>
          )}
          {user?.role === 'TA' && (
            <>
              <p className="px-3 py-2 text-xs font-bold text-[#98a0af]">TA</p>
              <NavLink to="/ta/classes" className={link}>
                <GraduationCap size={18} />
                Lớp học
              </NavLink>
              <NavLink to="/ta/labs" className={link}>
                <Settings2 size={18} />
                Quản lý Lab
              </NavLink>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <p className="px-3 py-2 text-xs font-bold text-[#98a0af]">
                QUẢN TRỊ
              </p>
              <NavLink to="/admin/users" className={link}>
                <Users size={18} />
                Người dùng
              </NavLink>
              <NavLink to="/admin/classes" className={link}>
                <GraduationCap size={18} />
                Lớp học
              </NavLink>
            </>
          )}
          <p className="px-3 pb-1 pt-5 text-xs font-bold text-[#98a0af]">
            TÀI KHOẢN
          </p>
          <NavLink to="/profile" className={link}>
            <UserRound size={18} />
            Hồ sơ cá nhân
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="absolute bottom-4 left-3 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#667085] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </aside>
      <main className="ml-[244px] min-h-screen px-8 py-7">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}
