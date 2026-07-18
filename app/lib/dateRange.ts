export type DateRange =
  | { type: "date_preset"; date_preset: string }
  | { type: "time_range"; time_range: { since: string | null; until: string | null } };

const PRESET_MAP: Record<string, string> = {
  last_7d: "last_7d",
  last_14d: "last_14d",
  last_30d: "last_30d",
  this_month: "this_month",
  last_month: "last_month",
};

// Lê o período escolhido pelo usuário a partir da query string da requisição
export function getDateRangeParams(searchParams: URLSearchParams): DateRange {
  const period = searchParams.get("period") || "last_30d";

  if (period === "custom") {
    return {
      type: "time_range",
      time_range: {
        since: searchParams.get("since"),
        until: searchParams.get("until"),
      },
    };
  }

  return {
    type: "date_preset",
    date_preset: PRESET_MAP[period] || "last_30d",
  };
}

// Monta o parâmetro de data para usar direto na URL de insights da conta
// Ex: &date_preset=last_7d  OU  &time_range={"since":"...","until":"..."}
export function buildAccountDateParam(range: DateRange): string {
  if (range.type === "date_preset") {
    return `&date_preset=${range.date_preset}`;
  }
  return `&time_range=${encodeURIComponent(
    JSON.stringify(range.time_range)
  )}`;
}

// Monta o campo de insights aninhado, usado dentro de adsets/ads
// Ex: insights.date_preset(last_7d){spend,impressions}
// Ex: insights.time_range({"since":"2026-07-01","until":"2026-07-15"}){spend,impressions}
export function buildNestedInsightsField(
  range: DateRange,
  fields: string
): string {
  if (range.type === "date_preset") {
    return `insights.date_preset(${range.date_preset}){${fields}}`;
  }
  const timeRangeJson = JSON.stringify(range.time_range);
  return `insights.time_range(${timeRangeJson}){${fields}}`;
}

export function isCustomRangeIncomplete(range: DateRange): boolean {
  return (
    range.type === "time_range" &&
    (!range.time_range.since || !range.time_range.until)
  );
}
