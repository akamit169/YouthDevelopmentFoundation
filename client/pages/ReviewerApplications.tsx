import React, { useEffect, useMemo, useState } from "react";
import RoleBasedNavigation from "../components/RoleBasedNavigation";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const statuses = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlisted", label: "Waitlisted" },
];

export default function ReviewerApplications() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listReviewerApplications({
        page,
        limit,
        status: statusFilter,
      });
      if (res.success) {
        setRows(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavigation />
      <div className="px-6 py-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          Review Applications
        </h1>
        <p className="text-sm text-gray-600">
          Manage applications assigned to you
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 border rounded"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholarship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((r) => (
                  <EditableRow key={r.id} row={r} onSaved={load} />
                ))}
                {!rows.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      {loading ? "Loading..." : "No applications found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages} • Total {total}
          </div>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableRow({ row, onSaved }: { row: any; onSaved: () => void }) {
  const [status, setStatus] = useState<string>(row.status);
  const [score, setScore] = useState<string>(
    row.score == null ? "" : String(row.score),
  );
  const [notes, setNotes] = useState<string>(row.reviewNotes || "");
  const [saving, setSaving] = useState(false);

  const locked = useMemo(() => {
    const hasComment = String(row.reviewNotes || notes || "").trim().length > 0;
    return row.status === "approved" && hasComment;
  }, [row.status, row.reviewNotes, notes]);

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = { status, reviewNotes: notes };
      if (score !== "") payload.score = Number(score);
      const res = await api.updateMyAssignedApplication(row.id, payload);
      if (res.success) {
        const recommendation =
          status === "approved"
            ? "approve"
            : status === "rejected"
              ? "reject"
              : "conditionally_approve";
        await api.createReview({
          applicationId: row.id,
          overallScore: score === "" ? null : Number(score),
          comments: notes || null,
          recommendation,
        });
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td className="px-6 py-3 text-sm text-gray-900">{row.id}</td>
      <td className="px-6 py-3 text-sm text-gray-900">
        {row.studentName || row.studentId}
      </td>
      <td className="px-6 py-3 text-sm text-gray-900">
        {row.scholarshipTitle || row.scholarshipId}
      </td>
      <td className="px-6 py-3 text-sm text-gray-900">
        <select
          className="border rounded px-2 py-1 disabled:opacity-50"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={locked}
          title={locked ? "Approved with comment; further edits disabled" : ""}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-3 text-sm text-gray-900">
        <input
          type="number"
          className="w-24 border rounded px-2 py-1 disabled:opacity-50"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          disabled={locked}
          title={locked ? "Approved with comment; further edits disabled" : ""}
        />
      </td>
      <td className="px-6 py-3 text-sm text-gray-900">
        <input
          type="text"
          className="w-full border rounded px-2 py-1 disabled:opacity-50"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter review notes"
          disabled={locked}
          title={locked ? "Approved with comment; further edits disabled" : ""}
        />
      </td>
      <td className="px-6 py-3 text-right text-sm">
        <button
          className="px-3 py-2 bg-ydf-deep-blue text-white rounded disabled:opacity-50"
          onClick={save}
          disabled={saving || locked}
          title={locked ? "Approved with comment; further edits disabled" : ""}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
}
