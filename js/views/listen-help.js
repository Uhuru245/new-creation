// After listening to a chapter that belongs to the current plan, offer to mark it as read (never automatic).
import { toast } from '../util.js';
import { S, setRead, keyRead } from '../state.js';
import { bookName } from '../bible.js';
export function offerMarkRead(it) {
  const key = `${it.b}.${it.c}`;
  if (!S.plan || !S.plan.positions[key] || keyRead(key)) return;
  toast(`Finished listening to ${bookName(it.b)} ${it.c}.`, { label: 'Mark as read', run: () => setRead([key], true).then(() => toast(`${bookName(it.b)} ${it.c} marked as read.`)) }, 9000);
}
