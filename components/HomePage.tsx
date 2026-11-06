'use client';
import { LazyVideo } from "./LazyVideo";

import { useState, useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import Link from 'next/link';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import ResumeModal from './ResumeModal';
import Footer from './Footer';
import Navbar from './Navbar';
import styles from './HomePage.module.css';

const SPRING = { type: 'spring', stiffness: 100, damping: 20 } as const;
const PRESS = { scale: 0.97 };
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const CLD = 'https://res.cloudinary.com/kpa1wv3h';
const cldVideo = (path: string, width: number) =>
  `${CLD}/video/upload/f_auto,q_auto:good,w_${width},c_limit/${path}.mp4`;
const cldPoster = (path: string, width: number) =>
  `${CLD}/video/upload/so_1,f_auto,q_auto,w_${width},c_limit/${path}.jpg`;

const CLD_USER = 'https://res.cloudinary.com/jyr596tn';
const cldUserImg = (file: string) => `${CLD_USER}/image/upload/f_auto,q_auto:good/spaceborn_media/home/${file}`;
const cldUserVid = (file: string) => `${CLD_USER}/video/upload/f_auto,q_auto:good,w_1200,c_limit/spaceborn_media/home/${file}.mp4`;

type Tile = {
  id: string;
  name: string;
  tag?: string;
  desc: string;
  href: string;
  size: 'square' | 'wide' | 'tall';
  image: string;
  alt: string;
  video?: string;
  fit?: 'cover' | 'contain';
  position?: string;
};

const TILES: Tile[] = [
  {
    id: 'flight-controller',
    name: 'Flight Controller',
    tag: 'AUTONOMY SILICON',
    desc: 'ELARA boards from STM32F7 to STM32H7, running the ANSA autonomy stack through one HAL.',
    href: '/systems/flight-cont',
    size: 'wide',
    image: cldPoster('v1785868057/VideoProject_hzk4kg', 1200),
    video: cldVideo('v1785868057/VideoProject_hzk4kg', 1200),
    alt: 'ELARA flight controller mounted on a drone frame',
  },
  {
    id: 'elara',
    name: 'ELARA SB2',
    tag: 'HIGH-PERFORMANCE H7',
    desc: 'High-performance STM32H7 flight controller.',
    href: '/systems/flight-cont',
    size: 'tall',
    image: `${CLD_USER}/image/upload/v1793623358/spaceborn_media/home/elara-sb2.webp`,
    video: `${CLD_USER}/video/upload/f_auto,q_auto:good,w_900,c_limit/v1793631026/spaceborn_media/home/elara-sb2.mp4`,
    alt: 'ELARA SB2 flight controller on a dark surface',
  },
  {
    id: 'aria',
    name: 'ARIA 50A',
    tag: 'MOTOR ARCHITECTURE',
    desc: 'AM32 electronic speed controller with live current telemetry.',
    href: '/systems/Esc-sys',
    size: 'square',
    image: `${CLD}/image/upload/f_auto,q_auto,w_900,c_limit/v1783382813/spaceborn_assets/ESC%2050A.png`,
    alt: 'ARIA 50A electronic speed controller PCB',
    fit: 'contain',
  },
  {
    id: 'hpu',
    name: 'HPU',
    tag: 'EDGE SENSOR FUSION',
    desc: 'Multi-sensor AI edge compute for camera, LiDAR, radar, and GNSS.',
    href: '/systems/edgecompute',
    size: 'square',
    image: cldUserImg('hpu.webp'),
    alt: 'HPU edge compute board, 3D render',
    fit: 'contain',
  },
  {
    id: 'deryk',
    name: 'DERYK',
    tag: 'MISSION COGNITION',
    desc: 'Turns operator intent into executable machine action.',
    href: 'https://spaceborn-web.vercel.app/',
    size: 'wide',
    image: cldPoster('v1785966524/womanAndDrone_xjbmqm', 1200),
    video: cldVideo('v1785966524/womanAndDrone_xjbmqm', 1200),
    alt: 'Operator collaborating with autonomous drone platform in the field',
  },
  {
    id: 'certanity',
    name: 'CERTANITY',
    tag: 'SIMULATION RUNTIME',
    desc: '24+ domain simulators. Every control loop is broken here before it flies.',
    href: 'https://certanity.com/',
    size: 'square',
    image: cldPoster('v1785781462/Quadcopter_drone_hovers_in_tunnel_202608030904_hvg4oj', 1200),
    video: cldVideo('v1785781462/Quadcopter_drone_hovers_in_tunnel_202608030904_hvg4oj', 1200),
    alt: 'Quadcopter holding position inside a concrete tunnel',
    position: '68% 50%',
  },
  {
    id: 'elio',
    name: 'SB ELIO',
    tag: 'DUAL-MCU DEV BOARD',
    desc: 'Dual-MCU development board. ESP32-S3 and RP2350 on one platform.',
    href: '/systems/embedded-sdk',
    size: 'square',
    image: cldUserImg('sb-elio.webp'),
    alt: 'SB ELIO development board',
    fit: 'contain',
  },
  {
    id: 'gcs',
    name: 'GROUND CONTROL',
    tag: '50 HZ DIGITAL TWIN',
    desc: 'Live attitude and telemetry from the airframe, mirrored on a 3D digital twin at 50 Hz.',
    href: '/platforms/missionstudio',
    size: 'wide',
    image: cldUserImg('gcs-twin.webp'),
    video: cldUserVid('gcs-twin'),
    alt: 'ANSA digital twin cockpit mirroring a hand-tilted IMU board on the attitude indicator and 3D drone model',
  },
];

type Board = {
  id: string;
  tab: string;
  name: string;
  kind: string;
  desc: string;
  specs: [string, string][];
  href: string;
  image: { src: string; alt: string; width: number; height: number; fit?: 'cover' | 'contain' };
};

const BOARDS: Board[] = [
  {
    id: 'sb0',
    tab: 'ELARA SB0',
    name: 'ELARA SB0',
    kind: 'Flight controller',
    desc: '4-layer STM32F7 flight controller for advanced autonomous drones and research platforms.',
    specs: [
      ['MCU family', 'STM32F7'],
      ['PCB stack-up', '4-LAYER'],
      ['Autonomy stack', 'ANSA VIA HAL'],
    ],
    href: '/systems/flight-cont',
    image: { src: cldUserImg('elara-sb0-wide.webp'), alt: 'ELARA SB0 flight controller, top view', width: 1280, height: 960 },
  },
  {
    id: 'sb1',
    tab: 'ELARA SB1',
    name: 'ELARA SB1',
    kind: 'Flight controller',
    desc: '6-layer STM32F7 flight controller. Two additional copper layers over SB0 for power and signal routing.',
    specs: [
      ['MCU family', 'STM32F7'],
      ['PCB stack-up', '6-LAYER'],
      ['Autonomy stack', 'ANSA VIA HAL'],
    ],
    href: '/systems/flight-cont',
    image: { src: cldUserImg('elara-sb1.webp'), alt: 'ELARA SB1 flight controller wired on the bench', width: 1190, height: 896 },
  },
  {
    id: 'sb2',
    tab: 'ELARA SB2',
    name: 'ELARA SB2',
    kind: 'Flight controller',
    desc: 'High-performance STM32H7 controller with increased processing headroom, expanded connectivity, and support for complex AI workloads.',
    specs: [
      ['MCU family', 'STM32H7'],
      ['Class', 'HIGH-PERFORMANCE'],
      ['Autonomy stack', 'ANSA VIA HAL'],
    ],
    href: '/systems/flight-cont',
    image: { src: `${CLD_USER}/image/upload/v1793623358/spaceborn_media/home/elara-sb2.webp`, alt: 'ELARA SB2 flight controller', width: 1280, height: 720 },
  },
  {
    id: 'aria',
    tab: 'ARIA 50A',
    name: 'ARIA 50A',
    kind: 'Electronic speed controller',
    desc: 'Electronic speed controller with live current telemetry streamed back to the flight controller.',
    specs: [
      ['Continuous current', '50 A'],
      ['Firmware', 'AM32'],
      ['Input voltage', '3S – 6S LIPO'],
      ['Telemetry', 'LIVE CURRENT'],
      ['Board dimensions', '37 × 42.5 MM'],
    ],
    href: '/systems/Esc-sys',
    image: {
      src: `${CLD}/image/upload/f_auto,q_auto,w_900,c_limit/v1783382813/spaceborn_assets/ESC%2050A.png`,
      alt: 'ARIA 50A electronic speed controller PCB',
      width: 900,
      height: 900,
    },
  },
];

type Scenario = {
  id: string;
  title: string;
  desc: string;
  readouts: [string, string][];
  video: { src: string; poster: string; fit?: 'cover' | 'contain' };
};

const SCENARIOS: Scenario[] = [
  {
    id: 'tunnel-drone',
    title: 'GPS-denied tunnel navigation',
    desc: 'When satellites disappear, autonomy takes over. Optical flow and LiDAR point clouds hold trajectory through unmapped subterranean corridors.',
    readouts: [['GNSS', 'DENIED'], ['HOLD', 'OPTICAL FLOW'], ['TRAJECTORY', 'LOCKED']],
    video: {
      src: cldVideo('v1785966759/tunnelDrone_nhqulg', 1600),
      poster: cldPoster('v1785966759/tunnelDrone_nhqulg', 1600),
    },
  },
  {
    id: 'drone-swarm',
    title: '128-unit swarm coordination',
    desc: 'Distributed consensus and decentralized collision avoidance. Autonomous agents negotiate airspace and execute synchronized group missions.',
    readouts: [['AGENTS', '128'], ['CONSENSUS', 'SYNCED'], ['LINK', 'MESH 5.8GHZ']],
    video: {
      src: cldVideo('v1786023546/swarmFleet_x4tlds', 1600),
      poster: cldPoster('v1786023546/swarmFleet_x4tlds', 1600),
    },
  },
  {
    id: 'factory',
    title: 'Industrial inspection cell',
    desc: 'Four robot stations, a conveyor, and an inspection line in a simulated factory, proven before any arm moves on the floor.',
    readouts: [['STATIONS', '4'], ['LINE', 'INSPECTION'], ['DOMAIN', 'INDUSTRIAL']],
    video: {
      src: `${CLD_USER}/video/upload/f_auto,q_auto:good,w_1600,c_limit/v1793615952/spaceborn_media/home/sim-factory.mp4`,
      poster: `${CLD_USER}/image/upload/v1793615954/spaceborn_media/home/sim-factory.webp`,
    },
  },
];

const CYCLE_MS = 9000;

function useInView(ref: RefObject<Element | null>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}

function usePlayWhen(videoRef: RefObject<HTMLVideoElement | null>, shouldPlay: boolean, key?: unknown) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    const play = () => {
      video.play().catch(() => {});
    };
    play();
    video.addEventListener('loadeddata', play);
    return () => video.removeEventListener('loadeddata', play);
  }, [videoRef, shouldPlay, key]);
}

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede: string }) {
  return (
    <Reveal className={styles.sectionHead}>
      <div className={styles.sectionTitleBlock}>
        {eyebrow && <span className={styles.sectionEyebrow}>{eyebrow}</span>}
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <p className={styles.sectionLede}>{lede}</p>
    </Reveal>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

const WAVE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]_';

const HERO_LINES: string[][] = [
  ['AUTONOMY,', 'FROM'],
  ['THE', 'SILICON', 'UP'],
];

function HeroTitleCodeDecode({ inView }: { inView: boolean }) {
  const reduceMotion = Boolean(useReducedMotion());
  const [triggered, setTriggered] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (inView && !triggered) {
      setTriggered(true);
    }
  }, [inView, triggered]);

  useEffect(() => {
    if (reduceMotion) {
      setIsCompleted(true);
      return;
    }
    if (!triggered) return;

    let animId: number;
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      const diff = now - start;
      setElapsed(diff);

      if (diff >= 2200) {
        setIsCompleted(true);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [triggered, reduceMotion]);

  let globalNonSpace = 0;

  return (
    <>
      <span className={styles.srOnly}>AUTONOMY, FROM THE SILICON UP</span>
      <span className={styles.decodeBoard} aria-hidden="true">
        {HERO_LINES.map((words, lineIdx) => {
          const renderedWords = words.map((word, wordIdx) => {
            const chars = word.split('').map((targetChar) => {
              const k = globalNonSpace++;
              const lineDelay = lineIdx === 0 ? 180 : 280;
              const charStart = lineDelay + k * 52;
              const charLock = charStart + 300;

              const isResolved = isCompleted || reduceMotion || elapsed >= charLock;
              const isWave = !isResolved && elapsed >= charStart;
              const isHidden = !isResolved && !isWave;

              let charDisplay = targetChar;
              if (isWave) {
                const scrambleIdx =
                  (Math.floor(elapsed / 36) + k * 7) % WAVE_GLYPHS.length;
                charDisplay = WAVE_GLYPHS[scrambleIdx];
              }

              return (
                <span className={styles.charBox} key={targetChar + k}>
                  <span className={styles.charSizer} aria-hidden="true">
                    {targetChar}
                  </span>
                  <span
                    className={`${styles.decodeChar} ${
                      isResolved
                        ? styles.charResolved
                        : isWave
                        ? styles.charWave
                        : styles.charHidden
                    }`}
                  >
                    {isResolved ? targetChar : charDisplay}
                  </span>
                </span>
              );
            });

            return (
              <span key={wordIdx} className={styles.decodeWord}>
                {chars}
                {wordIdx < words.length - 1 && (
                  <span className={styles.decodeSpace}>&nbsp;</span>
                )}
              </span>
            );
          });

          return (
            <span key={lineIdx} className={styles.decodeRow}>
              {renderedWords}
            </span>
          );
        })}
      </span>
    </>
  );
}

/* ───────────── 1. Hero ───────────── */

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(sectionRef, 0.05);
  usePlayWhen(videoRef, inView);

  return (
    <section ref={sectionRef} className={styles.hero} id="releases">
      <div className={styles.heroFrame}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={cldPoster('v1785962155/droneCircuitVid_p16yvl', 1920)}
          aria-hidden="true"
        >
          <source src={cldVideo('v1785962155/droneCircuitVid_p16yvl', 720)} type="video/mp4" media="(max-width: 720px)" />
          <source src={cldVideo('v1785962155/droneCircuitVid_p16yvl', 1920)} type="video/mp4" />
        </video>
        <div className={styles.heroVignette} />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle} aria-label="AUTONOMY, FROM THE SILICON UP">
            <HeroTitleCodeDecode inView={inView} />
          </h1>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 2. Product grid ───────────── */

function ProductTile({ tile, index }: { tile: Tile; index: number }) {
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const reduceMotion = useReducedMotion();
  const isAria = tile.id === 'aria';
  const isGcs = tile.id === 'gcs';

  // Start playback well before the tile scrolls into view, so footage is ready on arrival
  useEffect(() => {
    if (!tile.video || reduceMotion) return;

    const el = tileRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          const promise = video.play();
          playPromiseRef.current = promise;
          if (promise) {
            promise
              .then(() => setPlaying(true))
              .catch(() => {});
          }
          // Never stop playing once the user scrolls near it (continuous playback)
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '800px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [tile.video, reduceMotion]);

  const start = () => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  const body = (
    <>
      <div className={styles.tileMedia}>
        <img
          className={`${tile.fit === 'contain' ? styles.tileImageContain : styles.tileImage} ${isAria ? styles.tileImageAria : ''}`}
          src={tile.image}
          alt={tile.alt}
          decoding="async"
          style={tile.position ? { objectPosition: tile.position } : undefined}
        />
        {tile.video && (
          <video
            ref={videoRef}
            className={`${styles.tileVideo} ${playing ? styles.tileVideoOn : ''}`}
            style={tile.position ? { objectPosition: tile.position } : undefined}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onPlaying={() => {
              setPlaying(true);
            }}
          >
            <source src={tile.video} type="video/mp4" />
          </video>
        )}
      </div>
      <div className={styles.tileScrim} />
      <div className={styles.tileText}>
        {tile.tag && <span className={styles.tileTag}>{tile.tag}</span>}
        <h3 className={styles.tileTitle}>{tile.name}</h3>
        <div className={styles.tileDescWrap}>
          <p className={styles.tileDesc}>{tile.desc}</p>
        </div>
      </div>
      <ArrowIcon className={styles.tileArrow} />
    </>
  );

  const handlers = { onPointerEnter: start, onFocus: start };
  const className = `${styles.tile} ${styles[tile.size]} ${isGcs ? styles.tileGcs : ''}`;

  return (
    <motion.div
      ref={tileRef}
      className={`${styles.tileCell} ${styles[tile.size]}`}
      data-tile={tile.id}
      initial={reduceMotion ? false : 'hidden'}
      whileInView="shown"
      viewport={{ once: true, margin: '300px 0px' }}
    >
      <motion.div
        className={styles.tileClip}
        variants={{
          hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
          shown: { clipPath: 'inset(0% 0% 0% 0%)' },
        }}
        transition={{ duration: 0.4, ease: EASE_IN_OUT }}
      >
        {tile.href.startsWith('http') ? (
          <a
            href={tile.href}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
            {...handlers}
          >
            {body}
          </a>
        ) : (
          <Link href={tile.href} className={className} {...handlers}>
            {body}
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}

function ProductGrid() {
  return (
    <section className={styles.section} id="platforms">
      <div className={styles.container}>
        <SectionHead
          eyebrow="01 MODULAR SYSTEMS ARCHITECTURE"
          title="ONE STACK FOR EVERY PHYSICAL MACHINE"
          lede="ANSA runs the machine. DERYK decides what it should do. Certanity proves it in simulation before it moves. Spaceborn hardware carries it into the field, across air, ground, marine, and space."
        />
        <div className={styles.tiles}>
          {TILES.map((tile, i) => (
            <ProductTile key={tile.id} tile={tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── 3. Hardware lab ───────────── */

function HardwareLab() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const board = BOARDS[active];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + BOARDS.length) % BOARDS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className={styles.section} id="systems">
      <div className={styles.container}>
        <SectionHead
          eyebrow="02 EDGE COMPUTE & SILICON SPECIFICATIONS"
          title="FLIGHT CONTROLLERS"
          lede="Board-level parameters for the ELARA flight controller line and the ARIA 50A speed controller that pairs with it. Full documentation lives on each product page."
        />

        <div className={styles.tabs} role="tablist" aria-label="Hardware" onKeyDown={onKeyDown}>
          {BOARDS.map((b, i) => (
            <button
              key={b.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`hw-tab-${b.id}`}
              aria-selected={i === active}
              aria-controls="hw-panel"
              tabIndex={i === active ? 0 : -1}
              className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
              onClick={() => setActive(i)}
            >
              {i === active && <motion.span layoutId="hw-tab-pill" className={styles.tabPill} transition={SPRING} />}
              <span className={styles.tabLabel}>{b.tab}</span>
            </button>
          ))}
        </div>

        <div className={styles.lab} role="tabpanel" id="hw-panel" aria-labelledby={`hw-tab-${board.id}`}>
          <div className={styles.labMedia}>
            <AnimatePresence initial={false}>
              <motion.img
                key={board.id}
                className={`${board.image.fit === 'contain' ? styles.labImageContain : styles.labImage} ${board.id === 'aria' ? styles.labImageAria : ''}`}
                src={board.image.src}
                alt={board.image.alt}
                width={board.image.width}
                height={board.image.height}
                decoding="async"
                initial={{ opacity: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              />
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={board.id}
              className={styles.labBody}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <h3 className={styles.labTitle}>{board.name}</h3>
              <p className={styles.labKind}>{board.kind}</p>
              <p className={styles.labDesc}>{board.desc}</p>
              <table className={styles.specTable}>
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col">Specification</th>
                  </tr>
                </thead>
                <tbody>
                  {board.specs.map(([param, spec]) => (
                    <tr key={param}>
                      <td>{param}</td>
                      <td>{spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link href={board.href} className={styles.labLink}>
                Full documentation
                <ArrowIcon className={styles.labLinkIcon} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ───────────── 4. Certanity reality engine ───────────── */

function RealityEngine() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const inView = useInView(sectionRef);
  const scenario = SCENARIOS[active];

  usePlayWhen(videoRef, inView, active);

  return (
    <section ref={sectionRef} className={styles.section} id="simulation">
      <div className={styles.container}>
        <SectionHead
          eyebrow="03 KERNEL SIMULATION RUNTIME"
          title="ANSA REALITY ENGINE"
          lede="Scenario feeds from Certanity's 24+ domain simulators. Each one exercises the same autonomy stack that ships to hardware."
        />

        <div className={styles.engine}>
          <div
            className={styles.viewport}
            role="tabpanel"
            id="sim-panel"
            aria-labelledby={`sim-tab-${scenario.id}`}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={scenario.id}
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <LazyVideo
                  ref={videoRef}
                  className={scenario.video.fit === 'contain' ? styles.viewportVideoContain : styles.viewportVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={scenario.video.poster}
                  aria-label={scenario.title}
                >
                  <source src={scenario.video.src} type="video/mp4" />
                </LazyVideo>
              </motion.div>
            </AnimatePresence>
            <div className={styles.viewportShade} />

            {/* Preserved Line Progress directly on top of the video */}
            <div className={styles.simLineProgress}>
              {SCENARIOS.map((s, i) => (
                <div
                  key={s.id}
                  className={styles.simSegmentTrack}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Switch to ${s.title}`}
                >
                  <div
                    className={`${styles.simSegmentFill} ${
                      i < active ? styles.simSegmentDone : i === active ? styles.simSegmentActive : ''
                    } ${!inView || hovering ? styles.progressPaused : ''}`}
                    style={i === active ? { animationDuration: `${CYCLE_MS}ms` } : undefined}
                    onAnimationEnd={i === active ? () => setActive((a) => (a + 1) % SCENARIOS.length) : undefined}
                  />
                </div>
              ))}
            </div>

            <div className={styles.readouts}>
              {scenario.readouts.map(([k, v]) => (
                <span key={k}>
                  {k} <b>{v}</b>
                </span>
              ))}
            </div>
          </div>

          {/* Scenario Tabs OUTSIDE the video overlay for mobile view (styled exactly like Flight Controller tabs) */}
          <div className={styles.simMobileTabs} role="tablist" aria-label="Simulation scenarios">
            {SCENARIOS.map((s, i) => {
              const label = i === 0 ? 'GPS-DENIED' : i === 1 ? '128 SWARM' : 'INSPECTION';
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`sim-mob-tab-${s.id}`}
                  aria-selected={i === active}
                  tabIndex={i === active ? 0 : -1}
                  className={`${styles.simMobileTab} ${i === active ? styles.simMobileTabActive : ''}`}
                  onClick={() => setActive(i)}
                >
                  {i === active && (
                    <motion.span
                      layoutId="sim-mobile-tab-pill"
                      className={styles.simMobileTabPill}
                      transition={SPRING}
                    />
                  )}
                  <span className={styles.simMobileTabLabel}>{label}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.simList} role="tablist" aria-label="Simulation scenarios" aria-orientation="vertical">
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                role="tab"
                id={`sim-tab-${s.id}`}
                aria-selected={i === active}
                aria-controls="sim-panel"
                className={`${styles.simTab} ${i === active ? styles.simTabActive : ''}`}
                onClick={() => setActive(i)}
                whileTap={PRESS}
                transition={SPRING}
              >
                <span className={styles.simTabTitle}>{s.title}</span>
                <span className={styles.simTabDesc}>{s.desc}</span>
                {i === active && (
                  <span
                    key={`progress-${active}`}
                    className={`${styles.progress} ${!inView || hovering ? styles.progressPaused : ''}`}
                    style={{ animationDuration: `${CYCLE_MS}ms` }}
                    onAnimationEnd={() => setActive((a) => (a + 1) % SCENARIOS.length)}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Closing ───────────── */

function Closing({ onResume }: { onResume: () => void }) {
  return (
    <section className={styles.closing} id="simulators-hub">
      <span id="thoth" />
      <div className={`${styles.container} ${styles.closingInner}`}>
        <Reveal>
          <h2 className={styles.closingTitle}>BUILD THE AUTONOMOUS MACHINE FUTURE WITH US</h2>
        </Reveal>
        <Reveal className={styles.ctaRow} delay={0.06}>
          <motion.div whileTap={PRESS} transition={SPRING}>
            <a
              href="https://www.linkedin.com/in/adarsh-kumar-ab8111377?originalSubdomain=in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              Contact engineering
            </a>
          </motion.div>
          <motion.button type="button" className={styles.btnGhost} onClick={onResume} whileTap={PRESS} transition={SPRING}>
            Share your resume
          </motion.button>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <Navbar />

      <main className={styles.page}>
        <Hero />
        <ProductGrid />
        <HardwareLab />
        <RealityEngine />
        <Closing onResume={() => setIsResumeModalOpen(true)} />
      </main>

      <Footer />

      {isResumeModalOpen && (
        <ResumeModal onClose={() => setIsResumeModalOpen(false)} />
      )}
    </MotionConfig>
  );
}