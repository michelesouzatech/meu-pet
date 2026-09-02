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
| **Casa (tela de entrada)** | Abre o app e já vê os alertas, e os pets lado a lado numa grade compacta (foto, nome, sexo, idade). Clicar num pet — pelo card da grade ou pelo botão dele no seletor do topo — leva pro perfil completo |
| **Perfil do Pet** | Foto grande, nome, e um resumo em cápsula com sexo, raça, idade, status da próxima vacina e do próximo banho; cards de resumo de saúde (próxima vacina/consulta, última consulta), acompanhamento de peso (registro e histórico) e plano de saúde, além de um campo livre "Sobre o pet" |
| **Ração & Higiene** | Registra compras (marca, submarca, preço, local de compra) e quando cada uma acaba de verdade — com esse histórico, o app aprende sozinho quanto tempo costuma durar e avisa quando está acabando. Dá pra editar ou excluir qualquer item cadastrado errado |
| **Vacinas & Saúde** | Organizada em 3 sub-abas por pet: **Vacinas**, **Consultas** e **Plano de saúde**. Histórico de vacinas (com opção "necessário repetir dose?" — se "não", não entra mais em atraso) e consultas, com edição e exclusão de qualquer registro; cadastro do plano de saúde (nome, nº da carteirinha, anexo da carteirinha, link do portal); resumo de saúde e do plano no Perfil do Pet |
| **Banhos** | Histórico de banhos e alerta de quando o próximo está previsto; como Theo e Chloe tomam banho juntos, dá pra selecionar os dois de uma vez ao registrar |

## 3. O diferencial (detalhado)

**Centralizar o histórico e os próximos cuidados de cada pet, transformando essas informações em alertas e lembretes acionáveis.**

O Dashboard é o coração do app: ele junta o que está registrado em Ração & Higiene, Vacinas & Saúde e Banhos, e monta uma **lista de alertas ordenada por urgência** — por exemplo:
- 🔴 "Ração do Theo acaba em 2 dias"
- 🟡 "Vacina da Chloe prevista para daqui 1 semana"
- 🟢 "Banho do Theo previsto para o fim de semana"

Cada alerta é clicável e leva direto para a tela/registro relacionado. A pessoa consegue alternar entre a visão "Casa" (tudo junto) e a visão de cada pet individualmente.

## 4. O que o app guarda

```
Pet: nome, raça, data de nascimento (ou idade aproximada), foto,
  sexo (fêmea/macho), texto livre "sobre o pet"

Compra de Ração/Higiene: tipo (ração ou higiene), marca, submarca/linha,
  preço pago, local da compra, data da compra, data em que acabou
  (preenchida depois, quando acaba de verdade)
  (compartilhada entre os pets da casa; qualquer item pode ser
  editado ou excluído depois de cadastrado)

  A duração e a data prevista para acabar não são digitadas — o app
  calcula sozinho, com base na média das durações reais já registradas
  (prioriza histórico da mesma marca/submarca; sem histórico nenhum,
  ainda não arrisca uma previsão)

Vacina: pet, nome da vacina, data realizada, próxima dose prevista
  (opcional), necessário repetir dose (sim/não — se "não", não entra
  em atraso no resumo), observações. Editável e excluível pelo
  histórico

Consulta veterinária: pet, motivo/descrição, data da consulta,
  clínica, profissional, especialidade, se tem retorno agendado
  (e a data, se tiver), observações, anexo da receita (foto ou PDF,
  opcional). Editável e excluível pelo histórico

Peso: pet, data, valor — registro e histórico por pet, direto no
  Perfil

Plano de saúde: pet, nome do plano, nº da carteirinha, anexo da
  carteirinha (foto ou PDF), link do site/portal do plano — um
  cadastro por pet, com resumo no Perfil

Banho: pet, data do banho, próxima data prevista
  (o registro pode ser feito pra vários pets de uma vez, quando
  tomam banho juntos — vira um registro por pet)
```

Cada registro de Vacina/Consulta e de Banho pertence a um pet específico (Theo ou Chloe), mesmo quando cadastrado para os dois ao mesmo tempo (caso do banho). A Compra de Ração/Higiene é da casa (compartilhada entre os dois).

## 5. Fases de construção

| Fase | O que entrega | Quando |
|---|---|---|
| [x] **0. Setup + preview duplo** | Projeto rodando no navegador, mobile-first, com a identidade visual (paleta pêssego/creme, fonte Baloo 2 + Nunito) e uma tela de preview mostrando o app duas vezes lado a lado (celular + computador) | Aula 2 |
| [x] **1. Core — Dashboard + Perfis** | Cadastro do Theo e da Chloe, Dashboard com a central de alertas (mesmo que vazia no início), navegação entre Casa/Theo/Chloe | Aula 2 |
| [x] **2. Ração & Areia** | Registrar compras, calcular duração, alertas de "está acabando" no Dashboard | Aula 2 / dever de casa |
| [x] **3. Vacinas & Saúde** | Histórico de vacinas (nome, data, próxima dose) e consultas (clínica, profissional, especialidade, retorno, anexo da receita), alertas no Dashboard | Dever de casa |
| [x] **4. Banhos** | Histórico de banhos, próxima data prevista, alertas no Dashboard | Dever de casa |
| [x] **Final. Publicar** | Supabase — banco de dados organizado por "casa" (cada casa com seus próprios pets e dados, sem uma casa ver a outra), contas separadas para você e o Thiago com acesso compartilhado à mesma casa, sistema de convite por link para adicionar morador a uma casa. Deploy no ar na Vercel, com favicon e ícone de "adicionar à tela inicial" do celular (a patinha) | Aula 3 |
| [x] **5. Refinamentos de interface** | Tela "Casa" como entrada padrão, com os pets lado a lado em cards compactos e perfil completo por pet (foto, sexo, raça, idade, status de vacina/banho, campo "sobre o pet"); "Areia" renomeada para "Higiene" com ícone próprio; edição e exclusão de compras cadastradas; registro de banho para vários pets de uma vez | Pós-lançamento |
| [x] **6. Saúde completa** | Tela "Vacinas & Saúde" reorganizada em 3 sub-abas (vacinas / consultas / plano de saúde); edição e exclusão de vacinas e consultas no histórico; campo "necessário repetir dose?" nas vacinas; resumo de saúde no Perfil do Pet com atalho pro histórico completo; registro e acompanhamento de peso no Perfil; cadastro de plano de saúde (nome, carteirinha, anexo, link) com resumo no Perfil | Pós-lançamento |

## 6. Versão 2 (fica pra depois)

- Insights de IA mais elaborados (ex: sugestões automáticas baseadas no histórico)
- Integração com Google Agenda
- Notificações push/e-mail (por enquanto os alertas aparecem só dentro do app)
- Outros pets/perfis além do Theo e da Chloe
