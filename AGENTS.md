## Instruções do Agente

### Antes de escrever qualquer código

Leia obrigatoriamente os documentos em docs/agent/ na seguinte ordem:

1. docs/agent/geral.md      — visão geral, fluxo de dados e escopo
2. docs/agent/database.md   — schema, modelos e regras de persistência
3. docs/agent/typings.md    — interfaces e tipos compartilhados entre camadas
4. docs/agent/backend.md    — arquitetura, endpoints e regras de negócio
5. docs/agent/frontend.md   — funcionalidades, componentes e comportamento da UI
6. docs/agent/requisitos.md — requisitos funcionais e não funcionais

Não inicie a implementação sem ter lido todos os documentos acima.

### Restrições globais

- Nenhum arquivo dentro de frontend/ pode referenciar arquivos fora de frontend/
- Nenhum arquivo dentro de backend/ pode referenciar arquivos fora de backend/
- Nenhum arquivo dentro de database/ pode referenciar arquivos fora de database/
- TypeScript sem erros de compilação em frontend e backend