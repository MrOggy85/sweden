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
- mus | mouse | mouse
- kanin | rabbit | rabbit
- får | sheep | sheep
- anka | duck | duck
- groda | frog | frog
- ekorre | squirrel | squirrel
- uggla | owl | owl
- igelkott | hedgehog | hedgehog
- fjäril | butterfly | butterfly

## Fruit

- äpple | apple | apple
- banan | banana | banana
- jordgubbe | strawberry | strawberry
- citron | lemon | lemon
- päron | pear | pear
- blåbär | blueberries | blueberries
- ananas | pineapple | pineapple
- lingon | lingonberries | lingon
- apelsin | orange fruit | apelsin
- hallon | raspberry | raspberry
- körsbär | cherry | cherry
- vindruvor | grapes | grapes
- melon | melon | melon

## Vegetables

- morot | carrot | carrot
- tomat | tomato | tomato
- gurka | cucumber | cucumber
- potatis | potato | potato
- majs | corn | corn
- pumpa | pumpkin | pumpkin
- lök | onion | onion
- ärta | pea | pea
- paprika | pepper | paprika
- svamp | mushroom | mushroom
- sallad | lettuce | lettuce

## Colours

- blå | blue | color-blue
- gul | yellow | color-yellow
- orange | orange | color-orange
- lila | purple | color-purple
- röd | red | color-red
- grön | green | color-green
- rosa | pink | color-pink
- svart | black | color-black
- vit | white | color-white
- brun | brown | color-brown
- grå | grey | color-grey

## Nature and weather

- sol | sun | sun
- snö | snow | snow
- regn | rain | rain
- blomma | flower | flower
- löv | leaf | leaf
- moln | cloud | cloud
- träd | tree | tree
- stjärna | star | star
- måne | moon | moon
- sten | stone | stone

## Vehicles

- bil | car | car
- buss | bus | bus
- tåg | train | train
- båt | boat | boat
- cykel | bicycle | bicycle
- flygplan | aeroplane | plane
- traktor | tractor | tractor
- brandbil | fire engine | firetruck

## Body

- hand | hand | hand
- fot | foot | foot
- öga | eye | eye
- näsa | nose | nose
- mun | mouth | mouth
- öra | ear | ear
- tand | tooth | tooth

## Clothes

- hatt | hat | hat
- mössa | beanie | beanie
- jacka | jacket | jacket
- skor | shoes | shoes
- byxor | trousers | trousers
- vante | mitten | mitten
- tröja | jumper | jumper
- strumpa | sock | sock
