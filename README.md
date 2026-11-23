# LC Telecom — Landing page

Site de página única da **LC Telecom**, provedora de internet (fibra óptica, via rádio e rural) de Brasília-DF.
HTML, CSS e JavaScript puros: sem framework, sem build, sem dependências para instalar.

> **Status:** versão de demonstração. Preços, bairros atendidos e depoimentos ainda são placeholders (veja [O que falta preencher](#o-que-falta-preencher)).

## Visualizar localmente

Basta abrir o `index.html` no navegador, ou subir um servidor local (recomendado):

```bash
node servidor-local.js        # http://localhost:8000
# ou, se tiver Python:
python3 -m http.server 8000
```

Dica: acrescente `?placeholders` à URL (`http://localhost:8000/?placeholders`) para destacar em amarelo tudo que ainda precisa ser preenchido.

## Estrutura

```
.
├── index.html               # página única (todas as seções)
├── assets/
│   ├── css/style.css        # estilos (tokens → base → componentes → seções → animações → responsivo)
│   ├── js/main.js           # CONFIG + interações (preloader, menu, abas, cobertura, animações)
│   └── img/                 # logo e ícones (logo.webp é o arquivo original)
├── servidor-local.js        # servidor estático opcional (Node)
├── .nojekyll                # necessário para o GitHub Pages servir os arquivos como estão
└── README.md
```

## O que falta preencher

Cada ponto está marcado no código com comentários `PLACEHOLDER`. Para localizar todos: busque por `PLACEHOLDER` no editor.

| O quê | Onde editar |
|---|---|
| Números de WhatsApp e mensagem padrão | `CONFIG.phones` e `CONFIG.defaultMessage` — início do `assets/js/main.js` |
| Bairros/regiões atendidos | `CONFIG.coverage` — `assets/js/main.js` |
| CEPs atendidos (opcional) | `CONFIG.cepPrefixes` — `assets/js/main.js` |
| Velocidades e preços dos planos | Cards em `<section id="planos">` — `index.html` (`.plan__num`, `.price__int`, `.price__cents`) |
| Depoimentos reais (e autorizados) | `<section id="depoimentos">` — `index.html` |
| Prazo de instalação e formas de pagamento | `<section id="faq">` — `index.html` |
| Logo oficial do Globoplay | `<section id="parcerias">` — `index.html` |
| CNPJ | Rodapé, `.footer__cnpj` — `index.html` |
| Domínio definitivo (`og:url`) e imagem de compartilhamento | `<head>` — `index.html` |
| Pino exato do Google Maps | `<iframe>` no rodapé — `index.html` |

## Publicar no GitHub Pages

1. Crie o repositório no GitHub e envie os arquivos (comandos abaixo).
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Em alguns minutos o site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

```bash
git init
git add .
git commit -m "Landing page LC Telecom"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
git push -u origin main
```

Todos os caminhos do projeto são **relativos**, então o site funciona tanto na raiz de um domínio quanto em um subcaminho do GitHub Pages.
Para usar o domínio próprio da empresa, configure em **Settings → Pages → Custom domain**. O site também roda em qualquer hospedagem simples: basta enviar os arquivos por FTP ou pelo painel.

## Identidade visual

| Cor | Valor |
|---|---|
| Vermelho de destaque | `#E31E24` |
| Fundo | `#07070A` (grafite/preto) |
| Texto | `#F4F4F6` |

Fonte: **Saira** (Google Fonts). As cores e a fonte são variáveis no início do `assets/css/style.css`.

## Observações

- A marca "LC Telecom", o logotipo e o nome do Globoplay pertencem aos seus respectivos titulares.
- Os depoimentos exibidos são apenas espaços reservados — não publique depoimentos fictícios.
