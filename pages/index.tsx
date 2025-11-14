import { useEffect, useMemo, useState } from 'react';

type Theme = 'winter' | 'summer';

type Duration = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const START_DATE = new Date('2025-06-23T00:00:00+09:00');
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const milestonePlan = [
  { label: '100日記念', days: 100 },
  { label: '200日目の節目', days: 200 },
  { label: '365日 (1周年)', days: 365 },
  { label: '500日の思い出', days: 500 },
  { label: '1000日の約束', days: 1000 },
];

const themeCopy: Record<Theme, { title: string; message: string; poetic: string }> = {
  winter: {
    title: '冬のきらめき',
    message: '静かに降る雪のように、ふたりの時間も積み重ねていく。',
    poetic: '吐息の白さが、ふたりの距離をより近づける季節。',
  },
  summer: {
    title: '夏のときめき',
    message: 'まぶしい陽射しの下でも、影まで寄り添うふたり。',
    poetic: '波音と笑い声が、記念日の鼓動を刻む季節。',
  },
};

const formatDuration = (diffMs: number): Duration => {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const pad = (value: number) => value.toString().padStart(2, '0');

export default function Home() {
  const [now, setNow] = useState(() => new Date());
  const [theme, setTheme] = useState<Theme>('winter');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const diffMs = useMemo(() => now.getTime() - START_DATE.getTime(), [now]);
  const hasStarted = diffMs >= 0;
  const totalDays = hasStarted ? Math.floor(diffMs / DAY_IN_MS) : 0;
  const detailedDuration = useMemo(() => formatDuration(Math.abs(diffMs)), [diffMs]);
  const futureMessage = !hasStarted
    ? `大切なスタートまではあと${detailedDuration.days}日 ${pad(detailedDuration.hours)}:${pad(
        detailedDuration.minutes,
      )}:${pad(detailedDuration.seconds)}`
    : '';

  const milestoneCards = useMemo(() => {
    return milestonePlan.map((milestone) => {
      const remaining = milestone.days - totalDays;
      const reached = remaining <= 0;
      const tone = reached ? '達成済み' : `あと${remaining}日`;
      return (
        <div key={milestone.label} className={`milestone-card ${reached ? 'milestone-card--done' : ''}`}>
          <p className="milestone-card__label">{milestone.label}</p>
          <p className="milestone-card__value">{milestone.days}日</p>
          <p className="milestone-card__status">{tone}</p>
        </div>
      );
    });
  }, [totalDays]);

  const detailList = useMemo(() => {
    const duration = hasStarted ? detailedDuration : formatDuration(START_DATE.getTime() - now.getTime());
    return [
      { label: '日数', value: `${duration.days} days` },
      { label: '時間', value: `${pad(duration.hours)} hours` },
      { label: '分', value: `${pad(duration.minutes)} minutes` },
      { label: '秒', value: `${pad(duration.seconds)} seconds` },
    ];
  }, [detailedDuration, hasStarted, now]);

  return (
    <main className={`page page--${theme}`}>
      <section className="hero-card">
        <div className="hero-card__header">
          <div>
            <p className="eyebrow">2025.06.23 からの歩み</p>
            <h1>{hasStarted ? `今日は ${totalDays} 日目` : 'カウントダウン中'}</h1>
            <p className="lead">{themeCopy[theme].message}</p>
          </div>
          <button className="season-toggle" onClick={() => setTheme(theme === 'winter' ? 'summer' : 'winter')}>
            <span>{theme === 'winter' ? '夏の風に切り替える' : '冬の風に切り替える'}</span>
          </button>
        </div>

        <div className="hero-card__stats">
          <div className="hero-card__days">
            <p className="hero-card__days-number">{totalDays}</p>
            <p className="hero-card__days-label">total days</p>
          </div>
          <div className="hero-card__detail-grid">
            {detailList.map((item) => (
              <div key={item.label} className="detail-pill">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {!hasStarted && <p className="countdown-message">{futureMessage}</p>}
      </section>

      <section className="story-panel">
        <div className="story-panel__copy">
          <p className="story-panel__title">{themeCopy[theme].title}</p>
          <p className="story-panel__poetic">{themeCopy[theme].poetic}</p>
          <p className="story-panel__meta">
            出会ってからの特別な瞬間を一枚のキャンバスに描くように、このアプリは二人の時間を静かに数え続け
            ます。
          </p>
        </div>
        <div className="story-panel__timeline">
          {milestonePlan.slice(0, 3).map((milestone, index) => {
            const pointDays = milestone.days;
            const filled = totalDays >= pointDays;
            return (
              <div key={milestone.label} className="timeline-row">
                <div className={`timeline-dot ${filled ? 'timeline-dot--filled' : ''}`}></div>
                <div>
                  <p className="timeline-label">{milestone.label}</p>
                  <p className="timeline-meta">{pointDays}日目</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="milestone-grid">
        <h2>これからのハイライト</h2>
        <div className="milestone-grid__cards">{milestoneCards}</div>
      </section>
    </main>
  );
}
