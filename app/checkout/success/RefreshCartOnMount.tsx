"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/CartProvider";

export default function RefreshCartOnMount() {
  const { refresh } = useCart();
  useEffect(() => {
    refresh();
  }, [refresh]);
  return null;
}
