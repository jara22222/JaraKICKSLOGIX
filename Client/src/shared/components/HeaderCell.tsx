export default function HeaderCell({
  label,
  align = "left",
}: {
  label: string;
  align?: string;
}) {
  return (
    <th
      className={`p-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-${align}`}
    >
      {label}
    </th>
  );
}
