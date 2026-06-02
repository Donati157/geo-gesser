# 🚀 Deploy do GeoGesser

A arquitetura tem duas partes que vão para lugares diferentes:

| Parte | Onde | Por quê |
|-------|------|---------|
| **Cliente** (React/Vite) | **Vercel** | Site estático, perfeito para CDN |
| **Servidor** (Socket.IO) | **Railway** ou **Render** | Precisa de WebSocket persistente + estado em memória — a Vercel (serverless) não suporta |

A ordem importa: **suba o servidor primeiro**, pegue a URL dele, e só então configure o cliente.

---

## 1. Servidor → Railway (recomendado) ou Render

### Opção A — Railway (https://railway.app)
1. Crie um projeto novo a partir deste repositório (ou faça upload).
2. O Railway lê o `railway.json` e já sabe como buildar/rodar o servidor.
3. Em **Variables**, adicione:
   - `MAPILLARY_TOKEN` = seu token `MLY|...`
   - `CLIENT_ORIGIN` = a URL do cliente na Vercel (ex: `https://geo-gesser.vercel.app`) — pode preencher depois do passo 2.
4. Em **Settings → Networking → Generate Domain** para obter a URL pública (ex: `https://geogesser-server-production.up.railway.app`).
5. Teste: abra `SUA_URL/health` → deve responder `{"ok":true}`.

### Opção B — Render (https://render.com)
1. **New + → Blueprint** apontando para o repositório. O `render.yaml` configura tudo.
2. Em **Environment**, defina `MAPILLARY_TOKEN` e `CLIENT_ORIGIN`.
3. Pegue a URL pública gerada e teste `/health`.

> O plano grátis do Render "dorme" após inatividade (primeira conexão demora alguns segundos). O Railway tem trial e depois é pago. Para um projeto pessoal, qualquer um serve.

---

## 2. Cliente → Vercel

O projeto já tem `vercel.json` configurado (builda a pasta `client/`).

1. No projeto da Vercel, em **Settings → Environment Variables**, adicione:
   - `VITE_SERVER_URL` = a URL pública do servidor do passo 1 (ex: `https://geogesser-server-production.up.railway.app`)
2. **Redeploy** (as variáveis do Vite são lidas no build, então precisa rebuildar depois de definir).

Pronto: o cliente na Vercel vai conectar no servidor do Railway e o multiplayer funciona.

---

## 3. Fechar o ciclo do CORS

Depois que souber a URL final da Vercel, volte ao servidor (Railway/Render) e confirme que `CLIENT_ORIGIN` é exatamente essa URL (sem barra no final). Isso restringe quem pode conectar — opcional, mas recomendado.

---

## Checklist rápido
- [ ] Servidor no ar, `/health` responde
- [ ] `MAPILLARY_TOKEN` definido no servidor
- [ ] `VITE_SERVER_URL` definido na Vercel → redeploy feito
- [ ] `CLIENT_ORIGIN` no servidor = URL da Vercel
- [ ] Abrir o site, criar sala, ver a imagem de rua carregar 🎉
