import { Field, Input, Select } from "./FormControls.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export function FilterBar({ values, onChange, bases, equipmentTypes, showBase = true, extra }) {
  const { user } = useAuth();
  const canSelectBase = user?.role === "ADMIN" && showBase;

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
      <Field label="From" htmlFor="dateFrom">
        <Input
          id="dateFrom"
          type="date"
          value={values.dateFrom}
          onChange={(e) => onChange({ ...values, dateFrom: e.target.value, page: 1 })}
        />
      </Field>
      <Field label="To" htmlFor="dateTo">
        <Input
          id="dateTo"
          type="date"
          value={values.dateTo}
          onChange={(e) => onChange({ ...values, dateTo: e.target.value, page: 1 })}
        />
      </Field>
      {canSelectBase ? (
        <Field label="Base" htmlFor="baseId">
          <Select
            id="baseId"
            value={values.baseId}
            onChange={(e) => onChange({ ...values, baseId: e.target.value, page: 1 })}
          >
            <option value="">All bases</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      {equipmentTypes ? (
        <Field label="Equipment type" htmlFor="equipmentTypeId">
          <Select
            id="equipmentTypeId"
            value={values.equipmentTypeId}
            onChange={(e) => onChange({ ...values, equipmentTypeId: e.target.value, page: 1 })}
          >
            <option value="">All types</option>
            {equipmentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : extra}
    </div>
  );
}
