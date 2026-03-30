# Sol de mayo Galactic Battle 

Juego 2D arcade hecho con Phaser + TypeScript sobre Vite.

## Base del proyecto

- Tema: duelo entre dos soles (AR vs UY), con seleccion de pais al inicio.
- Jugabilidad actual:
  - El jugador se mueve y dispara.
  - El boss dispara en rafagas.
  - El boss por ahora tiene vida infinita.
  - Cada impacto al boss suma puntos.
  - El jugador tiene sistema de vidas y al quedarse sin vidas pasa a GameOverScene.
  - El score se reinicia al iniciar una nueva partida.

## Stack tecnico

- Phaser 3
- TypeScript
- Vite

## Estructura principal

- src/scenes: escenas del juego (menu, gameplay, game over).
- src/entities: entidades y logica base (player, boss, proyectiles, armas).
- src/config: configuracion general del juego.
- src/main.ts: punto de entrada.

## Comandos

- Instalar dependencias:
  - npm install
- Ejecutar en desarrollo:
  - npm run dev
- Build de produccion:
  - npm run build
- Previsualizar build:
  - npm run preview

## Ideas futuras

- Reemplazar los placeholder.
- Ataques especiales tematicos.
- Leaderboard por pais.
- Sistema rogue like para comprar mejoras al perder.
