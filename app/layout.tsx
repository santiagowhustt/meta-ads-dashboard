import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Meta Ads",
  description: "Painel de acompanhamento de campanhas do Meta Ads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          backgroundColor: "#0f1117",
          color: "#f3f4f6",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
