@AGENTS.md

# SmartFrota — Rodrigo Tintas

Sistema de controle de frota e rotas de entrega para a empresa Rodrigo Tintas.
App mobile-first (PWA-like) rodando em tablets/celulares dos motoristas.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| Linguagem | TypeScript 5 |
| Banco de dados | PostgreSQL (Neon) — Prisma 7 + `@prisma/adapter-pg` |
| Deploy | Vercel |
| Estilização | Tailwind CSS 4 |
| Fonte | Geist Sans (Google Fonts) |
| Runtime | Node.js (Server Actions — sem API routes) |

---

## Estrutura de Arquivos

```
smartfrota/
├── app/
│   ├── layout.tsx                   # Root layout: fonte Geist, zoom bloqueado (mobile)
│   ├── page.tsx                     # Redireciona para /login
│   ├── globals.css
│   ├── favicon.ico
│   │
│   ├── login/                       # Login com CPF + PIN
│   │   ├── page.tsx
│   │   └── LoginForm.tsx
│   │
│   ├── signup/                      # Cadastro de motorista (sem seleção de veículo)
│   │   ├── page.tsx
│   │   └── SignupForm.tsx
│   │
│   ├── driver/                      # Área do motorista (role = DRIVER)
│   │   ├── page.tsx                 # Dashboard: viagem ativa ou botão "NOVA SAÍDA"
│   │   ├── LogoutButton.tsx
│   │   ├── start-trip/
│   │   │   ├── page.tsx             # Busca TODOS os veículos ativos para o motorista escolher
│   │   │   └── StartTripForm.tsx    # Seleciona veículo, km inicial, pedidos
│   │   ├── active-trip/
│   │   │   ├── page.tsx             # Exibe rota em andamento (suporta IN_PROGRESS e RETURNING)
│   │   │   ├── StopControls.tsx     # Controles dinâmicos: entregas → retorno → chegada na loja
│   │   │   └── CancelTripButton.tsx
│   │   └── history/
│   │       └── page.tsx             # Histórico de rotas do motorista logado
│   │
│   ├── admin/                       # Área do admin (role = ADMIN)
│   │   ├── page.tsx                 # Dashboard: links para as 3 seções
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   └── TripsClient.tsx      # 3 abas: Rotas, Por Motorista, Por Veículo — filtros + export CSV
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── CreateDriverForm.tsx # Cadastra motorista (nome, CPF, PIN) — sem seleção de veículo
│   │   │   └── DriverRow.tsx        # Editar PIN, excluir motorista (sem vínculo de veículo)
│   │   └── vehicles/
│   │       ├── page.tsx
│   │       ├── CreateVehicleForm.tsx
│   │       └── VehicleRow.tsx       # Editar KM, ativar/desativar, excluir veículo
│   │
│   ├── actions/                     # Server Actions (toda a lógica de negócio)
│   │   ├── auth.ts                  # loginAction, signupAction, logoutAction, getSession
│   │   ├── trip.ts                  # startTripAction, startStopAction, endStopAction,
│   │   │                            # startReturnToStoreAction, finalizeReturnAction, cancelTripAction
│   │   ├── vehicles.ts              # createVehicleAction, updateVehicleKmAction, toggleVehicleAction, deleteVehicleAction
│   │   └── users.ts                 # createDriverAction, updateDriverPinAction, deleteDriverAction
│   │
│   └── generated/prisma/            # Cliente Prisma gerado (não editar manualmente)
│
├── lib/
│   └── prisma.ts                    # Singleton do PrismaClient com adapter PrismaPg (PostgreSQL)
│
├── prisma/
│   ├── schema.prisma                # Schema: User, Vehicle, Trip, TripStop
│   ├── seed.ts                      # Seed inicial (admin + 4 veículos reais)
│   ├── migrations/                  # Histórico de migrations SQL
│   └── dev.db                       # Banco SQLite local (legado — não usado em produção)
│
├── prisma.config.ts                 # Config do Prisma 7 (schema path, migrations path, dotenv override)
├── next.config.ts                   # serverExternalPackages para Prisma + Vercel
├── tsconfig.json
├── postcss.config.mjs
└── .env                             # DATABASE_URL para o prisma.config.ts
```

---

## Banco de Dados — Schema Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  cpf       String   @unique   // login — apenas dígitos, 11 chars
  pin       String             // senha de 4 dígitos (plain text)
  role      String   @default("DRIVER")  // "ADMIN" | "DRIVER"
  trips     Trip[]
  createdAt DateTime @default(now())
  // NOTA: vehicleId foi removido (migration 20260424) —
  // o veículo é escolhido pelo motorista a cada Nova Saída
}

model Vehicle {
  id         String  @id @default(cuid())
  plate      String  @unique
  model      String
  current_km Int               // atualizado ao finalizar cada rota
  isActive   Boolean @default(true)
  trips      Trip[]
}

model Trip {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(...)
  vehicleId   String
  vehicle     Vehicle    @relation(...)
  start_km    Int
  start_time  DateTime   @default(now())   // gerado no servidor
  end_km      Int?
  end_time    DateTime?                    // gerado no servidor ao finalizar
  orders      String                       // ex: "104010, 104063"
  totalSteps  Int        @default(1)       // qtd de pedidos (paradas)
  currentStep Int        @default(0)       // parada atual; 0 = nenhuma iniciada
  status      String     @default("IN_PROGRESS")
  // status: "IN_PROGRESS" | "RETURNING" | "COMPLETED" | "CANCELLED"
  createdAt   DateTime   @default(now())
  stops       TripStop[]
}

model TripStop {
  id         String    @id @default(cuid())
  tripId     String
  trip       Trip      @relation(...)
  stepNumber Int                               // 1-based
  start_time DateTime  @default(now())
  end_time   DateTime?
  status     String    @default("IN_PROGRESS") // "IN_PROGRESS" | "COMPLETED"
}
```

---

## Autenticação

- **Sem JWT / NextAuth.** Usa cookies HttpOnly simples (`userId`, `userRole`).
- Login: CPF (11 dígitos, sem formatação) + PIN (4 dígitos).
- `getSession()` em `app/actions/auth.ts` lê o cookie e retorna o `User` do banco.
- Proteção de rotas: cada page/action verifica `getSession()` ou o cookie diretamente.
- Admins → `/admin`, Drivers → `/driver`. Redirecionamento feito no servidor.

---

## Fluxo Completo de uma Rota

```
[Nova Saída]
  → motorista escolhe veículo (todos os ativos), informa KM inicial e pedidos
  → Trip criada com status = "IN_PROGRESS"

[Entregas sequenciais] (para cada parada de 1 a totalSteps)
  → INICIAR ENTREGA N/N   → startStopAction  → cria TripStop
  → FINALIZAR ENTREGA N/N → endStopAction    → encerra TripStop

[Após última entrega concluída]
  → botão "INICIAR ROTA PARA A LOJA"
  → startReturnToStoreAction → Trip.status = "RETURNING"

[Chegada na loja]
  → botão "CHEGUEI NA LOJA" → modal pede KM Final
  → finalizeReturnAction → valida end_km > start_km
  → Trip.status = "COMPLETED", Vehicle.current_km = end_km (transação)

[Cancelamento]
  → cancelTripAction → Trip.status = "CANCELLED" (disponível em qualquer etapa)
```

---

## Regras de Negócio

- Motorista só pode ter **uma rota ativa** (`IN_PROGRESS` ou `RETURNING`) por vez.
- `start_time` e `end_time` são gerados **no servidor** — o motorista não controla o horário.
- `end_km` é informado apenas na **chegada à loja** (status `RETURNING` → `COMPLETED`), não por entrega.
- `end_km` deve ser **maior** que `start_km` (validado em `finalizeReturnAction`).
- `Vehicle.current_km` é atualizado **somente** ao finalizar a rota completa (`finalizeReturnAction`).
- Paradas são sequenciais: não é possível iniciar a parada N+1 sem finalizar a parada N.
- `Trip.totalSteps` é calculado automaticamente a partir da contagem de pedidos (split por vírgula).
- `Trip.currentStep` = 0 quando nenhuma parada foi iniciada; incrementa a cada `startStopAction`.
- Veículo **não é vinculado ao motorista** — qualquer motorista pode usar qualquer veículo ativo a cada saída.
- Veículo com rota ativa não pode ser excluído.
- Motorista com rota ativa não pode ser excluído.
- Admin não pode ser excluído via `deleteDriverAction`.

---

## Dados de Seed (`npm run seed`)

Cria apenas admin e veículos (sem motoristas — os motoristas reais são cadastrados pelo admin).

| Role | Nome | CPF | PIN |
|------|------|-----|-----|
| ADMIN | Rodrigo Admin | 000.000.000-00 | 0000 |

| Placa | Modelo |
|-------|--------|
| RBT3D08 | Saveiro |
| PQW5544 | Volkswagen UP |
| RCI2J62 | Moto |
| PRA4J55 | Moto |

---

## Comandos

```bash
npm run dev               # Inicia servidor de desenvolvimento
npm run build             # Build de produção
npm run seed              # Popula o banco com admin + veículos (requer DATABASE_URL no .env)
npx prisma migrate deploy # Aplica migrations no banco de produção (Neon)
npx prisma generate       # Regenera o client Prisma
npx tsx --env-file=.env prisma/list-users.ts   # Lista todos os usuários do banco
npx tsx --env-file=.env prisma/reset-drivers.ts # Remove todos os drivers e viagens (irreversível)
```

---

## Variáveis de Ambiente

| Variável | Descrição | Onde configurar |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL do Neon | `.env` local + Vercel → Settings → Environment Variables (marcar como **Sensitive**) |

Formato: `postgresql://user:password@host/dbname?sslmode=require`

---

## Detalhes de Configuração do Prisma 7

- O client é gerado em `app/generated/prisma/` (não no padrão `node_modules/@prisma/client`).
- **Sem `url` no schema** — Prisma 7 breaking change: o campo `url` foi removido do bloco `datasource`. A URL é passada exclusivamente via adapter no runtime.
- O singleton em `lib/prisma.ts` usa `PrismaPg` (`@prisma/adapter-pg`) como adapter, lendo `DATABASE_URL` da variável de ambiente.
- `prisma.config.ts` carrega o `.env` com `dotenv` + `override: true` para sobrescrever qualquer variável cacheada no terminal.
- `next.config.ts` define `serverExternalPackages: ["@prisma/client", "prisma"]` para compatibilidade com o bundler do Next.js em ambiente serverless (Vercel).
- O seed usa `tsx --env-file=.env` (flag nativa do Node.js 22) para garantir que `DATABASE_URL` esteja disponível antes dos `import`s serem resolvidos.
- `prisma migrate dev` requer TTY interativo — em ambientes não-interativos, criar a migration SQL manualmente e usar `prisma migrate deploy`.

---

## Convenções de UI

- App **mobile-first**: botões com `minHeight: 56px`, fonte grande, alto contraste.
- Zoom de duplo toque bloqueado via `viewport` no `layout.tsx` (`maximumScale: 1, userScalable: false`).
- Botões de ação fixados no rodapé (`fixed bottom-0`) nas telas do motorista.
- Paleta principal: azul (`blue-700`) para ações primárias, laranja (`orange-500`) para retorno, vermelho (`red-600`) para finalizar entrega, verde (`green-700`) para chegada na loja.
- Sem biblioteca de componentes externa — tudo em Tailwind puro.
- Inputs de texto sempre com `text-gray-900` explícito para evitar herança de cor branca.
