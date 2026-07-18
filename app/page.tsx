import Link from "next/link";
import { clients } from "@/app/lib/clients";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Dashboard de Meta Ads
      </h1>
      <p style={{ color: "#9ca3af", marginBottom: 32 }}>
        Selecione um cliente para ver o desempenho das campanhas
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {clients.map((client) => (
          <Link
            key={client.accountId}
            href={`/cliente/${client.accountId}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                backgroundColor: "#1a1d27",
                border: "1px solid #262a38",
                borderRadius: 14,
                padding: 24,
                transition: "border-color 0.15s ease",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 16,
                }}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ color: "#f3f4f6", fontSize: 16, fontWeight: 600 }}>
                {client.name}
              </div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                {client.accountId}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {clients.length === 0 && (
        <p style={{ color: "#6b7280" }}>
          Nenhum cliente cadastrado. Edite o arquivo app/lib/clients.ts.
        </p>
      )}
    </main>
  );
}
