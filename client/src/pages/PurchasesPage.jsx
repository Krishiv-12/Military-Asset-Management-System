import { useMemo, useState } from "react";
import { purchasesService } from "../services/resources.js";
import { useLookups } from "../hooks/useLookups.js";
import { usePaginatedResource } from "../hooks/usePaginatedResource.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FilterBar } from "../components/FilterBar.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { Button, Field, Input, Select, Textarea } from "../components/FormControls.jsx";
import { ConfirmDialog } from "../components/Modal.jsx";
import { ErrorBanner, SuccessBanner } from "../components/Feedback.jsx";
import { formatDate, todayInputValue, toIsoDate } from "../utils/format.js";

export default function PurchasesPage() {
  const { user } = useAuth();
  const { bases, equipmentTypes } = useLookups();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    baseId: "",
    equipmentTypeId: "",
    page: 1,
    pageSize: 10,
  });
  const [form, setForm] = useState({
    baseId: user.baseId || "",
    equipmentTypeId: "",
    quantity: 1,
    purchaseDate: todayInputValue(),
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
      equipmentTypeId: filters.equipmentTypeId || undefined,
    }),
    [filters],
  );

  const { items, pagination, loading, error, reload } = usePaginatedResource(purchasesService.list, query);

  function openConfirm(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setConfirmOpen(true);
  }

  async function submit() {
    setSaving(true);
    try {
      await purchasesService.create({
        baseId: form.baseId,
        equipmentTypeId: form.equipmentTypeId,
        quantity: Number(form.quantity),
        purchaseDate: toIsoDate(form.purchaseDate),
        notes: form.notes || undefined,
      });
      setSuccess("Purchase recorded and inventory updated.");
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
    { key: "purchaseDate", header: "Date", render: (row) => formatDate(row.purchaseDate) },
    { key: "base", header: "Base", render: (row) => row.base.name },
    { key: "equipment", header: "Equipment", render: (row) => row.equipmentType.name },
    { key: "quantity", header: "Quantity" },
    { key: "createdBy", header: "Recorded by", render: (row) => row.createdBy.name },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Purchases</h1>
        <p className="mt-1 text-sm text-slate-500">Record incoming stock and review purchase history.</p>
      </div>
      <form onSubmit={openConfirm} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Base" htmlFor="purchase-base">
          <Select
            id="purchase-base"
            required
            value={form.baseId}
            disabled={user.role !== "ADMIN"}
            onChange={(e) => setForm({ ...form, baseId: e.target.value })}
          >
            <option value="">Select base</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Equipment type" htmlFor="purchase-type">
          <Select
            id="purchase-type"
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
        <Field label="Quantity" htmlFor="purchase-qty">
          <Input
            id="purchase-qty"
            type="number"
            min="1"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </Field>
        <Field label="Purchase date" htmlFor="purchase-date">
          <Input
            id="purchase-date"
            type="date"
            required
            value={form.purchaseDate}
            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notes (optional)" htmlFor="purchase-notes">
            <Textarea
              id="purchase-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
        </div>
        <div className="flex items-end">
          <Button type="submit">Record purchase</Button>
        </div>
      </form>
      <ErrorBanner message={formError || error} />
      <SuccessBanner message={success} />
      <FilterBar values={filters} onChange={setFilters} bases={bases} equipmentTypes={equipmentTypes} />
      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyTitle="No purchases found"
        emptyDescription="Record a purchase or adjust the filters."
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm purchase"
        description="This will increase inventory and create a movement record. Continue?"
        confirmLabel="Record purchase"
        loading={saving}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </div>
  );
}
