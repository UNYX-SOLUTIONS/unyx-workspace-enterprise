import InputField from "../../../components/common/InputField";

export function EquipmentForm({
  equipo,
  onChange,
}) {
  const update = (field, value) => {
    onChange({
      ...equipo,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InputField
        label="Tipo de equipo"
        value={equipo.tipo || ""}
        onChange={(event) =>
          update("tipo", event.target.value)
        }
      />

      <InputField
        label="Marca"
        value={equipo.marca || ""}
        onChange={(event) =>
          update("marca", event.target.value)
        }
      />

      <InputField
        label="Modelo"
        value={equipo.modelo || ""}
        onChange={(event) =>
          update("modelo", event.target.value)
        }
      />

      <InputField
        label="Número de serie"
        value={equipo.numeroSerie || ""}
        onChange={(event) =>
          update("numeroSerie", event.target.value)
        }
      />

      <InputField
        label="Sistema operativo"
        value={equipo.sistemaOperativo || ""}
        onChange={(event) =>
          update(
            "sistemaOperativo",
            event.target.value
          )
        }
      />

      <InputField
        label="Procesador"
        value={equipo.procesador || ""}
        onChange={(event) =>
          update("procesador", event.target.value)
        }
      />

      <InputField
        label="Memoria RAM"
        value={equipo.ram || ""}
        onChange={(event) =>
          update("ram", event.target.value)
        }
      />

      <InputField
        label="Almacenamiento"
        value={equipo.almacenamiento || ""}
        onChange={(event) =>
          update(
            "almacenamiento",
            event.target.value
          )
        }
      />

      <InputField
        label="Accesorios recibidos"
        value={equipo.accesorios || ""}
        onChange={(event) =>
          update("accesorios", event.target.value)
        }
      />

      <label
        className="
          mt-7 flex items-center gap-3
          text-sm font-semibold !text-[#111827]
        "
      >
        <input
          type="checkbox"
          checked={Boolean(
            equipo.cargadorEntregado
          )}
          onChange={(event) =>
            update(
              "cargadorEntregado",
              event.target.checked
            )
          }
          className="h-5 w-5 accent-[#2170e4]"
        />

        Cargador entregado
      </label>
    </div>
  );
}

export default EquipmentForm;