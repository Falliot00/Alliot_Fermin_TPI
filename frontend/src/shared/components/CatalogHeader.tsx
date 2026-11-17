import { Icon } from "./Icon";

interface Props {
  title: string;
  description: string;
  action: string;
  onCreate: () => void;
  busy: boolean;
  search: string;
  onSearch: (value: string) => void;
}

export function CatalogHeader({
  title,
  description,
  action,
  onCreate,
  busy,
  search,
  onSearch,
}: Props) {
  return (
    <header className="mb-5">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="mt-2 text-stone-600">{description}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={onCreate}
        >
          <Icon name="plus" className="size-4" />
          {action}
        </button>
      </div>
      <label className="block max-w-xs">
        <span className="sr-only">Buscar en el catálogo</span>
        <input
          type="search"
          className="field text-sm"
          placeholder="Buscar en el catálogo…"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>
    </header>
  );
}
