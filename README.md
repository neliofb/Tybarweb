# TybarWeb

Portal do jogador do Tybar Reborn (guerra de facções): React + Vite. Conversa com a API do servidor do jogo
(`Scripts/Custom/Systems/WebApi`, porta 8085), com o mesmo login da conta do jogo.

```
npm install
npm run dev       # desenvolvimento: /api é repassado para http://localhost:8085
npm run build     # gera dist/ para publicar
```

Em produção o portal e a API ficam no mesmo endereço (o IIS repassa `/api` para o servidor do jogo), por isso
`VITE_API_URL` fica vazio em `.env.production`. Só publicar com HTTPS: o login usa a senha do jogo.
Plano de hospedagem: `docs/MAPA_DO_CODIGO.md` §11 no repo do servidor.
