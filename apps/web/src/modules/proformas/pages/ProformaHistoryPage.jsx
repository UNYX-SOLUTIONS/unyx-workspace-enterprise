import { Link } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import ActionButton from "../../../components/common/ActionButton";

export default function ProformaHistoryPage() {
  return (
    <>
      <PageHeader
        title="Proformas"
        description="Historial y seguimiento de proformas"
        actions={<Link to="/proformas/nueva"><ActionButton label="Nueva proforma" /></Link>}
      />
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        Mueve aquí el contenido de tu HistoryPage actual.
      </div>
    </>
  );
}
