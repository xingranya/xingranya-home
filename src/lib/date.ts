export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  } catch {
    return dateString;
  }
}

export function getYear(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return String(date.getFullYear());
  } catch {
    return '';
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay < 1) {
      if (diffHour < 1) {
        return diffMin <= 1 ? '刚刚' : `${diffMin} 分钟前`;
      }
      return `${diffHour} 小时前`;
    }
    if (diffDay < 30) {
      return `${diffDay} 天前`;
    }
    if (diffDay < 365) {
      const months = Math.floor(diffDay / 30);
      return `${months} 个月前`;
    }
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function formatDateTime(timestamp: number | string): string {
  if (!timestamp) return '';
  try {
    const d = new Date(
      typeof timestamp === 'number' ? timestamp : Number(timestamp) || timestamp
    );
    if (isNaN(d.getTime())) return String(timestamp);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hour}:${min}`;
  } catch {
    return String(timestamp);
  }
}
