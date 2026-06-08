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

### Planejamento obrigatório antes de implementar

Se a tarefa solicitada envolver criação ou modificação de código, siga este protocolo antes de escrever qualquer linha:

1. **Elabore um plano de implementação** detalhando:
   - Quais arquivos serão criados ou modificados
   - O que será feito em cada arquivo (sem código, apenas descrição)
   - A ordem de execução das mudanças
   - Dependências entre etapas (ex: "o passo 3 depende do passo 1 estar concluído")

2. **Apresente o plano ao usuário** e aguarde aprovação explícita antes de prosseguir.

3. **Só inicie a implementação após receber confirmação.** Se o usuário solicitar ajustes no plano, revise e apresente novamente antes de codificar.

Tarefas puramente de leitura, análise ou resposta a perguntas não requerem planejamento prévio.

### Restrições globais

- Nenhum arquivo dentro de frontend/ pode referenciar arquivos fora de frontend/
- Nenhum arquivo dentro de backend/ pode referenciar arquivos fora de backend/
- Nenhum arquivo dentro de database/ pode referenciar arquivos fora de database/
- TypeScript sem erros de compilação em frontend e backend