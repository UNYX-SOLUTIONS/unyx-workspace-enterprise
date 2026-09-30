import {
  MAINTENANCE_STATUSES,
  type ChecklistItem,
} from "../constants/maintenanceChecklist";

export interface MaintenanceChecklistProps {
  items?: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function MaintenanceChecklist({ items = [], onChange }: MaintenanceChecklistProps) {
  const categories = [
    ...new Set(items.map((item) => item.categoria).filter(Boolean)),
  ];

  function updateItem(id: number, field: "estado" | "observacion", value: string) {
    onChange(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.categoria === category);

        return (
          <section
            key={category}
            className="
              overflow-hidden rounded-xl
              border border-slate-200
              bg-white
            "
          >
            <div className="bg-slate-50 px-4 py-3">
              <p className="font-extrabold !text-slate-900">{category}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-extrabold !text-slate-700">Verificación</th>

                    <th className="w-44 px-4 py-3 font-extrabold !text-slate-700">Estado</th>

                    <th className="w-[36%] px-4 py-3 font-extrabold !text-slate-700">
                      Observaciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categoryItems.map((item) => (
                    <tr
                      key={item.id}
                      className="
                        border-t border-slate-100
                        align-top transition-colors
                        hover:bg-slate-50
                      "
                    >
                      <td className="px-4 py-3 font-medium !text-slate-900">
                        {item.actividad}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={item.estado || "Pendiente"}
                          onChange={(event) =>
                            updateItem(item.id, "estado", event.target.value)
                          }
                          className="
                            w-full rounded-lg
                            border border-slate-200
                            bg-white px-3 py-2
                            font-medium !text-slate-900
                            outline-none transition-all
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-500
                          "
                        >
                          {MAINTENANCE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <textarea
                          value={item.observacion || ""}
                          onChange={(event) =>
                            updateItem(item.id, "observacion", event.target.value)
                          }
                          rows={2}
                          className="
                            w-full resize-none
                            rounded-lg border
                            border-slate-200
                            bg-white px-3 py-2
                            !text-slate-900
                            placeholder:!text-slate-500
                            outline-none transition-all
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-500
                          "
                          placeholder="Resultado, valor medido o novedad"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <p className="font-medium !text-slate-600">
            No existen actividades en el checklist.
          </p>
        </div>
      )}
    </div>
  );
}

export default MaintenanceChecklist;
