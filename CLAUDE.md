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
| Banco de dados | SQLite — Prisma 7 + `better-sqlite3` |
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
│   ├── signup/                      # Cadastro de motorista + veículo
│   │   ├── page.tsx
│   │   └── SignupForm.tsx
│   │
│   ├── driver/                      # Área do motorista (role = DRIVER)
│   │   ├── page.tsx                 # Dashboard: viagem ativa ou botão "NOVA SAÍDA"
│   │   ├── LogoutButton.tsx
│   │   ├── start-trip/
│   │   │   ├── page.tsx
│   │   │   └── StartTripForm.tsx    # Seleciona veículo, km inicial, pedidos
│   │   ├── active-trip/
│   │   │   ├── page.tsx             # Exibe rota em andamento
│   │   │   └── EndTripModal.tsx     # Modal de finalização com km final
│   │   └── history/
│   │       └── page.tsx             # Histórico de rotas do motorista logado
│   │
│   ├── admin/                       # Área do admin (role = ADMIN)
│   │   ├── page.tsx                 # Dashboard: links para as 3 seções
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   └── TripsClient.tsx      # Listagem/filtro de todas as rotas
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── CreateDriverForm.tsx
│   │   │   └── DriverRow.tsx        # Editar PIN, vincular veículo, excluir motorista
│   │   └── vehicles/
│   │       ├── page.tsx
│   │       ├── CreateVehicleForm.tsx
│   │       └── VehicleRow.tsx       # Editar KM, ativar/desativar, excluir veículo
│   │
│   ├── actions/                     # Server Actions (toda a lógica de negócio)
│   │   ├── auth.ts                  # loginAction, signupAction, logoutAction, getSession
│   │   ├── trip.ts                  # startTripAction, endTripAction
│   │   ├── vehicles.ts              # createVehicleAction, updateVehicleKmAction, toggleVehicleAction, deleteVehicleAction
│   │   └── users.ts                 # createDriverAction, updateDriverPinAction, assignVehicleAction, deleteDriverAction
│   │
│   └── generated/prisma/            # Cliente Prisma gerado (não editar manualmente)
│
├── lib/
│   └── prisma.ts                    # Singleton do PrismaClient com adapter better-sqlite3
│
├── prisma/
│   ├── schema.prisma                # Schema: User, Vehicle, Trip
│   ├── seed.ts                      # Seed inicial (admin + 2 motoristas + 2 veículos)
│   ├── migrations/                  # Histórico de migrations SQL
│   └── dev.db                       # Banco SQLite (também existe em /dev.db na raiz)
│
├── prisma.config.ts                 # Config do Prisma 7 (schema path, migrations path)
├── next.config.ts
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
  vehicleId String?            // veículo padrão do motorista
  trips     Trip[]
  createdAt DateTime @default(now())
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
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(...)
  vehicleId  String
  vehicle    Vehicle  @relation(...)
  start_km   Int
  start_time DateTime @default(now())   // gerado no servidor
  end_km     Int?
  end_time   DateTime?                  // gerado no servidor ao finalizar
  orders     String                     // ex: "104010, 104063"
  status     String   @default("IN_PROGRESS")  // "IN_PROGRESS" | "COMPLETED"
  createdAt  DateTime @default(now())
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

## Regras de Negócio

- Motorista só pode ter **uma rota `IN_PROGRESS`** por vez.
- `start_time` e `end_time` são gerados **no servidor** — o motorista não controla o horário.
- `end_km` deve ser **maior** que `start_km`.
- Ao finalizar rota: atualiza `Trip` + `Vehicle.current_km` em uma **transação** Prisma.
- Veículo com rota ativa (`IN_PROGRESS`) não pode ser excluído.
- Motorista com rota ativa não pode ser excluído.
- Admin não pode ser excluído via `deleteDriverAction`.

---

## Dados de Seed (`npm run seed`)

| Role | Nome | CPF | PIN |
|------|------|-----|-----|
| ADMIN | Rodrigo Admin | 000.000.000-00 | 0000 |
| DRIVER | Carlos Silva | 111.111.111-11 | 1234 |
| DRIVER | João Pereira | 222.222.222-22 | 5678 |

| Placa | Modelo | KM inicial |
|-------|--------|-----------|
| ABC-1234 | Fiat Fiorino | 45.200 |
| DEF-5678 | VW Saveiro | 87.350 |

---

## Comandos

```bash
npm run dev       # Inicia servidor de desenvolvimento
npm run build     # Build de produção
npm run seed      # Popula o banco com dados iniciais
npx prisma migrate dev   # Cria/aplica migrations
npx prisma generate      # Regenera o client Prisma
```

---

## Detalhes de Configuração do Prisma 7

- O client é gerado em `app/generated/prisma/` (não no padrão `node_modules/@prisma/client`).
- O singleton em `lib/prisma.ts` usa `PrismaBetterSqlite3` como adapter e aponta para `dev.db` na raiz do projeto (`process.cwd()`).
- `prisma.config.ts` usa `DATABASE_URL` do `.env` apenas para migrations; o runtime usa o path absoluto via `path.resolve`.

---

## Convenções de UI

- App **mobile-first**: botões com `minHeight: 56px`, fonte grande, alto contraste.
- Zoom de duplo toque bloqueado via `viewport` no `layout.tsx` (`maximumScale: 1, userScalable: false`).
- Botões de ação fixados no rodapé (`fixed bottom-0`) nas telas do motorista.
- Paleta principal: azul (`blue-700`) para ações primárias, laranja (`orange-500`) para rota ativa.
- Sem biblioteca de componentes externa — tudo em Tailwind puro.
