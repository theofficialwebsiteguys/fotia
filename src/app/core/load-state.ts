import { Observable, catchError, map, of, startWith } from 'rxjs';

export type LoadState<T> = { status: 'loading' } | { status: 'ready'; value: T } | { status: 'error' };

/** Wraps a data stream with explicit loading and error states. Emits `loading` synchronously. */
export function loadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((value): LoadState<T> => ({ status: 'ready', value })),
    startWith<LoadState<T>>({ status: 'loading' }),
    catchError(() => of<LoadState<T>>({ status: 'error' })),
  );
}
