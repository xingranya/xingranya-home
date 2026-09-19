import { useCallback, useEffect, useState } from 'react';
import { AdminStore } from '../lib/admin-store';
import type { RecordItem } from '../types';

export function useStaticRecords() {
  const [records, setRecords] = useState<RecordItem[]>(() => AdminStore.getRecords());

  useEffect(() => {
    const unsubscribe = AdminStore.subscribe(() => {
      setRecords(AdminStore.getRecords());
    });
    return unsubscribe;
  }, []);

  const saveRecord = useCallback((record: RecordItem) => {
    AdminStore.saveRecord(record);
  }, []);

  const removeRecord = useCallback((id: string | number) => {
    AdminStore.deleteRecord(id);
  }, []);

  return { records, saveRecord, removeRecord };
}
