import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge, Button, Card, Input } from '../../components/ui';
import type { ClassItem, Lab } from '../../types';
export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]),
    [labs, setLabs] = useState<Lab[]>([]),
    [code, setCode] = useState(''),
    [error, setError] = useState('');
  const refreshClasses = async () => {
    try {
      const r = await api<{ classes: ClassItem[] }>(
        '/classes?page=1&limit=100',
      );
      setClasses(r.classes);
      const labResponses = await Promise.all(
        r.classes.map((c) =>
          api<{ labs: Lab[] }>(
            `/classes/${c.classId}/labs?page=1&limit=100`,
          ).catch(() => ({ labs: [] })),
        ),
      );
      setLabs(labResponses.flatMap((response) => response.labs));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách lớp');
    }
  };

  useEffect(() => {
    api<{ classes: ClassItem[] }>('/classes?page=1&limit=100')
      .then((r) => {
        setClasses(r.classes);
        return Promise.all(
          r.classes.map((c) =>
            api<{ labs: Lab[] }>(
              `/classes/${c.classId}/labs?page=1&limit=100`,
            ).catch(() => ({ labs: [] })),
          ),
        );
      })
      .then((labResponses) =>
        setLabs(labResponses.flatMap((response) => response.labs)),
      )
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : 'Không thể tải danh sách lớp',
        ),
      );
  }, []);
  const join = async () => {
    try {
      await api('/classes/join', {
        method: 'POST',
        body: JSON.stringify({ invitationCode: code }),
      });
      setCode('');
      setError('');
      await refreshClasses();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tham gia lớp');
    }
  };
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Lớp học của tôi</h1>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card className="flex items-center gap-3 p-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#edf2ff] text-[#1d3f91]">
          <KeyRound size={19} />
        </div>
        <div className="flex-1">
          <b>Tham gia lớp mới</b>
          <p className="text-sm text-[#737d90]">
            Nhập mã invitation do giảng viên cung cấp.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-36"
            placeholder="384201"
          />
          <Button onClick={join} disabled={!code}>
            Tham gia
          </Button>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {labs.map((l) => (
          <Card key={l.labId} className="p-5">
            <div className="flex justify-between">
              <b>{l.title}</b>
              <Badge tone={l.status === 'open' ? 'success' : 'neutral'}>
                {l.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-[#737d90]">
              Hạn: {new Date(l.deadlineAt).toLocaleString('vi-VN')}
            </p>
            <Link
              to={`/labs/${l.labId}`}
              className="mt-5 flex items-center gap-1 text-sm font-bold text-[#1d3f91]"
            >
              Xem Lab <ArrowRight size={15} />
            </Link>
          </Card>
        ))}
      </div>
      {labs.length === 0 && classes.length === 0 && (
        <Card className="p-8 text-center text-sm text-[#737d90]">
          Bạn chưa tham gia lớp học nào.
        </Card>
      )}
    </div>
  );
}
