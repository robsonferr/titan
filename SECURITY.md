# Security

## Reportar uma vulnerabilidade

Envie detalhes para **robson.ferreira@statutories.com**. Por favor, não abra
issues públicas para falhas de segurança. Inclua:

- Passos para reproduzir.
- Versão / commit afetado.
- Impacto observado.

Tempo-alvo de resposta: **5 dias úteis**.

## Modelo de ameaça

TITAN é um dashboard pessoal/familiar de metas, hospedado como Cloudflare
Worker (Next.js + OpenNext + D1). É de **uso restrito**, não de assinatura
multi-usuário.

### Em escopo
- Brute-force / credential stuffing contra `/login`.
- SQL injection via Server Actions.
- XSS / clickjacking no shell renderizado.
- Vazamento de detalhes internos por mensagens de erro.
- Bypass de autenticação (cookie forjado, replay).

### Fora de escopo
- Ataques que requerem acesso físico ao dispositivo do dono da conta.
- DoS volumétrico (delegado às proteções do Cloudflare).
- Ataques contra a infraestrutura da Cloudflare.

## Premissas de deploy

A app **não pode** rodar com segurança a menos que:

1. **Segredos configurados** em produção via Cloudflare Secrets:
   ```
   wrangler secret put AUTH_PASSWORD
   wrangler secret put AUTH_SESSION_SECRET   # >=32 bytes random; ex.: openssl rand -base64 48
   ```
   Localmente, esses valores ficam em `.dev.vars` (já no `.gitignore`).

2. **Migrações aplicadas**, incluindo `0002_login_attempts.sql`:
   ```
   npm run db:migrate:remote
   ```

3. **HTTPS forçado** na zona Cloudflare (HSTS já é enviado pelo app, mas
   o downgrade só fica bloqueado depois que o cliente vê o cabeçalho uma vez).

## Defesas atuais

| Camada            | Mecanismo                                                                 |
|-------------------|---------------------------------------------------------------------------|
| Autenticação      | Senha única + cookie HttpOnly assinado (HMAC-SHA256), TTL 30 dias.        |
| Autorização       | `middleware.ts` redireciona para `/login`; cada Server Action revalida.   |
| Anti-brute-force  | D1 `login_attempts`: 5 falhas em 15 min → lockout de 15 min por IP.       |
| SQL injection     | Prepared statements em todas as queries; identificadores via whitelist.   |
| XSS / clickjacking| CSP estrita, `X-Frame-Options: DENY`, `frame-ancestors 'none'`.           |
| Transport         | HSTS preload, `Strict-Transport-Security: max-age=63072000`.              |
| Sniffing          | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-...`.  |
| Permissões browser| `Permissions-Policy`: camera, microphone, geolocation = `()`.             |
| Validação input   | Limites de tamanho e teto numérico em Server Actions; mirror em HTML.     |
| Erros             | Apenas códigos opacos vão para o cliente; detalhes ficam em logs server.  |

## Limitações conhecidas

- **CSP usa `'unsafe-inline'`** em `script-src` e `style-src` por compatibilidade
  com a hidratação do Next.js e estilos inline do framer-motion. Pode evoluir
  para nonces no futuro.
- **Rate limit é por IP**. Atrás de NAT compartilhado, vários usuários podem
  somar falhas. Aceitável para o cenário pessoal.
- **Sem auditoria** de mutações por enquanto; ver pendência em
  `docs/security-check-30042026.md`.
