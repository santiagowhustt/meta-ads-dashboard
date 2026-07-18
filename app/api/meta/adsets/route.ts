import { NextRequest, NextResponse } from "next/server";
import {
  buildNestedInsightsField,
  getDateRangeParams,
  isCustomRangeIncomplete,
} from "@/app/lib/dateRange";

const GRAPH_VERSION = "v19.0";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json(
      { error: "O parâmetro accountId é obrigatório." },
      { status: 400 }
    );
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "META_ACCESS_TOKEN não está configurado no servidor." },
      { status: 500 }
    );
  }

  const range = getDateRangeParams(searchParams);
  if (isCustomRangeIncomplete(range)) {
    return NextResponse.json(
      { error: "Período personalizado requer 'since' e 'until'." },
      { status: 400 }
    );
  }

  const insightsFields = [
    "spend",
    "impressions",
    "clicks",
    "ctr",
    "cpm",
    "actions",
    "cost_per_action_type",
  ].join(",");

  const insightsParam = buildNestedInsightsField(range, insightsFields);
  const fields = `name,status,${insightsParam}`;

  // Filtra somente conjuntos de anúncios ativos
  const filtering = encodeURIComponent(
    JSON.stringify([
      { field: "effective_status", operator: "IN", value: ["ACTIVE"] },
    ])
  );

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${accountId}/adsets?fields=${fields}&filtering=${filtering}&limit=200&access_token=${token}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || "Erro ao consultar a API do Meta." },
        { status: 400 }
      );
    }

    return NextResponse.json(data.data || []);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro desconhecido ao buscar dados do Meta." },
      { status: 500 }
    );
  }
}
