"use client";
import { useEffect, useState } from "react";

export function Greeting({ name }: { name?: string | null }) {
  const [g, setG] = useState("Welcome back");
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return <>{g}{name ? `, ${name}` : ""}</>;
}
