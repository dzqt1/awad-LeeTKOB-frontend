import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge, Button, Card, Input } from '../../components/ui';
import type { User } from '../../types';
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]),
    [q, setQ] = useState(''),
    [error, setError] = useState('');
  const load = useCallback(
    () =>
      api<{ users: User[] }>('/users?page=1&limit=100')
        .then((r) => setUsers(r.users))
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  const changeRole = async (u: User, role: 'TA' | 'STU') => {
    await api(`/users/${u.userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
      .then(load)
      .catch((e) => setError(e.message));
  };
  const changeStatus = async (u: User, status: 'ACTIVE' | 'DISABLED') => {
    await api(`/users/${u.userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
      .then(load)
      .catch((e) => setError(e.message));
  };
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-[#737d90]">
          Quản trị hệ thống
        </p>
        <h1 className="mt-1 text-3xl font-bold">Người dùng</h1>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card>
        <div className="flex items-center border-b border-[#edf0f4] p-4">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-2.5 text-[#98a0af]"
              size={17}
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
              placeholder="Tìm tên hoặc email..."
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-[#737d90]">
                <th className="p-4">Người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) =>
                  `${u.displayName} ${u.email}`
                    .toLowerCase()
                    .includes(q.toLowerCase()),
                )
                .map((u) => (
                  <tr key={u.userId} className="border-b last:border-0">
                    <td className="p-4 font-semibold">{u.displayName}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) =>
                          changeRole(u, e.target.value as 'TA' | 'STU')
                        }
                        className="h-8 rounded-md border px-2"
                      >
                        <option value="STU">STU</option>
                        <option value="TA">TA</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <Badge
                        tone={u.status === 'ACTIVE' ? 'success' : 'danger'}
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        className="h-8 px-3"
                        onClick={() =>
                          changeStatus(
                            u,
                            u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                          )
                        }
                      >
                        {u.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
