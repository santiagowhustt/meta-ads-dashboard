export default function MetricCard({ label, value, subtext = null, color = null, icon = null }) {
  return (
    <div
      style={{
        backgroundColor: "#1a1d27",
        border: "1px solid #262a38",
        borderRadius: 12,
        padding: "18px 20px",
        minWidth: 150,
        flex: "1 1 150px",
      }}
    >
      <div
        style={{
          color: "#9ca3af",
          fontSize: 12.5,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.4,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div
        style={{
          color: color || "#f3f4f6",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {subtext && (
        <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
