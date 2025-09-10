// src/utils/format-date.ts
const formatDate = (date: Date | string | null | undefined, withTime = false, desiredLanguage = "he-IL"): string => {
  if (!date) {
    return "Invalid date";
  }

  let parsed: Date;
  if (typeof date === "string") {
    parsed = new Date(date);
  } else if (date instanceof Date) {
    parsed = date;
  } else {
    return "Invalid date";
  }

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  if (withTime) {
    return parsed.toLocaleDateString(desiredLanguage, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  return parsed.toLocaleDateString(desiredLanguage, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default formatDate;
