import { useCallback, useEffect, useState } from "react";

export function usePaginatedResource(fetcher, filters) {
  const [data, setData] = useState({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetcher(filters)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetcher, filters, reloadKey]);

  return { ...data, loading, error, reload };
}
