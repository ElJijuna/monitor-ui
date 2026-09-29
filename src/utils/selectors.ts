import type {
  DeviceSnapshot,
  EventSnapshot,
  NetworkSnapshot,
  ReactSnapshot,
} from 'monitor-api';

/*
  Snapshot selectors for the monitor-api hooks (`useNetwork(monitor, selectWindow5s, shallowEqual)`).
  A component re-renders only when its selection changes. They live at module scope because the
  hooks memoize on the selector's identity.
*/

/** Rolling 5 s stats; pair with `shallowEqual`, the object is rebuilt on every recompute. */
export const selectWindow5s = (snapshot: NetworkSnapshot) => snapshot.window5s;

export const selectNetworkEntries = (snapshot: NetworkSnapshot) => snapshot.entries;

export const selectEventEntries = (snapshot: EventSnapshot) => snapshot.entries;

/** Commit counters and slow renders; pair with `shallowEqual`. */
export const selectReactSummary = ({
  slowComponents,
  totalCommits,
  truncatedCommits,
}: ReactSnapshot) => ({ slowComponents, totalCommits, truncatedCommits });

/** `false` only when the browser reports no network; `null` before `start()` or where unknown. */
export const selectOnline = (snapshot: DeviceSnapshot) => snapshot.online;
