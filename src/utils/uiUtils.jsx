// export const getPriorityBorder = (priority) => {
//   switch (priority?.toLowerCase()) {
//     case "high":
//       return "border-dange bg-red";
//     case "medium":
//       return "border-warnin bg-yellow";
//     case "low":
//       return "border-succes bg-green";
//     default:
//       return "border-dar bg-secondary-subtl";
//   }
// };

export const getPriorityBorder = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return " bg-red";
    case "medium":
      return " bg-yellow";
    case "low":
      return " bg-green";
    default:
      return "border-dar bg-secondary-subtl";
  }
};


//leave status badge
export const getStatusBadge = (status) => {
    const base = "badge px-3 py-2 fw-medium";

    switch (status) {
      case "Approved":
        return <span className={`${base} bg-approved text-success`}>● Approved</span>;
      case "Rejected":
        return <span className={`${base} bg-danger-subtle text-danger`}>● Declined</span>;
      case "Revoked":
        return <span className={`${base} bg-primary-subtle text-primary`}>● Revoked</span>;
      case "Converted":
        return <span className={`${base} bg-info-subtle text-info`}>● Converted</span>;
      case "Cancelled":
        return <span className={`${base} bg-secondary-subtle text-secondary`}>● Cancelled</span>;
      case "Pending":
        return <span className={`${base} bg-warning-subtle text-warning`}>● Pending</span>;
      default:
        return <span className={`${base} bg-warning-subtle text-warning`}>● Pending</span>;
    }
  };