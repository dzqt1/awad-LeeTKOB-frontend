import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { Badge, Button, Card } from '../../components/ui';
import type { ClassItem, Lab } from '../../types';
export default function TaLabsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState<ClassItem[]>([]),
    [selectedClassId, setSelectedClassId] = useState(
      searchParams.get('classId') || '',
    ),
    [labs, setLabs] = useState<Lab[]>([]),
    [error, setError] = useState('');
  useEffect(() => {
    api<{ classes: ClassItem[] }>('/classes?page=1&limit=100')
      .then((r) => {
        setClasses(r.classes);
        const requestedClassId = searchParams.get('classId');
        if (
          requestedClassId &&
          r.classes.some((c) => c.classId === requestedClassId)
        ) {
          setSelectedClassId(requestedClassId);
        } else if (r.classes[0]) {
          setSelectedClassId(r.classes[0].classId);
        }
      })
      .catch((e) => setError(e.message));
  }, [searchParams]);
  useEffect(() => {
    if (!selectedClassId) {
      return;
    }
    api<{ labs: Lab[] }>(`/classes/${selectedClassId}/labs?page=1&limit=100`)
      .then((r) => setLabs(r.labs))
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : 'Không thể tải danh sách Lab',
        ),
      );
  }, [selectedClassId]);
  const selectClass = (classId: string) => {
    setSelectedClassId(classId);
    setSearchParams(classId ? { classId } : {});
  };
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-[#737d90]">Lớp được phân công</p>
          <h1 className="text-3xl font-bold">Quản lý Lab</h1>
        </div>
        <Link
          to={
            selectedClassId
              ? `/ta/labs/new?classId=${selectedClassId}`
              : '/ta/labs/new'
          }
        >
          <Button>
            <Plus size={17} />
            Tạo Lab mới
          </Button>
        </Link>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card className="p-4">
        <label htmlFor="ta-lab-class" className="block">
          <span className="mb-2 block text-sm font-semibold">Chọn lớp</span>
          <select
            id="ta-lab-class"
            value={selectedClassId}
            onChange={(e) => selectClass(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#dde3ed] px-3 text-sm md:max-w-md"
          >
            {classes.map((classItem) => (
              <option key={classItem.classId} value={classItem.classId}>
                {classItem.className}
              </option>
            ))}
          </select>
        </label>
      </Card>
      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-[#737d90]">
              <th className="p-4">Tên Lab</th>
              <th>Trạng thái</th>
              <th>Deadline</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {labs.map((l) => (
              <tr key={l.labId} className="border-b last:border-0">
                <td className="p-4 font-semibold">{l.title}</td>
                <td>
                  <Badge
                    tone={
                      l.status === 'open'
                        ? 'success'
                        : l.status === 'closed'
                          ? 'neutral'
                          : 'warning'
                    }
                  >
                    {l.status}
                  </Badge>
                </td>
                <td>{new Date(l.deadlineAt).toLocaleString('vi-VN')}</td>
                <td>
                  <Link
                    to={`/labs/${l.labId}`}
                    className="font-bold text-[#1d3f91]"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    to={`/ta/labs/${l.labId}/reviews`}
                    className="ml-4 font-bold text-[#1d3f91]"
                  >
                    Hàng chờ review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
