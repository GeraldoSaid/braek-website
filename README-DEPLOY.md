# 🚀 Deploy Guide — Braek Website na Hostinger

## Pré-requisitos
- Conta na Hostinger com plano **Business Web Hosting** (ou superior)
- Banco MySQL criado no hPanel

---

## 1. Criar o banco de dados na Hostinger

1. Acesse `hPanel → MySQL Databases`
2. Crie um novo banco: ex. `u123456_braek`
3. Crie um usuário MySQL e associe ao banco com **todas as permissões**
4. Anote: **host, database name, user, password**

---

## 2. Editar `api/config.php`

Abra o arquivo e preencha com as credenciais da Hostinger:

```php
define('DB_HOST', 'localhost');         // sempre 'localhost' na Hostinger
define('DB_NAME', 'u123456_braek');     // nome do banco
define('DB_USER', 'u123456_braekuser'); // usuário MySQL
define('DB_PASS', 'sua_senha_aqui');    // senha MySQL
define('BASE_URL', 'https://seudominio.com');
```

---

## 3. Importar o banco de dados

1. No hPanel, acesse `phpMyAdmin`
2. Selecione o banco criado
3. Clique em **Importar** → escolha `database/schema.sql`
4. Clique em **Executar**

Isso cria todas as tabelas e insere os projetos iniciais.

---

## 4. Upload dos arquivos

**Opção A — File Manager (mais simples):**
1. hPanel → File Manager → `public_html`
2. Faça upload de todos os arquivos do projeto (ZIP e extraia lá)

**Opção B — FTP (mais rápido):**
1. Use FileZilla com as credenciais FTP do hPanel
2. Conecte e faça upload para `/public_html/`

> ⚠️ NÃO faça upload da pasta `database/` para `public_html`. Mantenha ela apenas localmente.

---

## 5. Criar usuário admin

O schema já cria um usuário padrão:
- **Email:** `admin@braek.com`
- **Senha:** `password` (senha padrão do bcrypt `$2y$10$92IXUNpkjO0rOQ5...`)

**Troque a senha imediatamente!** No phpMyAdmin, execute:

```sql
UPDATE users 
SET password = '$2y$10$HASH_DA_NOVA_SENHA' 
WHERE email = 'admin@braek.com';
```

Para gerar o hash, use [bcrypt-generator.com](https://bcrypt-generator.com) com **10 rounds**.

---

## 6. Configurar domínio

1. hPanel → Domínios → Adicionar domínio ou subdomínio
2. Aponte o DNS do seu domínio para os nameservers da Hostinger
3. Aguarde propagação (até 24h)

---

## 7. SSL (HTTPS)

1. hPanel → SSL → Instalar certificado Let's Encrypt grátis
2. Após instalar, atualize `BASE_URL` em `api/config.php` para `https://`

---

## ✅ Checklist final

- [ ] `api/config.php` preenchido com credenciais reais
- [ ] Schema importado no phpMyAdmin
- [ ] Arquivos enviados para `public_html/`
- [ ] Senha do admin atualizada
- [ ] SSL instalado
- [ ] Acesse `https://seudominio.com/admin/login.html` e faça login

---

## 🔄 Como atualizar o site após hospedar

Continue usando o Antigravity (IA) para editar os arquivos localmente, depois suba as alterações via:
- **File Manager** no hPanel (para pequenas alterações)
- **FTP com FileZilla** (para múltiplos arquivos)

Em breve pode-se configurar **deploy via Git** para automatizar isso.
