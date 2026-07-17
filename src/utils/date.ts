export function getBrasiliaDate(): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function getBrasiliaDateTime(): Date {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  return new Date(year, month, day, hour, minute, second);
}

export function getBrasiliaFirstDayOfMonth(): string {
  const bDate = getBrasiliaDateTime();
  const year = bDate.getFullYear();
  const month = String(bDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function formatBrasiliaDateTimeString(): string {
  const bDate = getBrasiliaDateTime();
  const day = String(bDate.getDate()).padStart(2, '0');
  const month = String(bDate.getMonth() + 1).padStart(2, '0');
  const year = bDate.getFullYear();
  const hours = String(bDate.getHours()).padStart(2, '0');
  const minutes = String(bDate.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}