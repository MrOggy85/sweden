What `say` is given, when that has to differ from the word the app shows. One bullet per
override, written as "word | what to say". Everything else is spoken as written.

Only needed for homographs — words spelled the same but said differently — or for anything
the Swedish voice reads wrongly.

**An override that ends with the word itself is a carrier.** The extra words in front are
there to fix the stress and are cut back out of the audio afterwards, so the clip still
contains one word and can still be chained in the sentence builder. `banan` is the fruit
(ba-NAN) and also "the track" (BA-nan): Alva reads the track, `banán` does not move the
stress, and `en banan` does — an article a track cannot take. A pause between the two loses
the stress again, so the carrier is spoken contiguously and removed from the PCM by
`scripts/aiff.ts` before encoding.

Check a candidate by ear first, then regenerate that one clip:

    say -v Alva "en banan"
    make generate-audio ARGS=--only=banan

- banan | en banan
