// Tipos de ação usados pela API do Meta para identificar métricas específicas
export const CONVERSATION_ACTION_TYPE =
  "onsite_conversion.messaging_conversation_started_7d";
export const LEAD_ACTION_TYPE = "lead";

export interface MetaAction {
  action_type: string;
  value: string;
}

export function formatCurrency(value: number | undefined | null): string {
  const v = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function formatNumber(value: number | undefined | null): string {
  const v = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR").format(Math.round(v));
}

export function formatPercent(value: number | undefined | null): string {
  const v = Number(value) || 0;
  return `${v.toFixed(2)}%`;
}

export function formatDecimal(
  value: number | undefined | null,
  digits: number = 2
): string {
  const v = Number(value) || 0;
  return v.toFixed(digits);
}

// Busca o valor de uma action específica dentro do array "actions" retornado pelo Meta
export function getActionValue(
  actions: MetaAction[] | undefined | null,
  actionType: string
): number {
  if (!actions || !Array.isArray(actions)) return 0;
  const found = actions.find((a) => a.action_type === actionType);
  return found ? parseFloat(found.value) : 0;
}

// Busca o custo por ação específica dentro do array "cost_per_action_type"
export function getCostPerAction(
  costPerActionArr: MetaAction[] | undefined | null,
  actionType: string
): number {
  if (!costPerActionArr || !Array.isArray(costPerActionArr)) return 0;
  const found = costPerActionArr.find((a) => a.action_type === actionType);
  return found ? parseFloat(found.value) : 0;
}

// Soma o valor de vídeo assistido (os campos video_p25_watched_actions etc.
// vêm como array de actions, geralmente com action_type "video_view")
export function getVideoActionValue(
  videoActions: MetaAction[] | undefined | null
): number {
  if (!videoActions || !Array.isArray(videoActions) || videoActions.length === 0)
    return 0;
  return videoActions.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0);
}
