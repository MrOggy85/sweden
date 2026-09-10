# Drawing game icons

Hard-won from a review round where four of sixteen icons had to be redrawn. Read this before adding one; every rule
below is something a child or a parent actually misread.

## The frame

`viewBox='0 0 48 48'`, mass inside roughly x 6-42 / y 4-43. Stroke comes from `GameIcons.module.css` — never set
`stroke` or `stroke-width` inline on the silhouette.

| class   | use                                     | why                                             |
| ------- | --------------------------------------- | ----------------------------------------------- |
| (none)  | the silhouette                          | 1.5px outline, filled                           |
| `.line` | manes, whiskers, mouths, antler prongs  | 2px, no fill                                    |
| `.fine` | corn kernels, fruit highlights, stripes | 1px — texture must not compete with the outline |
| `.dot`  | seeds, nostrils, potato eyes, blush     | no stroke: a 1.5px outline swallows a 1px mark  |
| `.eye`  | pupils                                  | no stroke                                       |

Draw order is z-order. Ears, antlers, tails and husks go **before** the head or body so the body overlaps their roots.
Overlapping outlines leave visible seams — that is the house comic style, not a bug.

## What made icons fail

- **Ears must root inside the head outline.** Four icons failed on this alone: ears that sit clear of the skull read as
  headphones. `bear` is the reference — ear circles centred on the head's edge.
- **Eyes are a white ball with a pupil, not a black dot.** `cow` looked eyeless because its black dots landed on a black
  patch. White survives any fill behind it.
- **A nose low on the face reads as a mouth.** Put the nose high on a lighter muzzle and put an actual mouth line under
  it (`dog`, `fox`).
- **Species identity is several small cues, not one.** `cat` read as a mouse until it had all of: pink triangular nose,
  whiskers springing from the _cheeks_ (a centre-radiating fan is the single most rodent-like thing you can draw),
  forehead stripes, slit pupils.
- **A plain oval plus ears is not an animal.** `horse` needed a long head tapering to the muzzle and a blaze before it
  stopped being a generic quadruped.
- **Check the silhouette against what else it could be.** Real examples: corn husks that flared at the bottom were
  rocket fins; a banana without its ridge line was a melon slice; an apple without the dip at the stem is a tomato — and
  this set contains both.
- **Cylinders need parallel sides.** `cucumber` as a tapered oval read as a courgette-ish blob; a capsule (`rect` with
  `rx`, rotated) reads as a cylinder.
- **Draw the whole animal, in profile, when the head alone is unrecognisable.** `bird` and `fish`. This also settles the
  eye question: one visible eye is _correct_ in profile, where on a face it looks like a missing one.
- **A part of a body is not an object.** `hand`, `foot` and `tooth` stand alone; a nose or an ear in an empty frame is a
  shape nobody can name. `eye`, `nose`, `mouth` and `ear` therefore share one pale face with the other features ghosted
  and only the named one in colour — decided once for all four, because a set that answers the question two different
  ways is worse than either answer. They are drawn as the pair even though `öga` and `öra` are singular: one of two,
  greyed out, reads as damage rather than as "this one".

## Pairs that had to be pulled apart

Every entry here is two icons that were going to be the same drawing. Check a new icon against this list before the
frame rules — most of the work in a large batch is separation, not draughtsmanship.

| Pair                     | What separates them                                               |
| ------------------------ | ----------------------------------------------------------------- |
| `moln` / `regn`          | the rain cloud is grey and smaller; the drops carry the meaning   |
| `moon` / `banana`        | craters — a pale crescent alone is the banana                     |
| `snow` / `star`          | six blue arms of line work against five solid yellow points       |
| `melon` / `pumpkin`      | one sphere in two colours: the pumpkin is squat under a stub stem |
| `lettuce` / `tree`       | the tree crown with the trunk cropped off; hence radiating veins  |
| `paprika` / `tomato`     | square shoulders and a lobed base against a circle                |
| `grapes` / `blueberries` | the leaf, and six berries in a triangle rather than three loose   |
| `stone` / `potato`       | flat facets against a smooth blob with eyes in it                 |
| `reindeer` / `moose`     | branched line antlers against filled palmate slabs                |
| `mouse` / `cat`          | round ears, pointed snout, and the rodent whisker fan on purpose  |
| `rabbit` / `mouse`       | the ears are not enough on their own — hence the teeth            |
| `sheep` / `cloud`        | a dark face in the wool                                           |
| `duck` / `bird`          | a broad flat bill where the bird has a point                      |
| `squirrel` / `fox`       | both orange and pointed in front, so the tail outgrows the animal |
| `firetruck` / `car`      | the ladder and the blue light                                     |
| `plane`                  | seen from above; in profile it is a fish with straight fins       |
| `jacket` / `jumper`      | a zip, collar and pockets against a round neck and ribbed hem     |
| `mitten` / `sock`        | the thumb against the heel                                        |
| `beanie` / `hat`         | the brim                                                          |

## Colour

Fixed fills, not `currentColor`: a child recognises these things by colour.

`GAME_COLORS` in `GameIcons.tsx` is deliberately **not** `COLORS` from `data/pages.ts` — those are avatar colours,
server-validated and stored in every profile, so they cannot be retuned. Swatches are picked to differ in **lightness**
as well as hue, since lightness is what carries the difference when hue perception does not.

Red and green is the pair red-green colour blindness collapses; no palette fixes it. Shifting green toward blue (the
Okabe-Ito bluish green) is the only lever available. A genuine fix needs a second channel — texture per swatch — which
changes what the game teaches, so raise it rather than adding it quietly.

## Working method

You cannot see what you draw. Do not guess twice in a row:

1. Build, then look at `/dev/icons` — every icon at 88px next to 44px. Anything unrecognisable in the small column needs
   redrawing, not shrinking.
2. Expect a review round, and ask which icons read wrong rather than assuming.
3. A new pair in `content/games/connect-pairs.md` also needs a clip: `make generate-audio` on macOS.
   `make generate-content` fails until it exists.

The id list lives in `./iconIds.ts`, not here — `scripts/` imports it to reject an unknown icon in content, which it
cannot do with this file (React, and a CSS module). It is not a second copy to keep in step: `OBJECT_ICONS` is typed
`Record<ObjectIconId, ReactNode>`, so an id with no drawing and a drawing with no id are both `tsc` errors.
