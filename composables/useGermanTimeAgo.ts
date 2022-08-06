import type { MaybeRef } from '@vueuse/core'

type UseTimeAgoFormatter<T = number> = (value: T, isPast: boolean) => string

interface UseTimeAgoMessages {
  justNow: string
  past: string | UseTimeAgoFormatter<string>
  future: string | UseTimeAgoFormatter<string>
  year: string | UseTimeAgoFormatter<number>
  month: string | UseTimeAgoFormatter<number>
  day: string | UseTimeAgoFormatter<number>
  week: string | UseTimeAgoFormatter<number>
  hour: string | UseTimeAgoFormatter<number>
  minute: string | UseTimeAgoFormatter<number>
  second: string | UseTimeAgoFormatter<number>
}

export const useGermanTimeAgo = (date: MaybeRef<Date>) => {
  const GERMAN_MESSAGES: UseTimeAgoMessages = {
    justNow: 'gerade eben',
    past: n => n.match(/\d/) ? `vor ${n}` : n,
    future: n => n.match(/\d/) ? `in ${n}` : n,
    month: (n, past) => n === 1
      ? past
        ? 'letzter Monat'
        : 'nächster Monat'
      : `${n} Monat${n > 1 ? 'en' : ''}`,
    year: (n, past) => n === 1
      ? past
        ? 'letztes Jahr'
        : 'nächstes Jahr'
      : `${n} Jahr${n > 1 ? 'en' : ''}`,
    day: (n, past) => n === 1
      ? past
        ? 'gestern'
        : 'morgen'
      : `${n} Tag${n > 1 ? 'en' : ''}`,
    week: (n, past) => n === 1
      ? past
        ? 'letzte Woche'
        : 'nächste Woche'
      : ` ${n} Woche${n > 1 ? 'n' : ''}`,
    hour: n => `${n} Stunde${n > 1 ? 'n' : ''}`,
    minute: n => `${n} Minute${n > 1 ? 'n' : ''}`,
    second: n => `${n} Sekunde${n > 1 ? 'n' : ''}`,
  }
  return useTimeAgo(date, {
    messages: GERMAN_MESSAGES,
    max: 'week',
    fullDateFormatter: (localDate: Date) => localDate.toLocaleDateString('de-DE', { dateStyle: 'medium' }),
  })
}
