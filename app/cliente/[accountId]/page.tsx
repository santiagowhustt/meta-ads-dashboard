"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDecimal,
  getActionValue,
  getCostPerAction,
  getVideoActionValue,
  CONVERSATION_ACTION_TYPE,
  LEAD_ACTION_TYPE,
} from "@/app/lib/formatters";
import { clients } from "@/app/lib/clients";

const PERIOD_OPTIONS = [
  { value: "last_7d", label: "Últimos 7 dias" },
  { value: "last_14d", label: "Últimos 14 dias" },
  { value: "last_30d", label: "Últimos 30 dias" },
  { value: "this_month", label: "Este mês" },
  { value: "last_month", label: "Mês passado" },
  { value: "custom", label: "Personalizado" },
];

const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#262a38",
  accent: "#6366f1",
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
  textMuted: "#9ca3af",
  textDim: "#6b7280",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#f3f4f6",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        margin: "36px 0 14px",
      }}
    >
      {children}
    </h2>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      {children}
    </div>
  );
}

function FunnelBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: COLORS.textMuted,
          marginBottom: 6,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#f3f4f6", fontWeight: 600 }}>
          {formatNumber(value)}
        </span>
      </div>
      <div
        style={{
          backgroundColor: "#0f1117",
          borderRadius: 8,
          height: 14,
          overflow: "hidden",
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 8,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function VideoRetentionBars({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const maxValue = Math.max(...values, 1);
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        height: 140,
        padding: "12px 4px 0",
      }}
    >
      {labels.map((label, i) => {
        const v = values[i] || 0;
        const heightPct = maxValue > 0 ? Math.max((v / maxValue) * 100, 3) : 3;
        return (
          <div
            key={label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              height: "100%",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#f3f4f6",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {formatNumber(v)}
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: 46,
                height: `${heightPct}%`,
                backgroundColor: COLORS.accent,
                borderRadius: "6px 6px 0 0",
                minHeight: 4,
              }}
            />
            <div
              style={{
                fontSize: 11.5,
                color: COLORS.textDim,
                marginTop: 8,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        backgroundColor: "#2a1418",
        border: `1px solid ${COLORS.red}`,
        color: "#fca5a5",
        borderRadius: 10,
        padding: "14px 16px",
        fontSize: 13.5,
        marginBottom: 20,
      }}
    >
      {message}
    </div>
  );
}

interface AccountInsights {
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  cpm?: string;
  clicks?: string;
  inline_link_clicks?: string;
  ctr?: string;
  actions?: { action_type: string; value: string }[];
  cost_per_action_type?: { action_type: string; value: string }[];
  video_p25_watched_actions?: { action_type: string; value: string }[];
  video_p50_watched_actions?: { action_type: string; value: string }[];
  video_p75_watched_actions?: { action_type: string; value: string }[];
  video_p95_watched_actions?: { action_type: string; value: string }[];
  video_thruplay_watched_actions?: { action_type: string; value: string }[];
}

interface AdsetItem {
  id?: string;
  name: string;
  status: string;
  insights?: { data: AccountInsights[] };
}

interface AdItem {
  id?: string;
  name: string;
  status: string;
  creative?: { thumbnail_url?: string };
  insights?: { data: AccountInsights[] };
}

export default function ClienteDashboard({
  params,
}: {
  params: { accountId: string };
}) {
  const { accountId } = params;
  const client = clients.find((c) => c.accountId === accountId);

  const [period, setPeriod] = useState("last_30d");
  const [customSince, setCustomSince] = useState("");
  const [customUntil, setCustomUntil] = useState("");

  const [overview, setOverview] = useState<AccountInsights | null>(null);
  const [adsets, setAdsets] = useState<AdsetItem[]>([]);
  const [ads, setAds] = useState<AdItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const qs = new URLSearchParams();
    qs.set("accountId", accountId);
    qs.set("period", period);
    if (period === "custom") {
      qs.set("since", customSince);
      qs.set("until", customUntil);
    }
    return qs.toString();
  }, [accountId, period, customSince, customUntil]);

  const loadData = useCallback(async () => {
    if (period === "custom" && (!customSince || !customUntil)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery();
      const [overviewRes, adsetsRes, adsRes] = await Promise.all([
        fetch(`/api/meta?${qs}`),
        fetch(`/api/meta/adsets?${qs}`),
        fetch(`/api/meta/ads?${qs}`),
      ]);

      const overviewData = await overviewRes.json();
      const adsetsData = await adsetsRes.json();
      const adsData = await adsRes.json();

      if (overviewData.error) throw new Error(overviewData.error);
      if (adsetsData.error) throw new Error(adsetsData.error);
      if (adsData.error) throw new Error(adsData.error);

      setOverview(overviewData);
      setAdsets(Array.isArray(adsetsData) ? adsetsData : []);
      setAds(Array.isArray(adsData) ? adsData : []);
    } catch (err: any) {
      setError(err?.message || "Erro ao carregar dados do Meta.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery, period, customSince, customUntil]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleApplyCustom = () => {
    if (customSince && customUntil) {
      loadData();
    }
  };

  const spend = Number(overview?.spend) || 0;
  const impressions = Number(overview?.impressions) || 0;
  const reach = Number(overview?.reach) || 0;
  const frequency = Number(overview?.frequency) || 0;
  const cpm = Number(overview?.cpm) || 0;
  const clicks = Number(overview?.clicks) || 0;
  const linkClicks = Number(overview?.inline_link_clicks) || 0;
  const ctr = Number(overview?.ctr) || 0;

  const conversations = getActionValue(
    overview?.actions,
    CONVERSATION_ACTION_TYPE
  );
  const costPerConversation = getCostPerAction(
    overview?.cost_per_action_type,
    CONVERSATION_ACTION_TYPE
  );
  const leads = getActionValue(overview?.actions, LEAD_ACTION_TYPE);
  const costPerLead = getCostPerAction(
    overview?.cost_per_action_type,
    LEAD_ACTION_TYPE
  );

  const totalEngagement = clicks + conversations + leads;

  const videoP25 = getVideoActionValue(overview?.video_p25_watched_actions);
  const videoP50 = getVideoActionValue(overview?.video_p50_watched_actions);
  const videoP75 = getVideoActionValue(overview?.video_p75_watched_actions);
  const videoP95 = getVideoActionValue(overview?.video_p95_watched_actions);
  const videoThruplay = getVideoActionValue(
    overview?.video_thruplay_watched_actions
  );

  const funnelMax = Math.max(impressions, 1);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>
      <Link
        href="/"
        style={{
          color: COLORS.textMuted,
          fontSize: 13.5,
          textDecoration: "none",
        }}
      >
        ← Voltar para clientes
      </Link>

      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "10px 0 4px" }}>
        {client?.name || accountId}
      </h1>
      <p style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 24 }}>
        {accountId}
      </p>

      {/* Filtros de período */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${
                period === opt.value ? COLORS.accent : COLORS.border
              }`,
              backgroundColor:
                period === opt.value ? COLORS.accent : COLORS.surface,
              color: period === opt.value ? "#fff" : COLORS.textMuted,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: period === opt.value ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginTop: 12,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: 13, color: COLORS.textMuted }}>
            De:{" "}
            <input
              type="date"
              value={customSince}
              onChange={(e) => setCustomSince(e.target.value)}
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                color: "#f3f4f6",
                padding: "6px 8px",
                marginLeft: 6,
              }}
            />
          </label>
          <label style={{ fontSize: 13, color: COLORS.textMuted }}>
            Até:{" "}
            <input
              type="date"
              value={customUntil}
              onChange={(e) => setCustomUntil(e.target.value)}
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                color: "#f3f4f6",
                padding: "6px 8px",
                marginLeft: 6,
              }}
            />
          </label>
          <button
            onClick={handleApplyCustom}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: COLORS.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Aplicar
          </button>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20 }}>
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <p style={{ color: COLORS.textDim, marginTop: 32 }}>Carregando dados...</p>
      ) : (
        <>
          {/* Funil de performance */}
          <SectionTitle>Funil de performance</SectionTitle>
          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <FunnelBar
              label="Impressões"
              value={impressions}
              maxValue={funnelMax}
              color={COLORS.accent}
            />
            <FunnelBar
              label="Cliques"
              value={clicks}
              maxValue={funnelMax}
              color={COLORS.accent}
            />
            <FunnelBar
              label="Conversas"
              value={conversations}
              maxValue={funnelMax}
              color={COLORS.yellow}
            />
            <FunnelBar
              label="Leads"
              value={leads}
              maxValue={funnelMax}
              color={COLORS.green}
            />
          </div>

          {/* Visão geral */}
          <SectionTitle>Visão geral</SectionTitle>
          <CardGrid>
            <MetricCard label="Investimento" value={formatCurrency(spend)} />
            <MetricCard label="Impressões" value={formatNumber(impressions)} />
            <MetricCard label="Alcance" value={formatNumber(reach)} />
            <MetricCard label="Frequência" value={formatDecimal(frequency)} />
            <MetricCard label="CPM" value={formatCurrency(cpm)} />
          </CardGrid>

          {/* Engajamento */}
          <SectionTitle>Engajamento</SectionTitle>
          <CardGrid>
            <MetricCard
              label="Cliques no link"
              value={formatNumber(linkClicks)}
            />
            <MetricCard label="CTR" value={formatPercent(ctr)} />
            <MetricCard label="Cliques totais" value={formatNumber(clicks)} />
          </CardGrid>

          {/* Retenção de vídeo */}
          <SectionTitle>Retenção de vídeo</SectionTitle>
          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <VideoRetentionBars
              labels={["25%", "50%", "75%", "95%", "ThruPlay"]}
              values={[videoP25, videoP50, videoP75, videoP95, videoThruplay]}
            />
          </div>

          {/* Meio de funil */}
          <SectionTitle>Meio de funil</SectionTitle>
          <CardGrid>
            <MetricCard
              label="Conversas iniciadas (WhatsApp)"
              value={formatNumber(conversations)}
              color={COLORS.yellow}
            />
            <MetricCard
              label="Custo por conversa"
              value={formatCurrency(costPerConversation)}
              color={COLORS.yellow}
            />
          </CardGrid>

          {/* Fundo de funil */}
          <SectionTitle>Fundo de funil</SectionTitle>
          <CardGrid>
            <MetricCard
              label="Leads gerados"
              value={formatNumber(leads)}
              color={COLORS.green}
            />
            <MetricCard
              label="Custo por lead"
              value={formatCurrency(costPerLead)}
              color={COLORS.green}
            />
            <MetricCard
              label="Engajamento total"
              value={formatNumber(totalEngagement)}
            />
          </CardGrid>

          {/* Tabela de conjuntos de anúncios ativos */}
          <SectionTitle>Conjuntos de anúncios ativos</SectionTitle>
          <div
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              overflow: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  {[
                    "Nome",
                    "Gasto",
                    "Impressões",
                    "Cliques",
                    "CTR",
                    "CPM",
                    "Conversas",
                    "Custo/Conversa",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        color: COLORS.textMuted,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adsets.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 20,
                        color: COLORS.textDim,
                        textAlign: "center",
                      }}
                    >
                      Nenhum conjunto de anúncios ativo encontrado.
                    </td>
                  </tr>
                )}
                {adsets.map((adset) => {
                  const insight = adset.insights?.data?.[0];
                  const aSpend = Number(insight?.spend) || 0;
                  const aImpressions = Number(insight?.impressions) || 0;
                  const aClicks = Number(insight?.clicks) || 0;
                  const aCtr = Number(insight?.ctr) || 0;
                  const aCpm = Number(insight?.cpm) || 0;
                  const aConversations = getActionValue(
                    insight?.actions,
                    CONVERSATION_ACTION_TYPE
                  );
                  const aCostPerConversation = getCostPerAction(
                    insight?.cost_per_action_type,
                    CONVERSATION_ACTION_TYPE
                  );
                  return (
                    <tr
                      key={adset.id || adset.name}
                      style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      <td style={{ padding: "12px 16px", color: "#f3f4f6" }}>
                        {adset.name}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {formatCurrency(aSpend)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {formatNumber(aImpressions)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {formatNumber(aClicks)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {formatPercent(aCtr)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {formatCurrency(aCpm)}
                      </td>
                      <td style={{ padding: "12px 16px", color: COLORS.yellow }}>
                        {formatNumber(aConversations)}
                      </td>
                      <td style={{ padding: "12px 16px", color: COLORS.yellow }}>
                        {formatCurrency(aCostPerConversation)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards de anúncios ativos */}
          <SectionTitle>Anúncios ativos</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {ads.length === 0 && (
              <p style={{ color: COLORS.textDim }}>
                Nenhum anúncio ativo encontrado.
              </p>
            )}
            {ads.map((ad) => {
              const insight = ad.insights?.data?.[0];
              const adSpend = Number(insight?.spend) || 0;
              const adImpressions = Number(insight?.impressions) || 0;
              const adClicks = Number(insight?.clicks) || 0;
              const adCtr = Number(insight?.ctr) || 0;
              const adConversations = getActionValue(
                insight?.actions,
                CONVERSATION_ACTION_TYPE
              );
              const adP25 = getVideoActionValue(insight?.video_p25_watched_actions);
              const adP50 = getVideoActionValue(insight?.video_p50_watched_actions);
              const adP75 = getVideoActionValue(insight?.video_p75_watched_actions);
              const adP95 = getVideoActionValue(insight?.video_p95_watched_actions);
              const adThruplay = getVideoActionValue(
                insight?.video_thruplay_watched_actions
              );
              const hasVideoData =
                adP25 + adP50 + adP75 + adP95 + adThruplay > 0;

              return (
                <div
                  key={ad.id || ad.name}
                  style={{
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 150,
                      backgroundColor: "#0f1117",
                      backgroundImage: ad.creative?.thumbnail_url
                        ? `url(${ad.creative.thumbnail_url})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.textDim,
                      fontSize: 12,
                    }}
                  >
                    {!ad.creative?.thumbnail_url && "Sem prévia"}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#f3f4f6",
                        marginBottom: 10,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={ad.name}
                    >
                      {ad.name}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        fontSize: 12.5,
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div style={{ color: COLORS.textDim }}>Gasto</div>
                        <div style={{ color: "#f3f4f6", fontWeight: 600 }}>
                          {formatCurrency(adSpend)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: COLORS.textDim }}>Impressões</div>
                        <div style={{ color: "#f3f4f6", fontWeight: 600 }}>
                          {formatNumber(adImpressions)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: COLORS.textDim }}>Cliques</div>
                        <div style={{ color: "#f3f4f6", fontWeight: 600 }}>
                          {formatNumber(adClicks)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: COLORS.textDim }}>CTR</div>
                        <div style={{ color: "#f3f4f6", fontWeight: 600 }}>
                          {formatPercent(adCtr)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: COLORS.textDim }}>Conversas</div>
                        <div style={{ color: COLORS.yellow, fontWeight: 600 }}>
                          {formatNumber(adConversations)}
                        </div>
                      </div>
                    </div>

                    {hasVideoData && (
                      <div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: COLORS.textDim,
                            textTransform: "uppercase",
                            marginBottom: 6,
                          }}
                        >
                          Retenção de vídeo
                        </div>
                        <VideoRetentionBars
                          labels={["25%", "50%", "75%", "95%", "TP"]}
                          values={[adP25, adP50, adP75, adP95, adThruplay]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
