import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardService } from "../services/resources.js";
import { useLookups } from "../hooks/useLookups.js";
import { FilterBar } from "../components/FilterBar.jsx";
import { ErrorBanner, Spinner } from "../components/Feedback.jsx";
import { Modal } from "../components/Modal.jsx";
import { numberOrZero } from "../utils/format.js";

const emptyFilters = { dateFrom: "", dateTo: "", baseId: "", equipmentTypeId: "" };

function StatCard({ label, value, onClick, hint }) {
  const interactive = Boolean(onClick);
  const Tag = interactive ? "button" : "div";
  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm ${
        interactive ? "transition hover:border-navy-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-navy-700/20" : ""
      }`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">{numberOrZero(value).toLocaleString()}</p>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </Tag>
  );
}

export default function DashboardPage() {
  const { bases, equipmentTypes } = useLookups();
  const [filters, setFilters] = useState(emptyFilters);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const query = useMemo(() => {
    const params = {};
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    return params;
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    dashboardService
      .summary(query)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  const chartData = summary
    ? [
        { name: "Purchases", value: summary.netMovementBreakdown.purchases },
        { name: "Transfer in", value: summary.netMovementBreakdown.transferIn },
        { name: "Transfer out", value: summary.netMovementBreakdown.transferOut },
        { name: "Assigned", value: summary.assignedAssets },
        { name: "Expended", value: summary.expendedAssets },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Opening and closing balances, movement, assignments, and expenditures.</p>
      </div>
      <FilterBar values={filters} onChange={setFilters} bases={bases} equipmentTypes={equipmentTypes} />
      <ErrorBanner message={error} />
      {loading ? (
        <Spinner label="Loading dashboard" />
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Opening balance" value={summary.openingBalance} />
            <StatCard label="Closing balance" value={summary.closingBalance} />
            <StatCard
              label="Net movement"
              value={summary.netMovement}
              hint="Click for breakdown"
              onClick={() => setModalOpen(true)}
            />
            <StatCard label="Assigned assets" value={summary.assignedAssets} />
            <StatCard label="Expended assets" value={summary.expendedAssets} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-medium text-slate-700">Activity in selected period</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1a2438" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
      <Modal open={modalOpen} title="Net movement" onClose={() => setModalOpen(false)}>
        {summary ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Purchases</dt>
              <dd className="font-medium">{summary.netMovementBreakdown.purchases.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Transfer in</dt>
              <dd className="font-medium">{summary.netMovementBreakdown.transferIn.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Transfer out</dt>
              <dd className="font-medium">{summary.netMovementBreakdown.transferOut.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3">
              <dt className="font-medium text-slate-800">Net movement</dt>
              <dd className="font-semibold">{summary.netMovementBreakdown.netMovement.toLocaleString()}</dd>
            </div>
            <p className="pt-1 text-xs text-slate-500">Purchases + Transfer in − Transfer out</p>
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}
