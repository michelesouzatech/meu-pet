# 🚀 Meu Pet — Prompts prontos por fase

Cole o prompt da fase em que você está numa conversa com o Claude. Ele já vai ler o `PLANO.md` sozinho.

---

## Prompt — Fase 0: Setup + preview duplo + identidade visual

Leia o arquivo PLANO.md. Estou construindo o app Meu Pet: um app que centraliza os cuidados do Theo e da Chloe (ração, vacinas, banhos) e transforma tudo em alertas.

Agora vamos construir SÓ a Fase 0: o setup do projeto.

Nesta fase:
- Crie o projeto (mobile-first, rodando no navegador, sem banco de dados ainda — os dados vão ficar só na memória/local por enquanto, ainda nem tem telas de verdade).
- Aplique a identidade visual do PLANO.md: fundo creme/pêssego, cards brancos com cantos bem arredondados, botões pretos em formato de pílula com ícone de patinha, tags coloridas em pastel (lilás, amarelo, verde-menta), acento terracota para o Theo e lilás suave para a Chloe. Fonte Baloo 2 para títulos e Nunito para o texto (via Google Fonts).
- Crie uma tela de preview (`preview.html`) que mostra o app **duas vezes ao mesmo tempo, lado a lado**: à esquerda dentro de uma moldura de celular (~390px de largura, com cara de telefone), à direita em largura de computador. As duas metades devem ser `<iframe>` apontando para a URL do app rodando localmente (não cópias estáticas nem prints) — ou seja, o app de verdade, clicável, nos dois tamanhos ao mesmo tempo, atualizando sozinho a cada mudança.
- Faça uma tela inicial simples só para eu ver a identidade visual aplicada (ex: um cabeçalho "Meu Pet" e um card de exemplo) — sem funcionalidade ainda, isso vem na próxima fase.

Não faça ainda: telas de cadastro de pet, ração, vacinas, banhos, banco de dados, login. Isso vem nas próximas fases.

Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Abro o preview e vejo o app nas duas telas (celular e computador) ao mesmo tempo
- [ ] Consigo clicar dentro dos dois e funciona igual
- [ ] A cara do app já parece com a referência (cores, cantos arredondados, fonte)

---

## Prompt — Fase 1: Core (Dashboard + Perfis dos pets)

Leia o arquivo PLANO.md. Estou construindo o app Meu Pet. Já concluí a Fase 0 (setup + identidade visual + preview duplo).

Agora vamos construir SÓ a Fase 1: o core do app.

Nesta fase:
- Tela de Perfil do Pet: cadastro do Theo e da Chloe (nome, raça, idade aproximada, foto) — pode ser um cadastro simples, já vem os dois pré-cadastrados ou eu cadastro na hora, como fizer mais sentido.
- Dashboard: tela inicial com um jeito de alternar entre "Casa" (visão geral), Theo e Chloe. Por enquanto a lista de alertas pode aparecer vazia ou com um "nenhum alerta por enquanto" — ela vai se preencher nas próximas fases.
- Os dados ficam salvos no localStorage do navegador (fecho o app, abro de novo, os pets continuam lá).

Identidade visual: siga a paleta e fonte já aplicadas na Fase 0, mobile-first.
Não faça ainda: telas de ração, vacinas ou banhos, banco de dados externo, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Cadastro o Theo e a Chloe e eles aparecem no app
- [ ] Consigo alternar entre Casa / Theo / Chloe no Dashboard
- [ ] Fecho e abro o app de novo e os pets continuam lá

---

## Prompt — Fase 2: Ração & Areia

Leia o arquivo PLANO.md. Estou construindo o app Meu Pet. Já concluí as Fases 0 e 1 (setup + core com Dashboard e Perfis).

Agora vamos construir SÓ a Fase 2: Ração & Areia.

Nesta fase:
- Tela para registrar uma compra de ração ou areia: tipo (ração/areia), data da compra, duração estimada em dias. O app calcula e guarda a data prevista para acabar.
- Essa informação é da casa (compartilhada entre Theo e Chloe, não por pet individual).
- No Dashboard, mostrar um alerta quando a ração ou areia estiver perto de acabar (por exemplo, faltando 3 dias ou menos).

Identidade visual: siga a paleta e fonte já aplicadas, mobile-first.
Não faça ainda: vacinas, banhos, banco de dados externo, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Registro uma compra de ração e ela aparece salva
- [ ] O app calcula certo a data prevista de acabar
- [ ] Quando está perto de acabar, aparece um alerta no Dashboard

---

## Prompt — Fase 3: Vacinas & Saúde

Leia o arquivo PLANO.md. Estou construindo o app Meu Pet. Já concluí as Fases 0, 1 e 2.

Agora vamos construir SÓ a Fase 3: Vacinas & Saúde.

Nesta fase:
- Tela para registrar, de um pet específico (Theo ou Chloe), uma **vacina** ou uma **consulta veterinária** — os dois tipos têm campos diferentes:
  - Vacina: nome da vacina, data realizada, próxima dose prevista (opcional), observações.
  - Consulta: motivo/descrição, data da consulta, clínica, profissional, especialidade, se tem retorno agendado (com a data do retorno, só quando marcar "sim"), observações, e um campo para anexar a receita em foto ou PDF (opcional).
- Histórico visível na tela do pet (Theo ou Chloe), mostrando os campos certos pra cada tipo de registro.
- No Dashboard, mostrar um alerta quando uma próxima vacina/consulta estiver chegando (por exemplo, dentro de 7 dias).

Identidade visual: siga a paleta e fonte já aplicadas, mobile-first.
Não faça ainda: banhos, banco de dados externo, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Registro uma vacina do Theo ou da Chloe e ela aparece no histórico do pet certo
- [ ] Registro uma consulta com clínica, profissional, especialidade e retorno (quando tiver) e ela aparece certinha no histórico
- [ ] Consigo anexar uma foto ou PDF da receita numa consulta
- [ ] O app mostra a próxima data prevista (dose ou retorno)
- [ ] Quando está chegando a data, aparece um alerta no Dashboard

---

## Prompt — Fase 4: Banhos

Leia o arquivo PLANO.md. Estou construindo o app Meu Pet. Já concluí as Fases 0, 1, 2 e 3.

Agora vamos construir SÓ a Fase 4: Banhos.

Nesta fase:
- Tela para registrar um banho de um pet específico (Theo ou Chloe): data do banho, próxima data prevista.
- Histórico visível na tela do pet.
- No Dashboard, mostrar um alerta quando o próximo banho estiver chegando.

Identidade visual: siga a paleta e fonte já aplicadas, mobile-first.
Não faça ainda: banco de dados externo, login.
Vá me explicando o que está fazendo em linguagem simples e me avise quando eu puder testar.

Está pronto quando:
- [ ] Registro um banho do Theo ou da Chloe e ele aparece no histórico do pet certo
- [ ] O app mostra a próxima data prevista
- [ ] Quando está chegando a data, aparece um alerta no Dashboard
- [ ] Nesse ponto, o app já cumpre a promessa completa: cuida de ração, vacinas e banhos, tudo virando alertas no Dashboard

---

## Prompt — Fase Final: Publicar (Supabase + Deploy + PWA)

Leia o arquivo PLANO.md. Estou construindo o app Meu Pet. As Fases 0 a 4 estão prontas e funcionando com dados locais.

Agora é hora de publicar de verdade. Antes de tudo, vamos ativar a skill "vamos construir o back-end do meu app" para:
- Criar o banco de dados no Supabase organizado por **casa**: uma tabela de Casas, uma de Perfis (liga cada login a uma casa) e uma de Convites, além das tabelas de Pet, Compra de Ração/Areia, Vacina/Consulta e Banho — cada uma ligada à casa (direto ou via o pet).
- Criar login: uma conta para mim e uma para o Thiago, ambas ligadas à mesma casa, com acesso compartilhado aos dados dos mesmos pets (Theo e Chloe). Outras pessoas (ex: uma amiga com o pet dela) podem ter sua própria casa, totalmente separada — sem ver nem mexer nos dados de casas diferentes da delas.
- Criar o fluxo de convite: quem criou a casa gera um link (de uso único, sem prazo de validade) e manda manualmente para outro morador; ao se cadastrar com esse link, a pessoa entra automaticamente na mesma casa.
- Trocar o localStorage pelas chamadas reais ao Supabase.

Depois disso, me ajude a:
- Fazer o deploy na Vercel.
- Instalar o app como PWA no meu celular e no do Thiago.

Está pronto quando:
- [ ] Eu e o Thiago conseguimos logar cada um com sua conta e ver os mesmos dados do Theo e da Chloe
- [ ] Eu gero um link de convite e o Thiago consegue usá-lo para entrar na nossa casa
- [ ] Uma conta de outra casa (outro pet, outra pessoa) não vê nem consegue mexer nos nossos dados, e nós não vemos os dela
- [ ] O app está publicado com uma URL de verdade
- [ ] Consigo instalar o app na tela inicial do celular
