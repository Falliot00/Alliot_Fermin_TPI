type IconName =
  | "layers"
  | "plus"
  | "search"
  | "arrow"
  | "edit"
  | "trash"
  | "close"
  | "folder"
  | "check"
  | "alert";
type SortIconName = "sort-up" | "sort-down" | "sort";
type Props = { name: IconName | SortIconName; className?: string };

const paths: Record<IconName | SortIconName, string> = {
  layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  edit: "m16 3 5 5M4 20l4-1L21 6a2 2 0 0 0-3-3L5 16l-1 4Z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  close: "m6 6 12 12M6 18 18 6",
  folder: "M3 7V5h6l2 2h10v13H3V7Z",
  check: "m5 12 4 4L19 6",
  alert: "M12 8v5m0 4h.01M12 3 2 21h20L12 3Z",
  "sort-up": "M12 20V4m-5 5 5-5 5 5",
  "sort-down": "M12 4v16m-5-5 5 5 5-5",
  sort: "M8 20V4m-4 4 4-4 4 4M16 4v16m-4-4 4 4 4-4",
};

export function Icon({ name, className = "size-5" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
