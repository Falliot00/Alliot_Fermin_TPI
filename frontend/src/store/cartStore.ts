import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: Omit<ItemCarrito, "cantidad">, stock: number) => void;
  quitar: (id: number) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (producto, stock) =>
        set(({ items }) => {
          const anterior = items.find(
            (item) => item.producto_id === producto.producto_id,
          );
          if (stock <= (anterior?.cantidad ?? 0)) return { items };
          if (!anterior)
            return { items: [...items, { ...producto, cantidad: 1 }] };
          return {
            items: items.map((item) =>
              item === anterior
                ? { ...producto, cantidad: item.cantidad + 1 }
                : item,
            ),
          };
        }),
      quitar: (id) =>
        set(({ items }) => ({
          items: items.filter((item) => item.producto_id !== id),
        })),
      cambiarCantidad: (id, cantidad) => {
        if (
          !Number.isInteger(cantidad) ||
          cantidad < 1 ||
          cantidad > 2_147_483_647
        )
          return;
        set(({ items }) => ({
          items: items.map((item) =>
            item.producto_id === id ? { ...item, cantidad } : item,
          ),
        }));
      },
      vaciar: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (total, item) => total + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    { name: "food-store-cart", partialize: ({ items }) => ({ items }) },
  ),
);
