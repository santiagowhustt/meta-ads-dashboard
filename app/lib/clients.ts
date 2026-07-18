export interface Client {
  name: string;
  accountId: string; // formato: act_XXXXXXXXXX
}

// Edite esta lista com os clientes reais.
// O accountId deve estar no formato "act_" + o ID da conta de anúncios do Meta.
export const clients: Client[] = [
  { name: "Cliente Exemplo 1", accountId: "act_000000000000001" },
  { name: "Cliente Exemplo 2", accountId: "act_000000000000002" },
];
