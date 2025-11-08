import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { members as localMembers } from "@/data/members";

export default function DepartmentMembers() {
  const { id } = useParams();
  const deptCode = Number(id);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = () => {
      if (Number.isNaN(deptCode)) return;
      setLoading(true);
      const all = localMembers
        .filter((m) => String(m.department_code) === String(deptCode))
        .sort((a, b) => a.name.localeCompare(b.name));
      const totalCount = all.length;
      const from = (page - 1) * pageSize;
      const pageItems = all.slice(from, from + pageSize);
      if (mounted) {
        setTotal(totalCount);
        setMembers(pageItems);
        setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [deptCode, page]);

  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Department Members</h2>
        <Link to="/departments" className="text-sm text-primary hover:underline">Back to Departments</Link>
      </div>

      {loading ? (
        <p>Loading members…</p>
      ) : (
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members found for this department.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img src={m.avatar || "/placeholder.svg"} alt="avatar" className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    {m.class_name && (
                      <div className="text-xs text-muted-foreground">Class: {m.class_name}</div>
                    )}
                    {m.biography && (
                      <div className="text-xs text-muted-foreground line-clamp-2">{m.biography}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button
                className="btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
