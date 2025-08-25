// src/utils/format-date.ts
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) {
    return 'Invalid date';
  }

  let parsed: Date;
  if (typeof date === 'string') {
    parsed = new Date(date);
  } else if (date instanceof Date) {
    parsed = date;
  } else {
    return 'Invalid date';
  }

  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid date';
  }

  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default formatDate;
