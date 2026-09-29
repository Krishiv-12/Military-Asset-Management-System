import { useMemo, useState } from "react";
import { auditService } from "../services/resources.js";
import { useLookups } from "../hooks/useLookups.js";
import { usePaginatedResource } from "../hooks/usePaginatedResource.js";
import { FilterBar } from "../components/FilterBar.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { ErrorBanner } from "../components/Feedback.jsx";
import { Field, Select } from "../components/FormControls.jsx";
import { formatDateTime } from "../utils/format.js";

export default function AuditLogsPage() {
  const { bases } = useLookups();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    baseId: "",
    entity: "",
    page: 1,
    pageSize: 15,
  });

  const query = useMemo(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      baseId: filters.baseId || undefined,
      entity: filters.entity || undefined,
    }),
    [filters],
  );

  const { items, pagination, loading, error } = usePaginatedResource(auditService.list, query);

  const columns = [
    { key: "createdAt", header: "Time", render: (row) => formatDateTime(row.createdAt) },
    { key: "user", header: "User", render: (row) => row.user.name },
    { key: "action", header: "Action" },
    { key: "entity", header: "Entity", render: (row) => `${row.entity}` },
    { key: "base", header: "Base", render: (row) => row.base?.name || "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit logs</h1>
        <p className="mt-1 text-sm text-slate-500">Read-only history of purchases, transfers, assignments, expenditures, and sign-in events.</p>
      </div>
      <FilterBar
        values={filters}
        onChange={setFilters}
        bases={bases}
        equipmentTypes={null}
        extra={
          <Field label="Entity" htmlFor="entity">
            <Select
              id="entity"
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value, page: 1 })}
            >
              <option value="">All entities</option>
              <option value="Purchase">Purchase</option>
              <option value="Transfer">Transfer</option>
              <option value="Assignment">Assignment</option>
              <option value="Expenditure">Expenditure</option>
              <option value="User">User</option>
            </Select>
          </Field>
        }
      />
      <ErrorBanner message={error} />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No audit records"
        emptyDescription="Activity will appear here after transactions are recorded."
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </div>
  );
}
