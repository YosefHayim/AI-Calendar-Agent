const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) {
    return 'Invalid date';
  }
  if (typeof date === 'string') {
    date = new Date(date);
  } else if (!(date instanceof Date)) {
    return 'Invalid date';
  }
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  // Format the date to a readable string
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default formatDate;
