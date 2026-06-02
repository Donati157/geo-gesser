# 🌍 GeoGesser

Um jogo de adivinhar lugares pelo mundo — tipo GeoGuessr, mas **100% grátis, sem login e com multiplayer em tempo real**. Você é largado numa rua aleatória do planeta (imagens do [Mapillary](https://www.mapillary.com)), explora em 360°, lê as pistas e crava um palpite no mapa. Quanto mais perto, mais pontos.

## ✨ O que tem

- **Multiplayer em salas** — crie uma sala, compartilhe o código de 4 letras, jogue com até 12 amigos.
- **Rodadas sincronizadas** com cronômetro, placar ao vivo e revelação no mapa (linha do seu palpite até o local real).
- **Imagens de rua gratuitas** via API do Mapillary (não precisa de cartão de crédito).
- **UX caprichada** — tema escuro, mapa que abre/fecha, pódio no final.
- Pontuação estilo GeoGuessr: até **5000 pontos** por rodada, decaindo com a distância.

## 🗂 Estrutura

```
geogesser/
├── server/   → Node + Express + Socket.IO (salas, rodadas, busca de imagens)
└── client/   → React + Vite (visualizador Mapillary + mapa Leaflet)
```

## 🚀 Como rodar

### 1. Pegue um token do Mapillary (grátis, 2 min)

1. Crie conta em https://www.mapillary.com
2. Vá em **Dashboard → Developers → Register Application**
3. Copie o **Client Token** (começa com `MLY|...`)

### 2. Configure

```bash
cp .env.example .env
# edite .env e cole seu token em MAPILLARY_TOKEN
cp .env server/.env   # o servidor lê o token do próprio diretório
```

### 3. Instale e rode

```bash
npm run install:all   # instala raiz + server + client
npm run dev           # sobe servidor (3001) e cliente (5173) juntos
```

> **Não tem Node instalado?** O projeto já vem com um Node portátil em `.toolchain/`.
> Basta rodar `./run.sh` — ele instala as dependências e sobe tudo usando esse Node.
> Se você instalar o Node do sistema (https://nodejs.org), pode apagar a pasta `.toolchain/` (≈176MB).

Abra **http://localhost:5173**. Para jogar com amigos na mesma rede, eles acessam `http://SEU_IP:5173`.

## 🎮 Como jogar

1. Digite seu nome → **Criar sala**.
2. Compartilhe o **código** (ou entre num com o código de alguém).
3. O host ajusta rodadas/tempo e clica **Começar**.
4. Cada rodada: explore a rua, abra o mapa 🗺, clique onde acha que está e **crave o palpite**.
5. Veja a revelação e o placar. No fim, o **pódio**.

## 🔧 Ideias de evolução

- Modos: só placas, modo cego (sem se mover), regiões temáticas, desafio diário.
- Streaks e ranking persistente (precisa de banco de dados).
- Limitar movimento / zoom para dificuldade maior.
- Deploy: cliente em Vercel/Netlify, servidor em Railway/Fly.io (defina `VITE_SERVER_URL` no build do cliente).

---

Imagens de rua © contribuidores do Mapillary. Mapa base © CARTO / OpenStreetMap.
