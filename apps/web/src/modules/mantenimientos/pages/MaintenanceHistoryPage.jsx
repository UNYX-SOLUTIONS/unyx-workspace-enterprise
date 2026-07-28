import { Link } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import ActionButton from "../../../components/common/ActionButton";

export default function MaintenanceHistoryPage() {
  return (
    <>
      <PageHeader
        title="Mantenimientos"
        description="Historial de servicios técnicos"
        actions={<Link to="/mantenimientos/nuevo"><ActionButton label="Nuevo mantenimiento" /></Link>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        Mueve aquí tu historial de mantenimientos.
      </div>
    </>
  );
}
