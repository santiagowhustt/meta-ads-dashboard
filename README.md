# Dashboard de Meta Ads

Painel para acompanhar campanhas do Meta Ads (Facebook/Instagram), construído com Next.js 14.
Não usa banco de dados — os números vêm direto da API do Meta (Graph API) toda vez que a página carrega.

## Antes de começar: o que você precisa

1. **Uma conta de anúncios do Meta** (o "act_XXXXXXXXXX" que aparece no Gerenciador de Anúncios).
2. **Um token de acesso do Meta** com permissão para ler dados de anúncios (`ads_read`).
3. **Uma conta gratuita na Vercel** (vercel.com) — é onde o site vai ficar publicado.
4. **Uma conta no GitHub** — é como a Vercel vai pegar o seu código.

Você não precisa saber programar para colocar isso no ar. Siga o passo a passo abaixo.

---

## Passo 1 — Gerar o token de acesso do Meta

1. Acesse https://developers.facebook.com/ e crie um app (tipo "Business").
2. No app, vá em **Ferramentas > Graph API Explorer**.
3. Selecione o app criado, e em "Permissões", marque `ads_read` (e `ads_management` se quiser, mas `ads_read` já basta para o dashboard).
4. Gere um **token de usuário**. Esse token de teste expira rápido (1-2h), então para uso contínuo:
   - Vá em **Ferramentas > Configurações do App > Básico** e anote o **App ID** e o **App Secret**.
   - Use o token de curta duração para gerar um **token de longa duração** (60 dias) através do endpoint de troca de token do Meta, ou, melhor ainda, gere um **token de sistema (System User)** no Business Manager, que não expira. Essa é a opção recomendada para um dashboard em produção.
5. Guarde esse token — ele vai virar a variável `META_ACCESS_TOKEN`.

> Dica: se isso soar complicado, procure no Business Manager por "Usuários do sistema" (System Users), crie um, dê acesso às contas de anúncio que você quer monitorar, e gere um token para ele com a permissão `ads_read`. Esse token não expira sozinho.

## Passo 2 — Cadastrar seus clientes

Abra o arquivo `app/lib/clients.ts` e edite a lista com o nome e o ID de conta (`act_...`) de cada cliente:

```ts
export const clients: Client[] = [
  { name: "Loja da Maria", accountId: "act_1234567890123" },
  { name: "Clínica Bem Estar", accountId: "act_9876543210987" },
];
```

O `accountId` é o número da conta de anúncios, sempre com o prefixo `act_` na frente. Você encontra esse número no Gerenciador de Anúncios, no canto superior, ou na URL quando você está dentro de uma conta.

## Passo 3 — Testar no seu computador (opcional, mas recomendado)

Se quiser ver funcionando antes de publicar:

1. Instale o [Node.js](https://nodejs.org/) (versão 18 ou superior).
2. Abra uma pasta/terminal dentro do projeto e rode:
   ```
   npm install
   ```
3. Copie o arquivo `.env.local.example` para `.env.local` e cole seu token:
   ```
   META_ACCESS_TOKEN=seu_token_aqui
   ```
4. Rode:
   ```
   npm run dev
   ```
5. Abra `http://localhost:3000` no navegador.

## Passo 4 — Publicar na Vercel (o site fica "no ar")

1. Crie uma conta gratuita em https://github.com se ainda não tiver.
2. Crie um repositório novo no GitHub e suba os arquivos deste projeto para lá (pode arrastar os arquivos direto na interface do GitHub, em "uploading an existing file", se não souber usar Git).
3. Crie uma conta gratuita em https://vercel.com, usando login do GitHub.
4. Na Vercel, clique em **Add New > Project**, selecione o repositório que você acabou de criar.
5. Na tela de configuração, abra **Environment Variables** e adicione:
   - Nome: `META_ACCESS_TOKEN`
   - Valor: o seu token do Meta
6. Clique em **Deploy**. Em cerca de 1 minuto o site estará no ar, com uma URL tipo `seu-projeto.vercel.app`.

Pronto — esse link já é o seu dashboard funcionando, e qualquer atualização que você enviar ao GitHub será publicada automaticamente.

## Estrutura do projeto (para referência)

```
app/
  page.tsx                    -> tela inicial com lista de clientes
  cliente/[accountId]/page.tsx -> dashboard completo do cliente
  api/meta/route.ts           -> visão geral (insights da conta)
  api/meta/adsets/route.ts    -> conjuntos de anúncios ativos
  api/meta/ads/route.ts       -> anúncios ativos
  lib/clients.ts              -> lista de clientes (edite aqui)
  lib/formatters.ts           -> funções de formatação de números/moeda
  lib/dateRange.ts            -> lógica de período (7/14/30 dias, mês, personalizado)
components/
  MetricCard.jsx              -> card de métrica reutilizável
```

## Problemas comuns

- **"META_ACCESS_TOKEN não está configurado"**: você esqueceu de adicionar a variável de ambiente (local no `.env.local`, ou na Vercel em Settings > Environment Variables).
- **Erro vindo da API do Meta** (ex: "Invalid OAuth access token"): seu token expirou ou não tem a permissão `ads_read` para aquela conta. Gere um novo token de sistema.
- **Tabela de conjuntos/anúncios vazia**: pode não haver nenhum conjunto ou anúncio com status ATIVO na conta, ou o token não tem acesso àquela conta de anúncios especificamente (verifique se o usuário de sistema foi associado à conta correta no Business Manager).
- **Depois de mudar `app/lib/clients.ts` na Vercel, nada muda**: lembre de fazer commit/push do arquivo alterado para o GitHub — a Vercel só publica o que está no repositório.
