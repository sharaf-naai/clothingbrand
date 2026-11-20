"use client";

import { useEffect } from "react";
import { cart } from "@/lib/cart";

/** Empties the bag once the order page confirms a just-placed order (COD, or back from Stripe). */
export function ClearBag() {
  useEffect(() => cart.clear(), []);
  return null;
}
