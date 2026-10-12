import "../../css/avatar.css";

// Fixed palette so the same person always gets the same colour
const AVATAR_COLORS = [
  "#3f3d9e", // indigo
  "#8b5cf6", // purple
  "#22b8f5", // cyan
  "#11cc82", // green
  "#fe814d", // orange
  "#f8488e", // pink
  "#2a9d8f", // teal
  "#6d597a", // dusty purple
];

const getInitials = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
};

const getColor = (name) => {
  const key = String(name || "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const Avatar = ({ name, size = 24, className = "", title }) => (
  <span
    className={`zen-avatar ${className}`}
    title={title ?? (name || "Unassigned")}
    style={{
      width: size,
      height: size,
      fontSize: Math.round(size * 0.42),
      backgroundColor: name ? getColor(name) : "#adb5bd",
    }}
  >
    {getInitials(name)}
  </span>
);

export default Avatar;
