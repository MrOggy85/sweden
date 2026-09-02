Word/image pairs for the "connect the words" game. One bullet per pair, written as
"swedish | english | icon". `icon` must match a key in client/src/GameIcons/GameIcons.tsx —
either an object icon (e.g. `cow`) or a `color-<name>` swatch for one of the colour words.

Each round of the game picks ROUND_SIZE of these at random (see client/src/data/gameContent.ts),
so add as many as you like; nothing else needs to change. The headings below are for
whoever is reading the file — the parser takes bullets wherever it finds them.

## Animals

- ko | cow | cow
- hund | dog | dog
- katt | cat | cat
- häst | horse | horse
- fågel | bird | bird
- älg | moose | moose
- räv | fox | fox
- björn | bear | bear
- gris | pig | pig
- fisk | fish | fish

## Fruit

- äpple | apple | apple
- banan | banana | banana
- jordgubbe | strawberry | strawberry
- citron | lemon | lemon
- päron | pear | pear
- blåbär | blueberries | blueberries
- ananas | pineapple | pineapple

## Vegetables

- morot | carrot | carrot
- tomat | tomato | tomato
- gurka | cucumber | cucumber
- potatis | potato | potato
- majs | corn | corn

## Colours

- blå | blue | color-blue
- gul | yellow | color-yellow
- orange | orange | color-orange
- lila | purple | color-purple
- röd | red | color-red
- grön | green | color-green
- rosa | pink | color-pink

## Other

- bil | car | car
