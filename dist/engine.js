export const DAY = 86400000;
export const INTERVALS = [1, 3, 7, 14, 30];
export function rateCard(previous, grade, now = Date.now()) {
  if (!['again', 'hard', 'good'].includes(grade)) throw new Error('Invalid rating');
  const old = previous || { reviews: 0, lapses: 0, streak: 0 };
  // Extra practice must not turn three immediate clicks into spaced mastery.
  if (grade === 'good' && old.streak > 0 && old.due > now) {
    return { ...old, reviews: (old.reviews || 0) + 1, lastReviewed: now, grade };
  }
  const streak = grade === 'good' ? Math.min((old.streak || 0) + 1, 5) : 0;
  const days = grade === 'good' ? INTERVALS[streak - 1] : grade === 'hard' ? 1 : 0;
  return { reviews: (old.reviews || 0) + 1, lapses: (old.lapses || 0) + (grade === 'again' ? 1 : 0), streak, grade, lastReviewed: now, due: now + (grade === 'again' ? 600000 : days * DAY) };
}
export function ready(card, stats, now = Date.now()) { return !stats[card.id] || stats[card.id].due <= now; }
export function createQueue(cards, stats, topic = 'all', all = false, now = Date.now(), random = Math.random) {
  const pool = cards.filter(c => (topic === 'all' || c.topic === topic) && (all || ready(c, stats, now))).map(c => ({c, tie:random()}));
  // Due reviews before new cards; shuffle equal-priority cards within each topic.
  pool.sort((a,b) => Number(!!stats[b.c.id]) - Number(!!stats[a.c.id]) || a.tie - b.tie);
  if (topic !== 'all') return pool.slice(0,10).map(x=>x.c.id);
  const pattern = ['materials','grammar','pronunciation','terms','grammar','testing','materials','exam','grammar','pronunciation'];
  const selected = [];
  for (const category of pattern) {
    if (!pool.length) break;
    let index = pool.findIndex(x => x.c.topic === category);
    if (index < 0) index = 0;
    selected.push(pool.splice(index,1)[0].c.id);
  }
  return selected;
}
