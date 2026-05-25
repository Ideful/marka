/**
 * Логи с датой и временем. Используй вместо console.* там, где нужен явный штамп.
 * На сервере (RSC) время в таймзоне процесса Node; в браузере — локаль пользователя.
 */
export function formatLogTimestamp(date: Date = new Date()): string {
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function stamp(): string {
  return formatLogTimestamp();
}

export const logger = {
  log(...args: unknown[]) {
    console.log(`[${stamp()}]`, ...args);
  },

  info(...args: unknown[]) {
    console.info(`[${stamp()}]`, ...args);
  },

  warn(...args: unknown[]) {
    console.warn(`[${stamp()}]`, ...args);
  },

  error(...args: unknown[]) {
    console.error(`[${stamp()}]`, ...args);
  },

  /** Только в development (Next подставляет NODE_ENV при сборке) */
  debug(...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${stamp()}] [DEBUG]`, ...args);
    }
  },
} as const;
