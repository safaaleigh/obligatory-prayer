import Foundation

struct PrayerStats: Equatable {
    var total: Int
    var currentStreak: Int
    var short: Int
    var medium: Int
    var long: Int

    static let empty = PrayerStats(total: 0, currentStreak: 0, short: 0, medium: 0, long: 0)
}

enum PrayerStore {
    static func stats(_ all: [PrayerCompletion],
                      calendar: Calendar = .current,
                      now: Date = .now) -> PrayerStats {
        let dayKeys = Set(all.map { calendar.startOfDay(for: $0.completedAt) })

        var streak = 0
        var cursor = calendar.startOfDay(for: now)
        while dayKeys.contains(cursor) {
            streak += 1
            guard let prev = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = prev
        }

        let by = Dictionary(grouping: all, by: \.prayerType).mapValues(\.count)
        return PrayerStats(
            total: all.count,
            currentStreak: streak,
            short: by[PrayerID.short.rawValue] ?? 0,
            medium: by[PrayerID.medium.rawValue] ?? 0,
            long: by[PrayerID.long.rawValue] ?? 0
        )
    }
}
