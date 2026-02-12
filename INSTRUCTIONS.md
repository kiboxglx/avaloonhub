# Instruções para Configurar o Banco de Dados Supabase (Avaloon Hub)

Seguindo este guia, você terá o banco de dados completo e funcional em poucos minutos.

## 1. Criar Projeto no Supabase
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e faça login.
2. Clique em **"New Project"**.
3. Escolha a organização, dê um nome (ex: `AvaloonHub`) e defina uma senha forte para o banco.
4. Selecione uma região próxima (ex: São Paulo / Brasil).
5. Clique em **"Create new project"**.


## 2. Rodar o Script de Criação do Banco (Schema SQL)
1. No menu lateral esquerdo do Supabase, clique no ícone **SQL Editor** (parece um terminal `>_`).
2. Clique em **"New query"**.
3. Copie **todo o conteúdo** do arquivo `supabase/schema.sql` que criei no seu projeto.
4. Cole no editor do Supabase e clique no botão **"Run"** (canto inferior direito).
   - Isso criará todas as tabelas: `clients`, `services`, `demands`, `inventory`, `financial`, etc.

## 3. (Opcional) Inserir Dados de Exemplo
1. Apague o conteúdo anterior do SQL Editor.
2. Copie o conteúdo do arquivo `supabase/seed.sql`.
3. Cole no editor e clique em **"Run"**.
   - Isso adicionará alguns clientes e serviços de teste para você não começar do zero.

## 4. Conectar o Frontend ao Supabase
Agora precisamos das chaves de acesso.

1. No Supabase, vá em **Project Settings** (ícone de engrenagem) > **API**.
2. Copie a **URL** (`Project URL`).
3. Copie a chave **anon** / `public` (`Project API keys`).

### Configurar Variáveis de Ambiente
1. Crie um arquivo chamado `.env` na raiz do projeto (mesma pasta do `package.json`).
2. Adicione o seguinte conteúdo, substituindo pelos seus valores copiados:

```env
VITE_SUPABASE_URL=Sua_URL_Aqui
VITE_SUPABASE_ANON_KEY=Sua_Chave_ANON_Aqui
```

> **Atenção:** Nunca compartilhe sua `service_role` key (secret). Use apenas a `anon` key no frontend.

## 5. Pronto!
O projeto já está configurado para usar o Supabase. O arquivo `src/services/supabase.js` já foi criado e está pronto para ser importado nas páginas.

Para testar, reinicie o servidor de desenvolvimento:
```bash
npm run dev
```
