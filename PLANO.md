# 📱 Meu Pet — Plano do MVP
> App para centralizar os cuidados do Theo e da Chloe (ração, vacinas, banhos), transformando tudo em alertas acionáveis para você e o Thiago.

## 1. Decisões

| Tema | Decisão |
|---|---|
| Quem usa | Você e o Thiago — cada um com sua própria conta, mas acesso compartilhado aos dados dos mesmos pets (Theo e Chloe). O app também suporta outras "casas" totalmente separadas (ex: uma amiga com o pet dela), cada uma vendo só os próprios dados |
| Login | Sim, mas só entra na fase final (Supabase) — até lá, o app funciona local, para você testar e ajustar rápido |
| Casas e convites | Cada pessoa pertence a uma "casa" só. Quem cria a casa pode gerar um link de convite (sem prazo de validade, mas de uso único) e mandar manualmente (WhatsApp etc.) para outro morador entrar e passar a acessar/editar os dados dos mesmos pets da casa |
| Dispositivo principal | Celular (mobile-first) — o app precisa ser rápido de usar no dia a dia, tipo "acabei de comprar ração, já registro" |
| Dados | Local (localStorage) durante a construção; banco de dados de verdade (Supabase) só na fase final |
| Anexos (receita da consulta) | Por enquanto ficam guardados junto do registro, embutidos como arquivo local; na Fase Final passam a ficar no Supabase Storage, referenciados na tabela de Consultas |
| Identidade visual | Inspirada na imagem de referência (`telas do app.PNG`): fundo em tom pêssego/creme, cards brancos com cantos bem arredondados, botões pretos em pílula com ícone de patinha, tags coloridas em pastel para informações rápidas |
| Paleta proposta | Fundo creme/pêssego (`#FBEAE0` / `#F7DCC5`), texto carvão (`#2B2320`), botões pretos (`#1E1B18`), acento Theo em terracota (`#E8A15D`), acento Chloe em lilás suave (`#B7A6E0`), tags pastel (lilás, amarelo, verde-menta) |
| Fonte | Arredondada e amiga, mas não infantil — **Baloo 2** para títulos, **Nunito** para textos (em vez de Comic Sans, que passa uma imagem mais informal do que o resto do visual pede) |
| Referência de layout | `telas do app.PNG` — cards com foto grande do pet, botão de pílula preto, tags pastel de informação rápida, navegação inferior |

## 2. Telas do app

| Tela | O que você faz nela |
|---|---|
| **Dashboard (Visão Geral)** | Abre o app e já vê os alertas e próximos cuidados — alterna entre "Casa" (visão geral), Theo e Chloe |
| **Perfil do Pet** | Foto, nome, raça, idade de cada gato |
| **Ração & Areia** | Registra compras (marca, submarca, preço, local de compra) e quando cada uma acaba de verdade — com esse histórico, o app aprende sozinho quanto tempo costuma durar e avisa quando está acabando |
| **Vacinas & Saúde** | Histórico de vacinas e consultas veterinárias, próximas doses/consultas, alerta quando estiver chegando a data |
| **Banhos** | Histórico de banhos e alerta de quando o próximo está previsto |

## 3. O diferencial (detalhado)

**Centralizar o histórico e os próximos cuidados de cada pet, transformando essas informações em alertas e lembretes acionáveis.**

O Dashboard é o coração do app: ele junta o que está registrado em Ração & Areia, Vacinas & Saúde e Banhos, e monta uma **lista de alertas ordenada por urgência** — por exemplo:
- 🔴 "Ração do Theo acaba em 2 dias"
- 🟡 "Vacina da Chloe prevista para daqui 1 semana"
- 🟢 "Banho do Theo previsto para o fim de semana"

Cada alerta é clicável e leva direto para a tela/registro relacionado. A pessoa consegue alternar entre a visão "Casa" (tudo junto) e a visão de cada pet individualmente.

## 4. O que o app guarda

```
Pet: nome, raça, data de nascimento (ou idade aproximada), foto

Compra de Ração/Areia: tipo (ração ou areia), marca, submarca/linha,
  preço pago, local da compra, data da compra, data em que acabou
  (preenchida depois, quando acaba de verdade)
  (compartilhada entre os pets da casa)

  A duração e a data prevista para acabar não são digitadas — o app
  calcula sozinho, com base na média das durações reais já registradas
  (prioriza histórico da mesma marca/submarca; sem histórico nenhum,
  ainda não arrisca uma previsão)

Vacina: pet, nome da vacina, data realizada, próxima dose prevista
  (opcional), observações

Consulta veterinária: pet, motivo/descrição, data da consulta,
  clínica, profissional, especialidade, se tem retorno agendado
  (e a data, se tiver), observações, anexo da receita (foto ou PDF,
  opcional)

Banho: pet, data do banho, próxima data prevista
```

Cada registro de Vacina/Consulta e de Banho pertence a um pet específico (Theo ou Chloe). A Compra de Ração/Areia é da casa (compartilhada entre os dois).

## 5. Fases de construção

| Fase | O que entrega | Quando |
|---|---|---|
| [x] **0. Setup + preview duplo** | Projeto rodando no navegador, mobile-first, com a identidade visual (paleta pêssego/creme, fonte Baloo 2 + Nunito) e uma tela de preview mostrando o app duas vezes lado a lado (celular + computador) | Aula 2 |
| [x] **1. Core — Dashboard + Perfis** | Cadastro do Theo e da Chloe, Dashboard com a central de alertas (mesmo que vazia no início), navegação entre Casa/Theo/Chloe | Aula 2 |
| [x] **2. Ração & Areia** | Registrar compras, calcular duração, alertas de "está acabando" no Dashboard | Aula 2 / dever de casa |
| [x] **3. Vacinas & Saúde** | Histórico de vacinas (nome, data, próxima dose) e consultas (clínica, profissional, especialidade, retorno, anexo da receita), alertas no Dashboard | Dever de casa |
| [x] **4. Banhos** | Histórico de banhos, próxima data prevista, alertas no Dashboard | Dever de casa |
| [~] **Final. Publicar** | Supabase — banco de dados organizado por "casa" (cada casa com seus próprios pets e dados, sem uma casa ver a outra), contas separadas para você e o Thiago com acesso compartilhado à mesma casa, sistema de convite por link para adicionar morador a uma casa ✅ pronto e testado — falta: deploy na Vercel + instalar como PWA no celular | Aula 3 |

## 6. Versão 2 (fica pra depois)

- Insights de IA mais elaborados (ex: sugestões automáticas baseadas no histórico)
- Integração com Google Agenda
- Notificações push/e-mail (por enquanto os alertas aparecem só dentro do app)
- Outros pets/perfis além do Theo e da Chloe
