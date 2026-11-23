import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Badge, Card } from '../../components/ui';
import type { ClassItem } from '../../types';

export default function TaClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ classes: ClassItem[] }>('/classes?page=1&limit=100')
      .then((response) => setClasses(response.classes))
      .catch((e) =>
        setError(
          e instanceof Error ? e.message : 'Không thể tải danh sách lớp',
        ),
      );
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-[#737d90]">Lớp được phân công</p>
        <h1 className="text-3xl font-bold">Lớp học</h1>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        {classes.length === 0 && !error ? (
          <p className="p-8 text-center text-sm text-[#737d90]">
            Chưa có lớp học nào được phân công.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-[#737d90]">
                <th className="p-4">Tên lớp</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.classId} className="border-b last:border-0">
                  <td className="p-4 font-semibold">{classItem.className}</td>
                  <td>
                    <Badge tone="success">Đang hoạt động</Badge>
                  </td>
                  <td>
                    <Link
                      to={`/ta/labs?classId=${classItem.classId}`}
                      className="font-bold text-[#1d3f91]"
                    >
                      Quản lý Lab
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
