import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface LocationSuggestion {
  label: string;
  display_name: string;
  lat: number;
  lon: number;
}

interface LocationSelectProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export default function LocationSelect({
  label,
  value,
  placeholder,
  onChange,
}: LocationSelectProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const query = value.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const response = await axios.get<LocationSuggestion[]>(
          `${API_BASE_URL}/trips/locations/`,
          {
            params: { q: query },
            signal: controller.signal,
          }
        );

        setSuggestions(response.data);
        setOpen(true);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectLocation = (location: LocationSuggestion) => {
    skipNextSearch.current = true;
    setSuggestions([]);
    setOpen(false);
    onChange(location.label);
  };

  return (
    <div className="location-select" ref={containerRef}>
      <label>{label}</label>

      <div className="location-input-wrapper">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setOpen(true);
            }
          }}
        />

        {loading && (
          <span className="location-loading">Searching...</span>
        )}
      </div>

      {open && !loading && suggestions.length > 0 && (
        <div className="location-dropdown">
          {suggestions.map((location, index) => (
            <button
              type="button"
              className="location-option"
              key={`${location.lat}-${location.lon}-${index}`}
              onClick={() => selectLocation(location)}
            >
              <strong>{location.label}</strong>

              {location.display_name !== location.label && (
                <small>{location.display_name}</small>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}