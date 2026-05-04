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
