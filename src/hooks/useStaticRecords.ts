import { getAllRecords } from '../content';

// 线上动态来自构建快照，编辑操作留在本地后台。
export function useStaticRecords() {
  return { records: getAllRecords() };
}
