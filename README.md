# Avalória — portal oficial (starter)

Projeto inicial do portal público de Avalória, com interface responsiva em português/inglês e estrutura inicial do painel administrativo.

## O que já está incluído
- Página inicial com navegação por seções: O Jogo, Notícias, Diário, Galeria e Apoie.
- Identidade visual medieval clássica em madeira, pergaminho e ouro.
- Seletor PT/EN com preferência salva no navegador.
- Layout adaptável para celular e desktop.
- Área `/admin/` com Decap CMS e coleções separadas por idioma.
- Estrutura de conteúdo em Markdown preparada para notícias, devlogs e galeria.

## O que ainda precisa ser configurado
1. Criar um repositório GitHub para este projeto e enviar os arquivos.
2. Conectar o repositório ao Cloudflare Pages.
3. Ajustar `admin/config.yml` com o nome real do repositório.
4. Configurar OAuth para o painel. Não publique o painel como funcional antes de configurar e testar a autenticação.
5. Definir as contas e os níveis de acesso da equipe no GitHub.
6. Escolher a plataforma de apoio e substituir o link `https://example.com` em `index.html`.
7. Substituir a imagem conceitual do hero por arte/capturas oficiais do jogo quando estiverem disponíveis.

## Acesso da equipe e permissões
O Decap CMS usa o backend GitHub. O acesso efetivo é controlado pela autenticação e pelas permissões do repositório. Configure pelo menos:
- Administrador: acesso de manutenção ao repositório e configurações.
- Editor: permissão de escrita para preparar e editar conteúdo, sem acesso administrativo às configurações do repositório.
- Revisor/publicador: use o fluxo de revisão do CMS e as regras de proteção de branch do GitHub para controlar a publicação.

A granularidade exata depende das permissões disponíveis no plano e nas configurações do GitHub. Teste cada perfil com contas distintas antes de abrir o painel à equipe.

## Desenvolvimento local
Abra `index.html` no navegador para visualizar a página pública. Para testar o painel, é necessário configurar o backend OAuth e publicar/servir o site em um domínio compatível.

## Observações
- Não há banco de dados nem backend próprio nesta primeira versão.
- Os pagamentos não são processados pelo site; o botão de apoio é apenas um link provisório.
- As recompensas e itens de jogo são propostas de conteúdo, não benefícios já implementados.
- A arte de fundo atual é ilustrativa e deve ser substituída por material oficial.
- O conteúdo real das páginas será alimentado pelo painel após sua configuração.
