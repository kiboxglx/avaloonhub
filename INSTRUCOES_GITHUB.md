# Como abrir o Projeto no GitHub (Sem Deploy)

Para visualizar e rodar o projeto diretamente dentro do GitHub, sem precisar configurar hospedagem externa (Vercel, Netlify, etc), use o **GitHub Codespaces**.

## Passo a Passo:

1.  Acesse seu repositório: [https://github.com/kiboxglx/avaloonhub](https://github.com/kiboxglx/avaloonhub)
2.  Clique no botão verde **<> Code**.
3.  Selecione a aba **Codespaces**.
4.  Clique no botão verde **Create codespace on main**.

O GitHub irá preparar um ambiente virtual (VS Code no navegador). Isso pode levar alguns segundos.

## Rodando o Projeto:

Quando o ambiente carregar (aparecer o terminal na parte inferior):

1.  Digite este comando para instalar as dependências:
    ```bash
    npm install
    ```
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  O GitHub mostrará uma notificação no canto inferior direito:
    > "Your application is running on port 5173."

    Clique no botão verde **Open in Browser**.

Pronto! Seu site abrirá em uma nova aba, rodando diretamente "dentro" do GitHub.

---

### Observação
Este método serve para *desenvolvimento e visualização*. O link gerado é temporário e privado para você. Se quiser publicar um link fixo para outras pessoas verem, você precisará usar o **GitHub Pages** (Opção Settings > Pages).
