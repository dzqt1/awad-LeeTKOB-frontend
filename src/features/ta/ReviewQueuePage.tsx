import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button, Card } from '../../components/ui';

type Evidence = { line: number; text: string };
type Item = {
  id: string;
  submissionId: string;
  studentName: string;
  source: string;
  constraintId: string;
  constraintText: string;
  deduction: string;
  proposedVerdict: string;
  proposalReason: string | null;
  evidence: Evidence[];
  version: number;
  sampledPass: boolean;
  decision: null | { verdict: string; reason: string; evidence: Evidence[] };
};
type Result = { items: Item[]; total: number; requiredPending: number };
function ReviewCard({
  item,
  labId,
  onSaved,
}: {
  item: Item;
  labId: string;
  onSaved: () => void;
}) {
  const [verdict, setVerdict] = useState<'' | 'pass' | 'violation'>('');
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lines = item.source.split(/\r?\n/);
  const save = async () => {
    setError('');
    if (
      !verdict ||
      !reason.trim() ||
      (verdict === 'violation' && !selected.length)
    ) {
      setError(
        'Chọn kết luận, nhập lý do và chọn dòng bằng chứng nếu có vi phạm.',
      );
      return;
    }
    setBusy(true);
    try {
      await api(`/labs/${labId}/reviews/${item.id}/decisions`, {
        method: 'POST',
        body: JSON.stringify({
          verdict,
          reason,
          version: item.version,
          evidence:
            verdict === 'violation'
              ? selected
                  .sort((a, b) => a - b)
                  .map((line) => ({ line, text: lines[line - 1] }))
              : [],
        }),
      });
      setVerdict('');
      setReason('');
      setSelected([]);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể lưu quyết định');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="space-y-4 p-5">
      <div>
        <b>
          {item.studentName} — {item.constraintId}
        </b>
        <p className="break-all text-xs text-gray-500">
          Submission: {item.submissionId}
        </p>
      </div>
      <p>
        {item.constraintText} <b>(Mức trừ: {item.deduction})</b>
      </p>
      <p>
        Đề xuất: <b>{item.proposedVerdict}</b>
        {item.sampledPass ? ' · Mẫu kiểm tra pass' : ''}
      </p>
      {item.proposalReason && <p>Lý do hệ thống: {item.proposalReason}</p>}
      {item.evidence.map((e) => (
        <pre key={e.line} className="overflow-x-auto bg-amber-50 p-2">
          {e.line}: {e.text}
        </pre>
      ))}
      {item.decision && (
        <div className="rounded bg-green-50 p-3">
          TA đã chọn <b>{item.decision.verdict}</b>: {item.decision.reason}
        </div>
      )}
      <details>
        <summary className="cursor-pointer font-semibold">
          Mở mã nguồn để chọn bằng chứng
        </summary>
        <p className="my-2 text-sm">
          Chọn ít nhất một dòng nếu kết luận vi phạm.
        </p>
        <div className="max-h-96 overflow-auto rounded border bg-slate-50 p-2">
          {lines
            .map((text, index) => ({ text, number: index + 1 }))
            .map(({ text: line, number }) => (
              <label
                key={number}
                className="flex gap-2 whitespace-pre font-mono text-xs"
              >
                <input
                  type="checkbox"
                  disabled={!line.trim() || busy}
                  checked={selected.includes(number)}
                  onChange={() =>
                    setSelected((current) =>
                      current.includes(number)
                        ? current.filter((n) => n !== number)
                        : [...current, number],
                    )
                  }
                />
                <span className="w-8 shrink-0 text-right text-gray-500">
                  {number}
                </span>
                <span>{line || ' '}</span>
              </label>
            ))}
        </div>
      </details>
      <select
        aria-label="Kết luận của TA"
        value={verdict}
        disabled={busy}
        onChange={(e) =>
          setVerdict(e.target.value as '' | 'pass' | 'violation')
        }
        className="rounded border p-2"
      >
        <option value="">Chọn kết luận...</option>
        <option value="pass">Pass — không vi phạm</option>
        <option value="violation">Violation — có vi phạm</option>
      </select>
      <textarea
        aria-label="Lý do quyết định"
        maxLength={4000}
        value={reason}
        disabled={busy}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Lý do quyết định của TA"
        className="block min-h-20 w-full rounded border p-2"
      />
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <Button disabled={busy} onClick={save}>
        {busy ? 'Đang lưu...' : 'Lưu quyết định'}
      </Button>
      <p className="text-xs text-gray-500">
        Quyết định được ghi lịch sử; thao tác này chưa công bố điểm cho sinh
        viên.
      </p>
    </Card>
  );
}
export default function ReviewQueuePage() {
  const { labId } = useParams();
  const requestVersion = useRef({ version: 0 });
  const [view, setView] = useState('queue'),
    [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    if (!labId) return;
    const version = ++requestVersion.current.version;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const result = await api<Result>(
        `/labs/${labId}/reviews?page=${page}&limit=10&view=${view}`,
      );
      if (version === requestVersion.current.version) setData(result);
    } catch (e) {
      if (version === requestVersion.current.version)
        setError(e instanceof Error ? e.message : 'Không thể tải hàng chờ');
    } finally {
      if (version === requestVersion.current.version) setLoading(false);
    }
  }, [labId, page, view]);
  useEffect(() => {
    const requestState = requestVersion.current;
    const timer = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(timer);
      requestState.version++;
    };
  }, [load]);
  return (
    <div className="space-y-5">
      <Link to="/ta/labs" className="text-blue-800">
        ← Quản lý Lab
      </Link>
      <h1 className="text-3xl font-bold">Hàng chờ review</h1>
      <p>
        Chỉ bài nộp mới nhất được tính. Hàng chờ gồm vi phạm, chưa chắc chắn và
        mẫu 10% pass làm tròn lên.
      </p>
      <div className="flex gap-3">
        <select
          aria-label="Lọc hàng chờ"
          value={view}
          onChange={(e) => {
            setView(e.target.value);
            setPage(1);
          }}
          className="rounded border p-2"
        >
          <option value="queue">Cần duyệt</option>
          <option value="all">Tất cả verdict / sửa quyết định</option>
        </select>
        <Button onClick={() => void load()} disabled={loading}>
          Làm mới
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {loading && <p>Đang tải...</p>}
      {data && (
        <>
          <p>
            Còn {data.requiredPending} mục bắt buộc duyệt · {data.total} kết quả
          </p>
          {!data.items.length && (
            <Card className="p-5">
              Không có mục phù hợp. Nếu vừa nộp bài, đợi worker chấm xong rồi
              làm mới.
            </Card>
          )}
          {data.items.map((item) => (
            <ReviewCard
              key={`${item.id}:${item.version}`}
              item={item}
              labId={labId ?? ''}
              onSaved={() => void load()}
            />
          ))}
          <div className="flex items-center gap-3">
            <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </Button>
            <span>Trang {page}</span>
            <Button
              disabled={page * 10 >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
