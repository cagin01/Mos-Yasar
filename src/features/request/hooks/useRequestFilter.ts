// Path: src/features/request/hooks/useRequestFilter.ts
import { useMemo, useState } from 'react';
import { CategoryGroup, RequestSummary } from '../types';

export function useRequestFilter(initialData: CategoryGroup[]) {
  const [searchKeyword, setSearchKeyword] = useState('');

  const processedData = useMemo(() => {
    if (!initialData) return [];
    
    return initialData.map((categoryGroup) => {
      const items = categoryGroup.data || [];
      
      const matchedRequests = items.filter((requestItem: RequestSummary) => {
        return Object.values(requestItem).some(val =>
          String(val).toLowerCase().includes(searchKeyword.toLowerCase())
        );
      });

      if (
        categoryGroup.category.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        matchedRequests.length > 0
      ) {
        return { ...categoryGroup, data: matchedRequests };
      }
      return null;
    }).filter((item): item is CategoryGroup => item !== null);
  }, [searchKeyword, initialData]);

  // Hook'u kullanan sayfalara arama state'ini, değiştirme fonksiyonunu ve filtrelenmiş veriyi döndürüyoruz.
  return {
    searchKeyword,
    setSearchKeyword,
    processedData
  };
}
