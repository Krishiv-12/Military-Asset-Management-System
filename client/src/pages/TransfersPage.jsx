import { useMemo, useState } from "react";
import { transfersService } from "../services/resources.js";
import { useLookups } from "../hooks/useLookups.js";
import { usePaginatedResource } from "../hooks/usePaginatedResource.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FilterBar } from "../components/FilterBar.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { Button, Field, Input, Select, Textarea } from "../components/FormControls.jsx";
import { ConfirmDialog } from "../components/Modal.jsx";
import { ErrorBanner, SuccessBanner } from "../components/Feedback.jsx";
import { formatDate, todayInputValue, toIsoDate } from "../utils/format.js";

export default function TransfersPage() {
  const { user } = useAuth();
  const { bases, equipmentTypes } = useLookups();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    baseId: "",
    page: 1,
    pageSize: 10,
  });
  const [form, setForm] = useState({
    sourceBaseId: user.baseId || "",
    destinationBaseId: "",
    equipmentTypeId: "",
    quantity: 1,
    transferDate: todayInputValue(),
    notes: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const query = useMemo(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      baseId: filters.baseId || undefined,
    }),
    [filters],
  );

  const { items, pagination, loading, error, reload } = usePaginatedResource(transfersService.list, query);

  function openConfirm(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setConfirmOpen(true);
  }

  async function submit() {
    setSaving(true);
    try {
      await transfersService.create({
        sourceBaseId: form.sourceBaseId,
        destinationBaseId: form.destinationBaseId,
        transferDate: toIsoDate(form.transferDate),
        notes: form.notes || undefined,
        items: [
          {
            equipmentTypeId: form.equipmentTypeId,
            quantity: Number(form.quantity),
          },
        ],
      });
      setSuccess("Transfer completed. Inventory updated at both bases.");
      setConfirmOpen(false);
      reload();
    } catch (err) {
      setFormError(err.message);
      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: "transferDate", header: "Date", render: (row) => formatDate(row.transferDate) },
    { key: "from", header: "From", render: (row) => row.sourceBase.name },
    { key: "to", header: "To", render: (row) => row.destinationBase.name },
    {
      key: "items",
      header: "Items",
      render: (row) => row.items.map((item) => `${item.equipmentType.name} × ${item.quantity}`).join(", "),
    },
    { key: "createdBy", header: "Recorded by", render: (row) => row.createdBy.name },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Transfers</h1>
        <p className="mt-1 text-sm text-slate-500">Move assets between bases in a single atomic transaction.</p>
      </div>
      <form onSubmit={openConfirm} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Source base" htmlFor="source-base">
          <Select
            id="source-base"
            required
            value={form.sourceBaseId}
            onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
          >
            <option value="">Select source</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Destination base" htmlFor="dest-base">
          <Select
            id="dest-base"
            required
            value={form.destinationBaseId}
            onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
          >
            <option value="">Select destination</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Equipment type" htmlFor="transfer-type">
          <Select
            id="transfer-type"
            required
            value={form.equipmentTypeId}
            onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
          >
            <option value="">Select type</option>
            {equipmentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Quantity" htmlFor="transfer-qty">
          <Input
            id="transfer-qty"
            type="number"
            min="1"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </Field>
        <Field label="Transfer date" htmlFor="transfer-date">
          <Input
            id="transfer-date"
            type="date"
            required
            value={form.transferDate}
            onChange={(e) => setForm({ ...form, transferDate: e.target.value })}
          />
        </Field>
        <div className="md:col-span-2 xl:col-span-3">
          <Field label="Notes (optional)" htmlFor="transfer-notes">
            <Textarea
              id="transfer-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
        </div>
        <div>
          <Button type="submit">Create transfer</Button>
        </div>
      </form>
      <ErrorBanner message={formError || error} />
      <SuccessBanner message={success} />
      <FilterBar values={filters} onChange={setFilters} bases={bases} showBase equipmentTypes={null} />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No transfers found"
        emptyDescription="Create a transfer or adjust the filters."
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm transfer"
        description="Source inventory will decrease and destination inventory will increase in one transaction. Continue?"
        confirmLabel="Create transfer"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </div>
  );
}
