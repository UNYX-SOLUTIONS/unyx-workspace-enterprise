import { getProformaStatusMeta } from "@/modules/common/utils/statusMap";

export interface ProformaStatusBadgeProps {
  status?: string | null;
}

export default function ProformaStatusBadge({ status }: ProformaStatusBadgeProps) {
  const meta = getProformaStatusMeta(status);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}
