import { parseISO, format, isWithinInterval, setHours, setMinutes } from "date-fns"

export interface ReminderConfig {
  enabled: boolean
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  intervalMinutes: number
  quietHoursFrom?: string | null
  quietHoursTo?: string | null
  daysOfWeek: number[]
  smartMode: boolean
}

export interface ScheduledReminder {
  scheduledAt: Date
  message: string
  skipped: boolean
  reason?: string
}

/**
 * Parse "HH:MM" string into hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h = 0, m = 0] = timeStr.split(":").map(Number)
  return { hours: h, minutes: m }
}

/**
 * Generate reminder schedule for today
 */
export function generateDailyReminderSchedule(
  config: ReminderConfig,
  currentWaterMl: number,
  goalMl: number
): ScheduledReminder[] {
  if (!config.enabled) return []

  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay() // 1=Mon, 7=Sun

  // Check if today is an active day
  if (!config.daysOfWeek.includes(dayOfWeek)) return []

  const { hours: startH, minutes: startM } = parseTime(config.startTime)
  const { hours: endH, minutes: endM } = parseTime(config.endTime)

  const startDate = setMinutes(setHours(today, startH), startM)
  const endDate = setMinutes(setHours(today, endH), endM)

  const reminders: ScheduledReminder[] = []
  let current = new Date(startDate)

  while (current <= endDate) {
    const scheduledAt = new Date(current)
    let skipped = false
    let reason = ""

    // Check quiet hours
    if (config.quietHoursFrom && config.quietHoursTo) {
      const { hours: qfH, minutes: qfM } = parseTime(config.quietHoursFrom)
      const { hours: qtH, minutes: qtM } = parseTime(config.quietHoursTo)
      const quietFrom = setMinutes(setHours(today, qfH), qfM)
      const quietTo = setMinutes(setHours(today, qtH), qtM)
      if (scheduledAt >= quietFrom && scheduledAt <= quietTo) {
        skipped = true
        reason = "quiet hours"
      }
    }

    // Smart mode: skip if goal already met
    if (config.smartMode && currentWaterMl >= goalMl) {
      skipped = true
      reason = "goal already met"
    }

    const remainingMl = Math.max(0, goalMl - currentWaterMl)
    const message = remainingMl > 0
      ? `💧 Drink water! ${remainingMl}ml remaining to reach your goal.`
      : "🎉 You've hit your water goal today! Great job!"

    reminders.push({ scheduledAt, message, skipped, reason: reason || undefined })

    // Advance by interval
    current = new Date(current.getTime() + config.intervalMinutes * 60 * 1000)
  }

  return reminders
}

/**
 * Get the next reminder time from now
 */
export function getNextReminderTime(
  config: ReminderConfig,
  currentWaterMl: number,
  goalMl: number
): Date | null {
  if (!config.enabled) return null
  if (config.smartMode && currentWaterMl >= goalMl) return null

  const schedule = generateDailyReminderSchedule(config, currentWaterMl, goalMl)
  const now = new Date()
  const next = schedule.find((r) => !r.skipped && r.scheduledAt > now)
  return next?.scheduledAt ?? null
}
