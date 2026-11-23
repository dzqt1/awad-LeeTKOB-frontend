import { useEffect, useState, type KeyboardEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../app/AuthContext';
import { Badge, Button, Card } from '../../components/ui';
import type { Lab, Submission } from '../../types';
export default function LabDetailPage() {
  const { labId } = useParams();
  const { user } = useAuth();
  const [lab, setLab] = useState<Lab | null>(null),
    [source, setSource] = useState(
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
    ),
    [submission, setSubmission] = useState<Submission | null>(null),
    [isSubmitting, setIsSubmitting] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    if (labId)
      api<{ lab: Lab }>(`/labs/${labId}`)
        .then((r) => setLab(r.lab))
        .catch((e) => setError(e.message));
  }, [labId]);
  useEffect(() => {
    if (
      !submission ||
      submission.status === 'finished' ||
      submission.status === 'failed'
    )
      return;

    let cancelled = false;
    const fetchSubmission = () =>
      api<{ submission: Submission }>(`/submissions/${submission.id}`)
        .then((r) => {
          if (!cancelled) setSubmission(r.submission);
        })
        .catch((e) => {
          if (!cancelled)
            setError(
              e instanceof Error
                ? e.message
                : 'Không thể tải trạng thái submission',
            );
        });

    fetchSubmission();
    const interval = window.setInterval(fetchSubmission, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [submission]);
  const submit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const key = crypto.randomUUID();
      const r = await api<{
        submission: Submission;
      }>(`/labs/${labId}/submissions`, {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: JSON.stringify({ source }),
      });
      setSubmission(r.submission);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSourceKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return;

    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (event.shiftKey) {
      const lineStart = source.lastIndexOf('\n', start - 1) + 1;
      const selectedBlock = source.slice(lineStart, end);
      const lines = selectedBlock.split('\n');
      let removedBeforeCursor = 0;

      const unindentedLines = lines.map((line, index) => {
        const leadingSpaces = line.match(/^ {1,4}/)?.[0].length ?? 0;
        if (index === 0) removedBeforeCursor = leadingSpaces;
        return line.slice(leadingSpaces);
      });
      const unindented = unindentedLines.join('\n');
      const updated =
        source.slice(0, lineStart) + unindented + source.slice(end);
      setSource(updated);
      requestAnimationFrame(() => {
        textarea.selectionStart = Math.max(
          lineStart,
          start - removedBeforeCursor,
        );
        textarea.selectionEnd = Math.max(lineStart, end - removedBeforeCursor);
      });
      return;
    }

    const indentation = '    ';
    const updated = source.slice(0, start) + indentation + source.slice(end);
    setSource(updated);
    requestAnimationFrame(() => {
      textarea.selectionStart = start + indentation.length;
      textarea.selectionEnd = start + indentation.length;
    });
  };
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-[#737d90]">Chi tiết Lab</p>
          <h1 className="text-3xl font-bold">{lab?.title || 'Đang tải...'}</h1>
        </div>
        {lab && (
          <Badge tone={lab.status === 'open' ? 'success' : 'neutral'}>
            {lab.status}
          </Badge>
        )}
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {lab && (
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <Card className="p-6">
            <h2 className="text-lg font-bold">Đề bài</h2>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-[#4b5565]">
              {lab.statement}
            </p>
            <h3 className="mt-5 font-bold">Ràng buộc</h3>
            <div className="mt-2 space-y-2">
              {lab.constraints.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between rounded-lg bg-[#f7f8fb] px-4 py-3 text-sm"
                >
                  <span>
                    <b>{c.id}</b> · {c.text}
                  </span>
                  <Badge tone="warning">−{c.deduction} điểm</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <b>Thông tin bài</b>
            <p className="mt-4 text-sm text-[#737d90]">
              Hạn nộp: {new Date(lab.deadlineAt).toLocaleString('vi-VN')}
            </p>
            <p className="mt-2 text-sm text-[#737d90]">
              CPU: {lab.limits.cpuSeconds}s · Memory: {lab.limits.memoryMb}MB
            </p>
          </Card>
        </div>
      )}
      {lab && user?.role === 'STU' && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <b>Nộp mã nguồn C++</b>
              <p className="text-sm text-[#737d90]">Tối đa 65.536 bytes</p>
            </div>
            <Button onClick={submit} disabled={isSubmitting}>
              <Send size={17} />
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </Button>
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onKeyDown={handleSourceKeyDown}
            className="mt-4 min-h-72 w-full rounded-lg border border-[#dde3ed] p-3 font-mono text-[13px]"
          />
          {submission && (
            <div className="mt-4 rounded-lg border border-[#dde3ed] bg-[#f8fafc] p-4">
              <div className="flex items-center justify-between gap-3">
                <b>Kết quả submission</b>
                <Badge
                  tone={
                    submission.status === 'finished'
                      ? submission.overallVerdict === 'AC'
                        ? 'success'
                        : 'danger'
                      : submission.status === 'failed'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {submission.status}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-[#737d90]">ID: {submission.id}</p>

              {submission.status === 'finished' && (
                <div className="mt-4">
                  <p className="font-semibold">
                    Tổng kết:{' '}
                    <span
                      className={
                        submission.overallVerdict === 'AC'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }
                    >
                      {submission.overallVerdict ?? 'Chưa có kết quả'}
                    </span>
                  </p>
                  {submission.tests.length > 0 ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-[#dde3ed]">
                      {submission.tests.map((test) => (
                        <div
                          key={test.testNumber}
                          className="flex items-center justify-between border-b border-[#dde3ed] px-3 py-2 text-sm last:border-b-0"
                        >
                          <span>Test {test.testNumber}</span>
                          <span className="font-semibold">{test.verdict}</span>
                          {test.executionMs !== undefined && (
                            <span className="text-[#737d90]">
                              {test.executionMs} ms
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#737d90]">
                      Không có kết quả test.
                    </p>
                  )}
                </div>
              )}

              {submission.status === 'failed' && (
                <p className="mt-3 text-sm text-red-700">
                  Chấm bài thất bại. Không có kết quả test.
                </p>
              )}

              {(submission.status === 'queued' ||
                submission.status === 'running') && (
                <p className="mt-3 text-sm text-[#737d90]">
                  Đang chờ kết quả chấm bài...
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
