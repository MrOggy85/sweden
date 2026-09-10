Word/image pairs for the "connect the words" game. One bullet per pair, written as
"swedish | english | icon". `icon` must match a key in client/src/GameIcons/iconIds.ts —
either an object icon (e.g. `cow`) or a `color-<name>` swatch for one of the colour words.
An icon that does not exist fails `make generate-content`, so a typo never reaches a card.

Each round of the game picks ROUND_SIZE of these at random (see client/src/data/gameContent.ts),
so add as many as you like; nothing else needs to change. The headings below are for
whoever is reading the file — the parser takes bullets wherever it finds them.

The clip is derived from the Swedish word and shared with every other content file, so a
word already spoken on a topic page costs nothing but an icon. `slug()` folds å/ä/ö, which
is why hår, säng and år are not here: they collide with har, sång and är elsewhere.

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
- ren | reindeer | reindeer

## Fruit

- äpple | apple | apple
- banan | banana | banana
- jordgubbe | strawberry | strawberry
- citron | lemon | lemon
- päron | pear | pear
- blåbär | blueberries | blueberries
- ananas | pineapple | pineapple
- lingon | lingonberries | lingon

## Vegetables

- morot | carrot | carrot
- tomat | tomato | tomato
- gurka | cucumber | cucumber
- potatis | potato | potato
- majs | corn | corn
- pumpa | pumpkin | pumpkin

## Colours

- blå | blue | color-blue
- gul | yellow | color-yellow
- orange | orange | color-orange
- lila | purple | color-purple
- röd | red | color-red
- grön | green | color-green
- rosa | pink | color-pink

## Nature and weather

- sol | sun | sun
- snö | snow | snow
- regn | rain | rain
- blomma | flower | flower
- löv | leaf | leaf

## Vehicles

- bil | car | car

## Clothes

- hatt | hat | hat
