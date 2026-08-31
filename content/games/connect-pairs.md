Word/image pairs for the "connect the words" game. One bullet per pair, written as
"swedish | english | icon". `icon` must match a key in client/src/GameIcons/GameIcons.tsx —
either an object icon (e.g. `cow`) or a `color-<name>` swatch for one of the colour words.

Each round of the game picks ROUND_SIZE of these at random (see client/src/data/gameContent.ts),
so add as many as you like; nothing else needs to change.

- ko | cow | cow
- hund | dog | dog
- katt | cat | cat
- häst | horse | horse
- fågel | bird | bird
- äpple | apple | apple
- banan | banana | banana
- bil | car | car
- blå | blue | color-blue
- gul | yellow | color-yellow
- orange | orange | color-orange
- lila | purple | color-purple
