export const getPriorityBorder = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "border-dange bg-red";
    case "medium":
      return "border-warnin bg-yellow";
    case "low":
      return "border-succes bg-green";
    default:
      return "border-dar bg-secondary-subtl";
  }
};