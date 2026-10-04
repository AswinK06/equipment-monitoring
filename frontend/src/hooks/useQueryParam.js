import { useSearchParams } from "react-router-dom";

export function useQueryParam(name) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(name) || "";

  const setValue = (newValue) => {
    const next = Object.fromEntries(searchParams.entries());
    if (newValue === null || newValue === undefined || newValue === "") {
      delete next[name];
    } else {
      next[name] = String(newValue);
    }
    setSearchParams(next);
  };

  return [value, setValue];
}
