import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../app/AuthContext';
import { Button, Card, Input } from '../../components/ui';
import type { User } from '../../types';
export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || ''),
    [profile, setProfile] = useState<User | null>(user),
    [message, setMessage] = useState('');
  useEffect(() => {
    api<{ user: User }>('/profile')
      .then((r) => {
        setProfile(r.user);
        setName(r.user.displayName);
      })
      .catch(() => {});
  }, []);
  const save = async () => {
    if (!profile) return;
    try {
      const r = await api<{ user: User }>(`/users/${profile.userId}/edit`, {
        method: 'PATCH',
        body: JSON.stringify({ displayName: name }),
      });
      setProfile(r.user);
      setMessage('Đã lưu thay đổi');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Không thể lưu');
    }
  };
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
      </header>
      {message && (
        <div className="rounded-lg border border-[#dde3ed] bg-white p-3 text-sm">
          {message}
        </div>
      )}
      <Card className="p-6">
        <h2 className="text-lg font-bold">{profile?.displayName}</h2>
        <p className="text-sm text-[#737d90]">
          {profile?.email} · {profile?.role}
        </p>
      </Card>
      <Card className="p-6">
        <label htmlFor="profile-name" className="block">
          <span className="mb-1 block text-sm font-semibold">Tên hiển thị</span>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <Button className="mt-4" onClick={save}>
          Lưu thay đổi
        </Button>
      </Card>
    </div>
  );
}
