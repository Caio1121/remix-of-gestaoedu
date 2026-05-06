# Lessons Learned - EduFlow

## Arquitetura & Performance
- **Otimização de Joins em Memória:** Ao lidar com múltiplas queries no frontend, usar `Map` para indexar dados por ID transforma buscas $O(n^2)$ em $O(n)$, essencial para escalabilidade.
- **Cache Inteligente:** O uso de `staleTime` no TanStack Query reduz drasticamente a carga no banco de dados para dados de baixa volatilidade (perfis, configurações).
- **Hooks de Fluxo:** Extrair lógica complexa (como o fluxo de login com MFA) de componentes de página para hooks customizados (`useLoginFlow`) melhora drasticamente a legibilidade e testabilidade.

## Segurança
- **Ambiente vs Código:** Credenciais e segredos NUNCA devem estar no código. O uso de arquivos `.env` aliado a um `.gitignore` rigoroso é a primeira linha de defesa.
- **MFA no Backend:** A lógica de MFA deve ser tratada como um fluxo de estado (AAL), garantindo que usuários com privilégios elevados passem por desafios adicionais antes de acessar dados sensíveis.

## Manutenibilidade
- **Convenção de Nomes:** Manter nomes de colunas do banco (snake_case vs camelCase) consistentes no frontend evita confusão. Optamos por `fullname` e `studentcardid` (lowercase sem sublinhado) para simplificar a interoperabilidade.
- **Explícito é Melhor que Implícito:** Substituir `select('*')` por campos explícitos reduz o payload da rede e documenta no código quais dados são realmente necessários.

## Refatoração Arquitetural & Serviços (V5)
- **Camada de Serviço (Abstração):** Desacoplar a lógica do Supabase dos componentes UI via `src/services/` isola as dependências e facilita testes unitários e futuras trocas de infraestrutura.
- **Single Source of Truth (Auth):** Centralizar a gestão de sessão e perfil no `AuthContext` elimina fetches redundantes e garante consistência de estado em múltiplos dashboards simultâneos.
- **Tratamento de Erros de Domínio:** Mapear códigos técnicos do banco (ex: PGRST116, 23505) para mensagens amigáveis em português (`errorHandler.ts`) profissionaliza a UX e simplifica o suporte.
- **Optimistic Updates:** Implementar atualizações otimistas no React Query (especialmente em lançamentos de notas/frequência) dá ao sistema uma sensação de "tempo real", eliminando a percepção de latência da rede.
- **Exclusão Segura:** Validar regras de negócio no nível de serviço (ex: impedir exclusão de turmas com alunos) evita erros de chave estrangeira (FK) e garante a integridade dos dados antes mesmo de atingir o banco.
- **Future-Proofing:** Ativar proativamente "future flags" de bibliotecas core (como React Router v7) evita o acúmulo de dívida técnica e torna migrações futuras triviais.
