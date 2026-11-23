import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Button, Card, Input } from '../../components/ui';
import type { ClassItem } from '../../types';

interface LabConstraintInput {
  uid: string;
  id: string;
  text: string;
  deduction: number;
}

interface LabTestInput {
  uid: string;
  input: string;
  expectedOutput: string;
}

const utf8Size = (value: string) => new TextEncoder().encode(value).length;

function isValidDeduction(value: number) {
  if (!Number.isFinite(value) || value < 0.01 || value > 10) return false;
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-8;
}

function validateLab(
  classId: string,
  title: string,
  statement: string,
  opensAt: string,
  deadlineAt: string,
  constraints: LabConstraintInput[],
  tests: LabTestInput[],
  cpuSeconds: number,
  memoryMb: number,
): string | null {
  if (!classId) return 'Vui lòng chọn lớp học';
  if (!title.trim()) return 'Tên Lab không được để trống';
  if (title.trim().length > 160) return 'Tên Lab không được vượt quá 160 ký tự';
  if (!statement.trim()) return 'Đề bài không được để trống';
  if (utf8Size(statement) > 256 * 1024)
    return 'Đề bài không được vượt quá 256 KiB';

  const opensAtDate = new Date(opensAt);
  const deadlineAtDate = new Date(deadlineAt);
  if (!opensAt || Number.isNaN(opensAtDate.getTime()))
    return 'Thời gian mở Lab không hợp lệ';
  if (!deadlineAt || Number.isNaN(deadlineAtDate.getTime()))
    return 'Deadline không hợp lệ';
  if (opensAtDate >= deadlineAtDate) return 'Thời gian mở phải trước deadline';

  if (!Number.isInteger(cpuSeconds) || cpuSeconds < 1 || cpuSeconds > 5)
    return 'CPU tối đa phải là số nguyên từ 1 đến 5 giây';
  if (!Number.isInteger(memoryMb) || memoryMb < 64 || memoryMb > 512)
    return 'Bộ nhớ tối đa phải là số nguyên từ 64 đến 512 MB';

  if (constraints.length < 1 || constraints.length > 100)
    return 'Lab phải có từ 1 đến 100 ràng buộc';
  const constraintIds = new Set<string>();
  for (const constraint of constraints) {
    const id = constraint.id.trim();
    const text = constraint.text.trim();
    if (!id || id.length > 40) return 'Mã ràng buộc phải từ 1 đến 40 ký tự';
    if (constraintIds.has(id)) return 'Mã ràng buộc phải là duy nhất';
    constraintIds.add(id);
    if (!text) return 'Nội dung ràng buộc không được để trống';
    if (utf8Size(text) > 8 * 1024)
      return 'Mỗi nội dung ràng buộc không được vượt quá 8 KiB';
    if (!isValidDeduction(constraint.deduction))
      return 'Điểm trừ phải từ 0.01 đến 10.00 và tối đa 2 chữ số thập phân';
  }

  if (tests.length < 1 || tests.length > 100)
    return 'Lab phải có từ 1 đến 100 test';
  let totalTestSize = 0;
  for (let index = 0; index < tests.length; index++) {
    const test = tests[index];
    const testSize = utf8Size(test.input) + utf8Size(test.expectedOutput);
    if (testSize > 256 * 1024)
      return `Test ${index + 1} không được vượt quá 256 KiB`;
    totalTestSize += testSize;
  }
  if (totalTestSize > 10 * 1024 * 1024)
    return 'Tổng dung lượng test không được vượt quá 10 MiB';

  return null;
}

export default function CreateLabPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState<ClassItem[]>([]),
    [classId, setClassId] = useState(''),
    [title, setTitle] = useState(''),
    [statement, setStatement] = useState(''),
    [opensAt, setOpensAt] = useState(''),
    [deadlineAt, setDeadlineAt] = useState(''),
    [constraints, setConstraints] = useState<LabConstraintInput[]>([
      { uid: crypto.randomUUID(), id: 'C1', text: '', deduction: 3 },
    ]),
    [tests, setTests] = useState<LabTestInput[]>([
      { uid: crypto.randomUUID(), input: '', expectedOutput: '' },
    ]),
    [cpuSeconds, setCpuSeconds] = useState(1),
    [memoryMb, setMemoryMb] = useState(256),
    [isSubmitting, setIsSubmitting] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    api<{ classes: ClassItem[] }>('/classes?page=1&limit=100')
      .then((r) => {
        setClasses(r.classes);
        const requestedClassId = searchParams.get('classId');
        if (
          requestedClassId &&
          r.classes.some((classItem) => classItem.classId === requestedClassId)
        ) {
          setClassId(requestedClassId);
        } else if (r.classes[0]) {
          setClassId(r.classes[0].classId);
        }
      })
      .catch((e) => setError(e.message));
  }, [searchParams]);
  const updateConstraint = (
    index: number,
    field: keyof LabConstraintInput,
    value: string,
  ) => {
    setConstraints((current) =>
      current.map((constraint, constraintIndex) =>
        constraintIndex === index
          ? {
              ...constraint,
              [field]: field === 'deduction' ? Number(value) : value,
            }
          : constraint,
      ),
    );
  };
  const updateTest = (
    index: number,
    field: keyof LabTestInput,
    value: string,
  ) => {
    setTests((current) =>
      current.map((test, testIndex) =>
        testIndex === index ? { ...test, [field]: value } : test,
      ),
    );
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validateLab(
      classId,
      title,
      statement,
      opensAt,
      deadlineAt,
      constraints,
      tests,
      cpuSeconds,
      memoryMb,
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      await api(`/classes/${classId}/labs`, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          statement: statement.trim(),
          opensAt: new Date(opensAt).toISOString(),
          deadlineAt: new Date(deadlineAt).toISOString(),
          constraints: constraints.map((constraint) => ({
            id: constraint.id.trim(),
            text: constraint.text.trim(),
            deduction: constraint.deduction,
          })),
          limits: { cpuSeconds, memoryMb },
          tests: tests.map((test) => ({
            input: test.input,
            expectedOutput: test.expectedOutput,
          })),
        }),
      });
      navigate('/ta/labs');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tạo Lab');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Tạo Lab mới</h1>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="lab-class">
            <span className="mb-1 block text-sm font-semibold">Lớp học</span>
            <select
              id="lab-class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#dde3ed] px-3 text-sm"
            >
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.className}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="lab-title">
            <span className="mb-1 block text-sm font-semibold">Tên Lab</span>
            <Input
              id="lab-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              required
            />
          </label>
          <label htmlFor="lab-opens-at">
            <span className="mb-1 block text-sm font-semibold">Mở lúc</span>
            <Input
              id="lab-opens-at"
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
              required
            />
          </label>
          <label htmlFor="lab-deadline">
            <span className="mb-1 block text-sm font-semibold">Deadline</span>
            <Input
              id="lab-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
              required
            />
          </label>
        </div>
        <label htmlFor="lab-statement" className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold">Đề bài</span>
          <textarea
            id="lab-statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            required
            className="min-h-40 w-full rounded-lg border border-[#dde3ed] p-3 text-sm"
          />
        </label>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label htmlFor="lab-cpu">
            <span className="mb-1 block text-sm font-semibold">
              CPU tối đa (giây)
            </span>
            <Input
              id="lab-cpu"
              type="number"
              min={1}
              max={5}
              value={cpuSeconds}
              onChange={(e) => setCpuSeconds(Number(e.target.value))}
              required
            />
          </label>
          <label htmlFor="lab-memory">
            <span className="mb-1 block text-sm font-semibold">
              Bộ nhớ tối đa (MB)
            </span>
            <Input
              id="lab-memory"
              type="number"
              min={64}
              max={512}
              value={memoryMb}
              onChange={(e) => setMemoryMb(Number(e.target.value))}
              required
            />
          </label>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <b>Ràng buộc</b>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setConstraints((current) => [
                  ...current,
                  {
                    uid: crypto.randomUUID(),
                    id: `C${current.length + 1}`,
                    text: '',
                    deduction: 1,
                  },
                ])
              }
              disabled={constraints.length >= 100}
            >
              <Plus size={16} />
              Thêm ràng buộc
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {constraints.map((constraint, index) => (
              <div
                key={constraint.uid}
                className="grid gap-3 rounded-lg border border-[#dde3ed] p-3 md:grid-cols-[120px_1fr_140px_40px]"
              >
                <Input
                  aria-label={`Mã ràng buộc ${index + 1}`}
                  value={constraint.id}
                  onChange={(e) =>
                    updateConstraint(index, 'id', e.target.value)
                  }
                  maxLength={40}
                  required
                  placeholder="C1"
                />
                <Input
                  aria-label={`Nội dung ràng buộc ${index + 1}`}
                  value={constraint.text}
                  onChange={(e) =>
                    updateConstraint(index, 'text', e.target.value)
                  }
                  required
                  placeholder="Mô tả ràng buộc"
                />
                <Input
                  aria-label={`Điểm trừ ràng buộc ${index + 1}`}
                  type="number"
                  min={0.01}
                  max={10}
                  step={0.01}
                  value={constraint.deduction}
                  onChange={(e) =>
                    updateConstraint(index, 'deduction', e.target.value)
                  }
                  required
                />
                <Button
                  type="button"
                  variant="danger"
                  aria-label={`Xóa ràng buộc ${index + 1}`}
                  onClick={() =>
                    setConstraints((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  disabled={constraints.length === 1}
                  className="px-0"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <b>Test private</b>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setTests((current) => [
                  ...current,
                  { uid: crypto.randomUUID(), input: '', expectedOutput: '' },
                ])
              }
              disabled={tests.length >= 100}
            >
              <Plus size={16} />
              Thêm test
            </Button>
          </div>
          <div className="mt-3 space-y-3">
            {tests.map((test, index) => (
              <div
                key={test.uid}
                className="grid gap-3 rounded-lg border border-[#dde3ed] p-3 md:grid-cols-2"
              >
                <label htmlFor={`test-input-${index}`} className="block">
                  <span className="mb-1 block text-sm font-semibold">
                    Input test {index + 1}
                  </span>
                  <textarea
                    id={`test-input-${index}`}
                    value={test.input}
                    onChange={(e) => updateTest(index, 'input', e.target.value)}
                    className="min-h-28 w-full rounded-lg border border-[#dde3ed] p-3 font-mono text-sm"
                  />
                </label>
                <label htmlFor={`test-output-${index}`} className="block">
                  <span className="mb-1 block text-sm font-semibold">
                    Output kỳ vọng test {index + 1}
                  </span>
                  <textarea
                    id={`test-output-${index}`}
                    value={test.expectedOutput}
                    onChange={(e) =>
                      updateTest(index, 'expectedOutput', e.target.value)
                    }
                    className="min-h-28 w-full rounded-lg border border-[#dde3ed] p-3 font-mono text-sm"
                  />
                </label>
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      setTests((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    disabled={tests.length === 1}
                  >
                    <Trash2 size={16} />
                    Xóa test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button type="submit" className="mt-4" disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo Lab...' : 'Tạo Lab'}
        </Button>
      </Card>
    </form>
  );
}
