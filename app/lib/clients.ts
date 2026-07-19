export interface Client {
  name: string;
  accountId: string; // formato: act_ + o ID da conta de anúncios do Meta
}

export const clients: Client[] = [
  { name: "Anderson Zat", accountId: "act_1209746600428777" },
  { name: "Perondi", accountId: "act_629418268865871" },
  { name: "7Agro", accountId: "act_2868078256818568" },
  { name: "00 - DeuLaudo", accountId: "act_1474628546706407" },
  { name: "Dr. Daniel", accountId: "act_738786292616470" },
  { name: "CDI Umuarama", accountId: "act_2006105313532606" },
  { name: "Cleiton Pooter - By Hp", accountId: "act_1113307093299103" },
  { name: "Conexão Diagnóstica", accountId: "act_2357713678085694" },
  { name: "Dr Eduardo", accountId: "act_883147101200876" },
  { name: "Hotel Tirolesa", accountId: "act_1436531086924036" },
  { name: "MedImpulso", accountId: "act_1621014168932865" },
  { name: "SC Massagem", accountId: "act_356484881871886" },
];
