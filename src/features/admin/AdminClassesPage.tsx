import { useCallback, useEffect, useState } from 'react';
import { Copy, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge, Button, Card, Input } from '../../components/ui';
import type { ClassItem, User } from '../../types';
export default function AdminClassesPage() {
  const [items, setItems] = useState<ClassItem[]>([]),
    [name, setName] = useState(''),
    [tas, setTas] = useState<User[]>([]),
    [selectedTas, setSelectedTas] = useState<Record<string, string>>({}),
    [assigningClassId, setAssigningClassId] = useState<string | null>(null),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  const load = useCallback(
    () =>
      api<{ classes: ClassItem[] }>('/classes?page=1&limit=100')
        .then((r) => setItems(r.classes))
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    load();
    api<{ users: User[] }>('/users?page=1&limit=100')
      .then((r) =>
        setTas(
          r.users.filter(
            (user) => user.role === 'TA' && user.status === 'ACTIVE',
          ),
        ),
      )
      .catch((e) => setError(e.message));
  }, [load]);
  const create = async () => {
    if (!name.trim()) return;
    try {
      await api<{ class: ClassItem }>('/classes', {
        method: 'POST',
        body: JSON.stringify({ className: name.trim() }),
      });
      setName('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tạo lớp');
    }
  };
  const assignTa = async (classId: string) => {
    const taUserId = selectedTas[classId];
    if (!taUserId) return;
    setAssigningClassId(classId);
    setError('');
    setMessage('');
    try {
      await api(`/classes/${classId}/tas/${taUserId}`, {
        method: 'PUT',
      });
      setMessage('Đã phân công TA cho lớp.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể phân công TA');
    } finally {
      setAssigningClassId(null);
    }
  };
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Lớp học</h1>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}
      <Card className="p-5">
        <div className="flex gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên lớp mới"
          />
          <Button onClick={create} className="shrink-0">
            <Plus size={17} />
            Tạo lớp
          </Button>
        </div>
      </Card>
      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-[#737d90]">
              <th className="p-4">Tên lớp</th>
              <th>Mã tham gia</th>
              <th>Trạng thái</th>
              <th>Phân công TA</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.classId} className="border-b last:border-0">
                <td className="p-4 font-semibold">{c.className}</td>
                <td>
                  {c.invitationCode ? (
                    <span className="flex items-center gap-2">
                      <code className="rounded bg-[#f1f3f7] px-2 py-1 font-mono">
                        {c.invitationCode}
                      </code>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(c.invitationCode || '')
                        }
                      >
                        <Copy size={15} />
                      </button>
                    </span>
                  ) : (
                    <span className="text-[#737d90]">Chỉ hiển thị khi tạo</span>
                  )}
                </td>
                <td>
                  <Badge tone="success">Đang hoạt động</Badge>
                </td>
                <td>
                  <div className="flex gap-2 pr-4">
                    <select
                      aria-label={`Chọn TA cho ${c.className}`}
                      value={selectedTas[c.classId] || ''}
                      onChange={(e) =>
                        setSelectedTas((current) => ({
                          ...current,
                          [c.classId]: e.target.value,
                        }))
                      }
                      className="h-9 min-w-44 rounded-md border border-[#dde3ed] px-2"
                    >
                      <option value="">Chọn TA</option>
                      {tas.map((ta) => (
                        <option key={ta.userId} value={ta.userId}>
                          {ta.displayName} ({ta.email})
                        </option>
                      ))}
                    </select>
                    <Button
                      className="h-9 px-3"
                      disabled={
                        !selectedTas[c.classId] ||
                        assigningClassId === c.classId
                      }
                      onClick={() => assignTa(c.classId)}
                    >
                      {assigningClassId === c.classId
                        ? 'Đang phân công...'
                        : 'Phân công'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
