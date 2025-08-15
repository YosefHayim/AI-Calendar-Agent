const formatDate = (date: Date | string | null | undefined): string => {
  let parsedDate = new Date();

  if (!date) {
    return 'Invalid date';
  }
  if (typeof date === 'string') {
    parsedDate = new Date(date);
  } else if (!(date instanceof Date)) {
    return 'Invalid date';
  }
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }
  // Format the parsedDate to a readable string
  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default formatDate;
