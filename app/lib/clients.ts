export interface Client {
  name: string;
  accountId: string; // formato: act_ + o ID da conta de anúncios do Meta
}

export const clients: Client[] = [
  { name: "Anderson Zat", accountId: "act_1209746600428777" },
  { name: "Perondi", accountId: "act_629418268865871" },
];
