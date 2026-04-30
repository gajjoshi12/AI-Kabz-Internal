"use client";

import { useEffect, useState } from "react";

export type Employee = {
  id: string;
  name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  active: boolean;
};

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setEmployees(Array.isArray(data) ? data.filter((e) => e.active) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { employees, loading };
}
