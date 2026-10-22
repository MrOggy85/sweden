import { useEffect, useState } from 'react';
import { GameIcon } from '../GameIcons/GameIcons';
import { Celebration, GameFrame } from '../GameFrame/GameFrame';
import { GAME_WORDS, numberAudio, randomPhrase } from '../data/gameContent';
import { playSfx } from '../core/sfx';
import { useSpeaker } from '../core/useSpeaker';
import motion from '../core/motion.module.css';
import styles from './CountGame.module.css';

// `b` 0 is a counting round; otherwise it is a + b. Counting first, so the sums arrive
// once the child knows the number pad answers "hur många?".
type Problem = { a: number; b: number };

const COUNTING_ROUNDS = 3;
const ADDING_ROUNDS = 3;
const MAX = 10;
const NUMBERS = Array.from({ length: MAX }, (_, i) => i + 1);

const between = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

function makeProblems(): Problem[] {
  const counting = Array.from({ length: COUNTING_ROUNDS }, () => ({ a: between(2, MAX), b: 0 }));
  const adding = Array.from({ length: ADDING_ROUNDS }, () => {
    const a = between(1, MAX - 1);
    return { a, b: between(1, MAX - a) };
  });
  return [...counting, ...adding];
}

export function CountGame({ onBack }: { onBack: () => void }) {
  const say = useSpeaker();
  const [problems, setProblems] = useState(makeProblems);
  const [index, setIndex] = useState(0);
  // Dinos tapped this round, in tap order: the badge is the count reached on that tap.
  const [tapped, setTapped] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [phrase, setPhrase] = useState('');

  const problem = problems[index];
  const done = !problem;
  const answer = problem ? problem.a + problem.b : 0;

  // Every new herd asks the question, so the question is the only instruction.
  useEffect(() => {
    if (!problem) return;
    void say(GAME_WORDS['hur många']);
  }, [index, problems]);

  function tapDino(id: number) {
    if (solved || tapped.includes(id)) return;
    const next = [...tapped, id];
    setTapped(next);
    void say(numberAudio(next.length));
  }

  async function answerWith(n: number) {
    if (!problem || solved) return;
    if (n !== answer) {
      setWrong(n);
      setTimeout(() => setWrong(null), 400);
      void say(numberAudio(n));
      return;
    }

    setSolved(true);
    const sentence = problem.b === 0
      ? [numberAudio(n)]
      : [numberAudio(problem.a), GAME_WORDS.plus, numberAudio(problem.b), GAME_WORDS['är'], numberAudio(n)];
    const finished = await say(...sentence);
    if (!finished) return;

    setTapped([]);
    setSolved(false);
    if (index + 1 === problems.length) {
      setPhrase(randomPhrase());
      playSfx('fanfare');
    }
    setIndex(index + 1);
  }

  function again() {
    setProblems(makeProblems());
    setIndex(0);
    setTapped([]);
  }

  function herd(count: number, offset: number) {
    return (
      <div className={styles.herd}>
        {Array.from({ length: count }, (_, i) => {
          const id = offset + i;
          const order = tapped.indexOf(id);
          return (
            <button
              key={`${index}-${id}`}
              type='button'
              className={`${styles.dino} ${motion.popIn} ${solved ? styles.dance : ''}`}
              style={{ animationDelay: `${i * 70}ms` }}
              onClick={() => tapDino(id)}
              aria-label={order >= 0 ? `Dinosaur ${order + 1}` : 'Count this dinosaur'}
            >
              <GameIcon icon='dinosaur' size={56} />
              {order >= 0 && <span className={styles.badge}>{order + 1}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <GameFrame emoji='🦕' title='Räkna dinosaurier' onBack={onBack}>
      <ol className={styles.eggs} aria-label={`Round ${Math.min(index + 1, problems.length)} of ${problems.length}`}>
        {problems.map((_, i) => <li key={i} aria-hidden='true'>{i < index ? '🦖' : '🥚'}</li>)}
      </ol>

      {problem && (
        <>
          <button
            type='button'
            className={styles.question}
            onClick={() => void say(GAME_WORDS['hur många'])}
            aria-label='Hur många? Hear the question again'
          >
            🔊 ?
          </button>

          <div className={styles.field}>
            {herd(problem.a, 0)}
            {problem.b > 0 && (
              <>
                <span className={styles.plus} aria-label='plus'>+</span>
                {herd(problem.b, problem.a)}
              </>
            )}
          </div>

          <div className={styles.pad}>
            {NUMBERS.map((n) => (
              <button
                key={n}
                type='button'
                className={[
                  styles.number,
                  wrong === n ? styles.wrong : '',
                  solved && n === answer ? styles.right : '',
                ].join(' ')}
                onClick={() => void answerWith(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {done && (
        <Celebration onAgain={again}>
          <div className={styles.parade} aria-hidden='true'>
            {problems.map((_, i) => <GameIcon key={i} icon='dinosaur' size={64} />)}
          </div>
          <span className={styles.phrase}>{phrase}</span>
        </Celebration>
      )}
    </GameFrame>
  );
}
