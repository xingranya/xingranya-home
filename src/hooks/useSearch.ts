import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { getSearchIndex } from '../content';

export function useSearch() {
  const [query, setQuery] = useState('');

  const items = useMemo(() => getSearchIndex(), []);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'tags', weight: 0.25 },
        { name: 'category', weight: 0.15 },
        { name: 'summary', weight: 0.1 },
      ],
      threshold: 0.35,
      includeMatches: true,
      minMatchCharLength: 1,
    });
  }, [items]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, 8);
    }
    return fuse.search(query).map((res) => res.item);
  }, [query, fuse, items]);

  return {
    query,
    setQuery,
    results,
  };
}
