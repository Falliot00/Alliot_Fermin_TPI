import type { Categoria } from "@/features/categories/types/categoria";

export interface ProductoInput {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  categoria_id: number;
  stock?: number;
  disponible?: boolean;
}

export interface Producto extends ProductoInput {
  id: number;
  activo: boolean;
  stock: number;
  disponible: boolean;
  categoria: Categoria;
}

export interface ProductoFiltros {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
