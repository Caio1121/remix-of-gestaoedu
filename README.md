# EduFlow — Sistema de Gestão Educacional

> Plataforma SaaS para gestão acadêmica com painéis para **Alunos**, **Professores** e **Gestores**.  
> Construído com React + TypeScript + Supabase.

---

## Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Começar](#como-começar)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Arquitetura](#arquitetura)
- [Referência de Hooks](#referência-de-hooks)
- [Sistema de Papéis](#sistema-de-papéis)
- [Casos de Borda e Comportamentos Conhecidos](#casos-de-borda-e-comportamentos-conhecidos)
- [Como Contribuir](#como-contribuir)

---

## Visão Geral

EduFlow é um sistema de gestão educacional multi-papel. Cada usuário autenticado recebe um dos três papéis — **aluno**, **docente** ou **gestor** — e é redirecionado para o painel correspondente após o login.

| Papel   | Rota do painel | Acesso |
|---------|----------------|--------|
| aluno   | `/aluno`       | Notas, financeiro, frequência, materiais, documentos |
| docente | `/docente`     | Turmas, lançamento de notas, frequência, conteúdo |
| gestor  | `/gestor`      | KPIs, usuários, relatórios, comunicados, financeiro |

---

## Tecnologias

| Camada      | Tecnologia                                            |
|-------------|-------------------------------------------------------|
| Frontend    | React 18, TypeScript, Vite                            |
| Estilização | Tailwind CSS, shadcn/ui                               |
| Estado      | TanStack Query v5                                     |
| Backend     | Supabase (Auth, Postgres, Storage, Edge Functions)    |
| Formulários | React Hook Form + Zod                                 |
| Gráficos    | Recharts                                              |
| Testes      | Vitest + Testing Library                              |
| Auth (MFA)  | Supabase TOTP (Google Authenticator / Authy)          |

---

## Estrutura do Projeto
src/
├── components/
│ ├── chat/
│ │ └── AdminChat.tsx # Mensagens em tempo real entre papéis
│ ├── manager/
│ │ ├── ManagerHome.tsx # Painel executivo de KPIs
│ │ ├── ManagerAcademic.tsx # Desempenho acadêmico
│ │ ├── ManagerFinancial.tsx # Receita e inadimplência
│ │ ├── ManagerUsers.tsx # Criação e gestão de usuários
│ │ ├── ManagerReports.tsx # Relatórios BI com gráficos
│ │ └── ManagerAnnouncements.tsx
│ ├── student/
│ │ ├── StudentHome.tsx
│ │ ├── StudentGrades.tsx
│ │ ├── StudentFinancial.tsx
│ │ ├── StudentAttendance.tsx
│ │ ├── StudentMaterials.tsx
│ │ ├── StudentDocuments.tsx
│ │ ├── StudentIDCard.tsx
│ │ └── StudentNotices.tsx
│ ├── teacher/
│ │ ├── TeacherClasses.tsx # Orquestrador do grid de turmas
│ │ ├── CreateClassModal.tsx # Modal isolado de criação (v4)
│ │ ├── ClassCard.tsx # Card apresentacional de turma (v4)
│ │ ├── TeacherHome.tsx
│ │ ├── TeacherGrades.tsx
│ │ ├── TeacherAttendance.tsx
│ │ └── TeacherContent.tsx
│ └── ui/ # Primitivos shadcn/ui
│
├── contexts/
│ └── AuthContext.tsx # Estado de autenticação + detecção de papel
│
├── hooks/
│ ├── useProfile.ts # Perfil do usuário atual + todos alunos/professores
│ ├── useManagerData.ts # KPIs, gráfico de receita, desempenho por curso
│ ├── useTeacherData.ts # Turmas do professor + alunos com notas
│ ├── useStudentData.ts # Notas, financeiro, frequência, materiais
│ ├── useAnnouncements.ts # Leitura e criação de comunicados
│ ├── useClassActions.ts # createClass, createUser, uploadMaterial, upsertGrades
│ ├── usePayment.ts # Geração de cobrança PIX + boleto via Asaas
│ ├── useCreateClassForm.ts # Estado do formulário + lógica de submit
│ ├── useChat.ts # Mensagens de chat em tempo real
│ ├── useGrades.ts # Notas do aluno (standalone)
│ └── useDashboardData.ts # Barrel de re-exportação (compatibilidade)
│
├── integrations/supabase/
│ ├── client.ts # Instância do cliente Supabase
│ └── types.ts # Tipos gerados automaticamente do banco
│
├── pages/
│ ├── Index.tsx # Login + seletor de papel
│ ├── StudentDashboard.tsx
│ ├── TeacherDashboard.tsx
│ ├── ManagerDashboard.tsx
│ ├── MfaSetup.tsx # Configuração TOTP (obrigatório para gestor/docente)
│ └── MfaChallenge.tsx # Verificação TOTP no login
│
├── types/
│ └── index.ts # Tipos de domínio compartilhados
│
└── supabase/
├── functions/
│ ├── create-user/ # Edge Function: gestor cria usuários
│ └── create-asaas-charge/ # Edge Function: PIX/boleto via Asaas
├── migrations/
│ └── 20240430000000_initial_schema.sql
└── setup/
└── supabase.sql # Script consolidado completo (v3.3)

---

## Como Começar

### Pré-requisitos

- Node.js >= 18
- npm >= 9
- Conta Supabase com projeto criado

### 1. Clonar e instalar

```bash
git clone <SUA_URL_GIT>
cd <nome-do-projeto>
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com suas credenciais do Supabase.

### 3. Configurar o banco de dados

```bash
# Opção A — Supabase CLI
supabase db push

# Opção B — Painel do Supabase
# Cole o conteúdo de supabase/setup/supabase.sql no editor SQL e execute
```

### 4. Deploy das Edge Functions

```bash
supabase functions deploy create-user
supabase functions deploy create-asaas-charge
```

---

### Testando Edge Functions Localmente

Para debugar as funções sem fazer deploy, use o servidor local do Supabase CLI:

#### 1. Criar arquivo de variáveis locais

```bash
# Na raiz do projeto
touch supabase/functions/.env.local
```

```env
# supabase/functions/.env.local
ASAAS_API_KEY=seu-api-key-sandbox
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

#### 2. Iniciar o servidor de funções

```bash
supabase functions serve --env-file supabase/functions/.env.local
# Funções disponíveis em http://localhost:54321/functions/v1/
```

#### 3. Testar `create-user`

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/create-user' \
  --header 'Authorization: Bearer SEU_TOKEN_JWT_AQUI' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "teste@escola.com",
    "fullname": "Aluno Teste",
    "role": "aluno"
  }'
```

> Para obter o token JWT, faça login no app e copie o valor de
> `supabase.auth.getSession()` → `session.access_token`

#### 4. Testar `create-asaas-charge`

```bash
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/create-asaas-charge' \
  --header 'Authorization: Bearer SEU_TOKEN_JWT_AQUI' \
  --header 'Content-Type: application/json' \
  --data '{
    "amount": 100.00,
    "description": "Mensalidade Teste",
    "studentId": "uuid-do-aluno",
    "studentEmail": "aluno@teste.com",
    "studentName": "Aluno Teste",
    "studentCpf": "000.000.000-00"
  }'
```

#### 5. Ver logs em tempo real

```bash
# Em outro terminal, enquanto o servidor está rodando
supabase functions logs create-user --scroll
supabase functions logs create-asaas-charge --scroll
```

> **Atenção:** O arquivo `.env.local` contém chaves sensíveis.
> Certifique-se de que está no `.gitignore`:
> ```
> supabase/functions/.env.local
> ```

### 5. Iniciar servidor de desenvolvimento

```bash
npm run dev
# Aplicação disponível em http://localhost:5173
```

> Um desenvolvedor novo consegue fazer login e ver os três painéis em menos de 5 minutos.

---

## Variáveis de Ambiente

```env
# Supabase — lado do cliente (prefixo VITE_)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

> `ASAAS_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são **somente servidor**.  
> Nunca exponha no frontend. Configure como secrets das Edge Functions:

```bash
supabase secrets set ASAAS_API_KEY=sua-chave-asaas
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

---

## Configuração do Banco de Dados

O schema completo está em `supabase/setup/supabase.sql` (v3.3).  
É **idempotente** — seguro para executar múltiplas vezes em bancos existentes.

### Tabelas principais

| Tabela              | Descrição                                              |
|---------------------|--------------------------------------------------------|
| `profiles`          | Estende `auth.users` com papel + carteirinha           |
| `classes`           | Turmas do professor com matéria/horário/sala           |
| `enrollments`       | Relação muitos-para-muitos aluno ↔ turma               |
| `grades`            | Notas por aluno por turma (av1, av2, av3)              |
| `attendance`        | Registros de frequência por aluno por turma            |
| `financialrecords`  | Mensalidades por aluno                                 |
| `materials`         | Conteúdo de aula (PDF, vídeo, link, slide)             |
| `announcements`     | Comunicados segmentados por papel                      |
| `chatmessages`      | Mensagens diretas entre usuários                       |
| `studentdocuments`  | Documentos privados do aluno                           |
| `auditlog`          | Trilha de auditoria de ações                           |

### Buckets de Storage

| Bucket              | Público | Uso                              |
|---------------------|---------|----------------------------------|
| `materials`         | ✅ Sim  | Arquivos de conteúdo das aulas   |
| `student-documents` | ❌ Não  | Documentos privados dos alunos   |

### Resumo das políticas RLS

- Alunos veem apenas seus próprios dados (notas, frequência, financeiro, documentos)
- Professores e gestores gerenciam turmas e materiais
- Apenas gestores criam usuários (via Edge Function com service role key)
- Comunicados filtrados por `targetrole` (`aluno | docente | gestor | todos`)
- Mensagens visíveis apenas para remetente e destinatário

---

## Arquitetura

### Separação de domínios nos hooks

Após o refactor v4, `useDashboardData.ts` é apenas um **barrel de re-exportação**.  
Em código novo, importe diretamente dos hooks de domínio:

```ts
// ✅ Preferido para código novo
import { useTeacherClasses } from '@/hooks/useTeacherData';
import { useCreateClass } from '@/hooks/useClassActions';

// ✅ Também válido — compatibilidade retroativa garantida
import { useTeacherClasses, useCreateClass } from '@/hooks/useDashboardData';
```

### Domínios dos hooks

| Arquivo               | Responsabilidade                                        |
|-----------------------|---------------------------------------------------------|
| `useProfile.ts`       | Perfil do usuário, todos os alunos, todos os professores |
| `useManagerData.ts`   | KPIs, gráfico de receita, desempenho por curso          |
| `useTeacherData.ts`   | Turmas do professor, alunos da turma (notas+frequência) |
| `useStudentData.ts`   | Notas, financeiro, frequência, materiais do aluno       |
| `useAnnouncements.ts` | Leitura e criação de comunicados                        |
| `useClassActions.ts`  | createClass, createUser, uploadMaterial, upsertGrades   |
| `usePayment.ts`       | Geração de cobrança PIX + boleto via Asaas              |

### Padrão de responsabilidade dos componentes
Página (TeacherDashboard.tsx)
└── Orquestrador (TeacherClasses.tsx) ← estado: apenas isModalOpen
├── CreateClassModal.tsx ← só UI, delega ao hook
│ └── useCreateClassForm.ts ← estado do form + lógica de submit
└── ClassCard.tsx ← puramente apresentacional, sem estado

---

## Referência de Hooks

### `useProfile()`

Retorna o perfil do usuário autenticado.

```ts
const { data: profile, isLoading } = useProfile();

profile.id            // UUID
profile.fullname      // string | null
profile.role          // 'aluno' | 'docente' | 'gestor'
profile.studentcardid // string | null (número da carteirinha)
```

---

### `useAllStudents()`

Retorna todos os usuários com papel `aluno`, ordenados por nome.

```ts
const { data: alunos } = useAllStudents();
// alunos[].id, .fullname, .studentcardid, .role
```

---

### `useTeacherClasses(teacherId?)`

Retorna todas as turmas do professor. Não executa a query se `teacherId` for undefined.

```ts
const { data: turmas } = useTeacherClasses(profile?.id);

turmas[].id       // UUID
turmas[].name     // 'Turma ADM-4A'
turmas[].period   // '2025.1'
turmas[].subject  // string | null
turmas[].schedule // string | null
turmas[].room     // string | null
```

---

### `useClassStudents(classId?)`

Retorna os alunos matriculados em uma turma, com notas e percentual de frequência.

```ts
const { data: alunos } = useClassStudents(turmaSelecionadaId);

alunos[].id         // UUID
alunos[].name       // string
alunos[].matricula  // string ('S/M' como fallback se nulo)
alunos[].av1        // number | null
alunos[].av2        // number | null
alunos[].av3        // number | null
alunos[].attendance // number (0-100, percentual de presença)
```

---

### `useCreateClass()`

Mutação para criar uma nova turma. Define `teacherid` automaticamente pela sessão atual.

```ts
const criarTurma = useCreateClass();

await criarTurma.mutateAsync({
  name: 'Turma ADM-4A',        // obrigatório
  period: '2025.1',             // obrigatório
  subject: 'Adm. Financeira',   // opcional
  schedule: 'Seg/Qua 19h-21h', // opcional
  room: 'Sala 204-B',          // opcional
});
```

---

### `useUpsertGrades()`

Mutação para salvar/atualizar notas. Chave de conflito: `(studentid, classid)`.

```ts
const salvarNotas = useUpsertGrades();

await salvarNotas.mutateAsync([
  {
    studentid: 'uuid-aqui',
    classid: 'uuid-aqui',
    av1: 8.5,
    av2: 7.0,
    av3: null,
    gradevalue: 7.75, // passe null se nem todas as AVs estiverem preenchidas
  },
]);
// Seguro para chamar múltiplas vezes — upsert com chave composta
```

---

### `useManagerData()`

Retorna KPIs agregados. Executa 6 queries paralelas no Supabase via `Promise.all`.

```ts
const { data: kpis } = useManagerData();

kpis.totalStudents    // number — total de alunos
kpis.totalTeachers    // number — total de professores
kpis.totalClasses     // number — total de turmas
kpis.attendanceRate   // number (0-100%) — taxa de presença
kpis.approvalRate     // number (0-100%) — taxa de aprovação
kpis.absenteeismRate  // number (0-100%) — taxa de absenteísmo
kpis.revenueMonth     // number (R$ — soma das mensalidades pagas)
kpis.revenueDefault   // number (% de inadimplência)
```

---

### `useRevenueData()`

Retorna dados mensais de receita para o gráfico.

```ts
const { data: receita } = useRevenueData();

receita[].month          // 'Jan' | 'Fev' | ... | 'Dez'
receita[].receita        // number (R$ pagos)
receita[].inadimplencia  // number (R$ em aberto)
```

---

### `useGeneratePayment()`

Chama a Edge Function `create-asaas-charge`. Retorna dados de PIX ou boleto.

```ts
const gerarPagamento = useGeneratePayment();

const resultado = await gerarPagamento.mutateAsync({
  amount: 850.00,
  description: 'Mensalidade Escolar - Ref abc123',
  studentProfile: profile,
});

resultado.pixqrcode    // string — código PIX copia e cola
resultado.piximageurl  // string — URL da imagem do QR Code
resultado.boletourl    // string — URL do PDF do boleto
resultado.invoiceUrl   // string — URL da fatura no Asaas
resultado.billingType  // 'PIX' | 'BOLETO'
```

---

### `useCreateUser()`

Chama a Edge Function `create-user`. **Requer papel gestor.**  
O Supabase envia e-mail de recuperação de senha automaticamente para o novo usuário.

```ts
const criarUsuario = useCreateUser();

await criarUsuario.mutateAsync({
  email: 'aluno@escola.com',
  fullname: 'João Silva',
  role: 'aluno', // 'aluno' | 'docente' | 'gestor'
});
```

---

### `useAnnouncements(role?)`

Retorna comunicados filtrados pelo papel do usuário.

```ts
// Retorna comunicados onde targetrole = 'docente' OU targetrole = 'todos'
const { data: avisos } = useAnnouncements('docente');

avisos[].id         // UUID
avisos[].title      // string
avisos[].content    // string
avisos[].targetrole // 'aluno' | 'docente' | 'gestor' | 'todos'
avisos[].category   // string | null
avisos[].priority   // string | null
avisos[].createdat  // string ISO
```

---

### `useUploadMaterial()`

Mutação para publicar um material em uma turma.

```ts
const publicarMaterial = useUploadMaterial();

await publicarMaterial.mutateAsync({
  classid: 'uuid-aqui',
  title: 'Aula 13 - Amortização',
  description: 'Conceitos de amortização de dívida', // opcional
  materialtype: 'pdf', // 'pdf' | 'video' | 'link' | 'slide'
  contenturl: 'https://storage.url/arquivo.pdf',
});
```

---

### `useAttendance(studentId?)`

Retorna o histórico de frequência do aluno.

```ts
const { data: frequencia } = useAttendance(profile?.id);

frequencia[].date      // string de data ISO
frequencia[].status    // 'presente' | 'ausente' | 'justificado'
frequencia[].classid   // UUID | null
frequencia[].studentid // UUID | null
```

---

### `useFinancial(studentId?)`

Retorna o histórico financeiro do aluno.

```ts
const { data: pagamentos } = useFinancial(profile?.id);

pagamentos[].id          // UUID
pagamentos[].duedate     // string de data ISO (vencimento)
pagamentos[].amount      // number | null
pagamentos[].ispaid      // boolean | null
pagamentos[].invoiceurl  // string | null

---

## Sistema de Papéis

Papéis armazenados em `profiles.role` como enum Postgres: `aluno | docente | gestor`.

### Fluxo de login
Index.tsx (página de login)
└── AuthContext detecta o papel na tabela profiles
├── papel === 'aluno' → /aluno
├── papel === 'docente' → verificação MFA → /docente
└── papel === 'gestor' → verificação MFA → /gestor

### Diagrama de Fluxo — Login, MFA e Redirecionamento

```mermaid
flowchart TD
    A([Usuário acessa a aplicação]) --> B[Index.tsx\nPágina de Login]
    B --> C{Credenciais válidas?}
    C -- Não --> B
    C -- Sim --> D[AuthContext\nBusca perfil na tabela profiles]
    D --> E{Qual é o papel?}

    E -- aluno --> F[Redireciona para /aluno]
    F --> G([StudentDashboard])

    E -- docente --> H{MFA configurado?}
    E -- gestor --> H

    H -- Não --> I[Redireciona para /mfa-setup\nConfigurar Google Authenticator]
    I --> J[Usuário escaneia QR Code\ne confirma código de 6 dígitos]
    J --> K[MFA ativado no Supabase]
    K --> L[Redireciona para /mfa-challenge]

    H -- Sim --> L[/mfa-challenge\nDigitar código TOTP]
    L --> M{Código válido?}
    M -- Não --> L
    M -- Sim --> N{Qual é o papel?}

    N -- docente --> O([TeacherDashboard])
    N -- gestor --> P([ManagerDashboard])

    style A fill:#4ade80,color:#000
    style G fill:#60a5fa,color:#000
    style O fill:#f59e0b,color:#000
    style P fill:#8b5cf6,color:#fff
```


### MFA (Autenticação de Dois Fatores)

MFA por TOTP é **obrigatório** para `gestor` e `docente`.

- Primeiro login → `/mfa-setup` → escanear QR Code com Google Authenticator ou Authy
- Logins seguintes → `/mfa-challenge` → digitar código de 6 dígitos

### Uso do ProtectedRoute

```tsx
<ProtectedRoute requiredRole="gestor">
  <ManagerDashboard />
</ProtectedRoute>
// Exibe spinner enquanto verifica
// Redireciona para "/" se o papel não corresponder
```

---

## Casos de Borda e Comportamentos Conhecidos

### Notas

| Situação | Comportamento |
|----------|---------------|
| Todas as AVs preenchidas | `gradevalue` = média de av1, av2, av3 |
| Apenas algumas AVs preenchidas | Média calculada apenas com os valores preenchidos |
| Nenhuma AV preenchida | `gradevalue = null`, status = "Em curso" |
| `gradevalue >= 6` | Status = "Aprovado" |
| `gradevalue < 6` | Status = "Reprovado" |
| Input inválido (NaN) | `getFinal()` retorna a string `"Inválido"` |

---

### Frequência

- Coluna `ispresent` (boolean) está **depreciada** — use a coluna `status`
- Valores válidos de `status`: `presente | ausente | justificado`
- O script de migração corrige linhas antigas onde `ispresent = false` E `status = 'presente'`
- Frequência abaixo de **75%** exibe alerta "Risco de reprovação" no painel do aluno

---

### Financeiro / Pagamentos

- `useGeneratePayment` aponta para o **sandbox** do Asaas por padrão
- Para trocar para produção, altere a URL em `supabase/functions/create-asaas-charge/index.ts`:

```ts
// sandbox (padrão)
const ASAAS_URL = 'https://sandbox.asaas.com/api/v3'
// produção
const ASAAS_URL = 'https://api.asaas.com/api/v3'
```

- `studentCpf` está fixo como `'000.000.000-00'` — **substitua antes de ir para produção**
- Detecção de atraso: `!isPaid && new Date(duedate) < new Date()`

---

### Documentos do Aluno

- Bucket `student-documents` é **privado** — nenhuma URL pública é gerada
- Arquivos armazenados no caminho `{userId}/{timestamp}{nomeOriginal}`
- Links de download são URLs assinadas válidas por **5 minutos**
- Limite de tamanho: **10 MB**
- Tipos MIME aceitos: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`
- Em caso de falha no insert do banco: o arquivo no storage é removido automaticamente (rollback)

---

### Comunicados

- `targetrole = 'todos'` → visível para todos os papéis
- Filtro aplicado no banco: `.or('targetrole.eq.X,targetrole.eq.todos')`
- Sem `role` passado para `useAnnouncements()` → retorna todos (caso de uso do gestor)

---

### Barrel useDashboardData

- Após o refactor v4, `useDashboardData.ts` é apenas um **barrel de re-exportação**
- Todos os imports existentes continuam funcionando sem alteração
- Código novo deve importar diretamente dos hooks de domínio
- O barrel só deve ser **deletado** após todos os imports diretos serem migrados

---

### Bug useProfile (corrigido na v4)

```ts
// ❌ Antes — executava no momento do import, fora do contexto React
export const useProfile = useQuery({ ... })

// ✅ Depois — padrão correto de hook
export const useProfile = () => useQuery({ ... })
```

---

## Como Contribuir

### Nomenclatura de branches
feat/ nova funcionalidade
fix/ correção de bug
refactor/ melhoria estrutural sem mudança de comportamento
docs/ somente documentação
chore/ configuração, dependências, tooling

text

### Convenção de commits
feat: adicionar exportação de boletim em PDF
fix: corrigir cálculo de frequência para alunos sem registros
refactor: separar useDashboardData em hooks por domínio
docs: adicionar referência de hooks no README
chore: atualizar tanstack-query para v5.83.0

text

### Antes de abrir um PR

```bash
npm run lint    # ESLint
npm run test    # Vitest
npm run build   # Compilação TypeScript + build Vite
```

### Adicionando um novo hook

1. Criar `src/hooks/use<Dominio>.ts`
2. Exportar apenas funções nomeadas — nunca exportações default
3. Sempre envolver com `() =>` — nunca chamar hooks no nível do módulo
4. Adicionar re-exportação no barrel `useDashboardData.ts`
5. Documentar neste README na seção Referência de Hooks

### Adicionando um novo painel de papel

1. Criar `src/pages/<Papel>Dashboard.tsx`
2. Adicionar rota em `src/App.tsx` envolta em `<ProtectedRoute requiredRole="papel">`
3. Adicionar papel ao enum `userrole` em `supabase/setup/supabase.sql`
4. Adicionar políticas RLS para o novo papel no mesmo arquivo SQL

---

## Scripts

```bash
npm run dev        # Servidor de desenvolvimento (localhost:5173)
npm run build      # Build de produção
npm run build:dev  # Build de desenvolvimento
npm run preview    # Preview do build de produção localmente
npm run lint       # ESLint
npm run test       # Vitest (execução única)
npm run test:watch # Vitest (modo watch)
```

---

## Licença

Privado — EduFlow. Todos os direitos reservados.