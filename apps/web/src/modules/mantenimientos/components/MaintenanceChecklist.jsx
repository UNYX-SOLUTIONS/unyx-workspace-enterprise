import {
  MAINTENANCE_STATUSES,
} from "../constants/maintenanceChecklist";

export function MaintenanceChecklist({
  items = [],
  onChange,
}) {
  const categories = [
    ...new Set(
      items
        .map((item) => item.categoria)
        .filter(Boolean)
    ),
  ];

  function updateItem(id, field, value) {
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
        const categoryItems = items.filter(
          (item) => item.categoria === category
        );

        return (
          <section
            key={category}
            className="
              overflow-hidden rounded-xl
              border border-[#c7c6cb]
              bg-white
            "
          >
            <div className="bg-gradient-to-r from-[#eff4ff] to-[#dce9ff] px-4 py-3">
              <p className="font-extrabold !text-[#111827]">
                {category}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[#f1f5f9] text-left">
                  <tr>
                    <th className="px-4 py-3 font-extrabold !text-[#26364d]">
                      Verificación
                    </th>

                    <th className="w-44 px-4 py-3 font-extrabold !text-[#26364d]">
                      Estado
                    </th>

                    <th className="w-[36%] px-4 py-3 font-extrabold !text-[#26364d]">
                      Observaciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categoryItems.map((item) => (
                    <tr
                      key={item.id}
                      className="
                        border-t border-[#e1e5eb]
                        align-top transition-colors
                        hover:bg-[#f8faff]
                      "
                    >
                      <td className="px-4 py-3 font-medium !text-[#111827]">
                        {item.actividad}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={item.estado || "Pendiente"}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "estado",
                              event.target.value
                            )
                          }
                          className="
                            w-full rounded-lg
                            border border-[#c7c6cb]
                            bg-white px-3 py-2
                            font-medium !text-[#111827]
                            outline-none transition-all
                            focus:border-[#2170e4]
                            focus:ring-2
                            focus:ring-[#2170e4]
                          "
                        >
                          {MAINTENANCE_STATUSES.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <textarea
                          value={item.observacion || ""}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "observacion",
                              event.target.value
                            )
                          }
                          rows={2}
                          className="
                            w-full resize-none
                            rounded-lg border
                            border-[#c7c6cb]
                            bg-white px-3 py-2
                            !text-[#111827]
                            placeholder:!text-[#6b7280]
                            outline-none transition-all
                            focus:border-[#2170e4]
                            focus:ring-2
                            focus:ring-[#2170e4]
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
        <div className="rounded-xl border border-dashed border-[#c7c6cb] p-8 text-center">
          <p className="font-medium !text-[#4b5563]">
            No existen actividades en el checklist.
          </p>
        </div>
      )}
    </div>
  );
}

export default MaintenanceChecklist;