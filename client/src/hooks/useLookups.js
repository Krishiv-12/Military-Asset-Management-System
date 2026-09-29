import { useEffect, useState } from "react";
import { lookupService } from "../services/resources.js";

export function useLookups() {
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([lookupService.bases(), lookupService.equipmentTypes()])
      .then(([baseRows, typeRows]) => {
        if (!active) return;
        setBases(baseRows);
        setEquipmentTypes(typeRows);
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
  }, []);

  return { bases, equipmentTypes, loading, error };
}
