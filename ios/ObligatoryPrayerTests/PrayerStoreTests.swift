import XCTest
@testable import ObligatoryPrayer

final class PrayerStoreTests: XCTestCase {
    private let cal = Calendar(identifier: .gregorian)
    private let now = Date(timeIntervalSince1970: 1_750_000_000)

    private func completion(daysAgo: Int, type: PrayerID = .short) -> PrayerCompletion {
        let day = cal.date(byAdding: .day, value: -daysAgo, to: cal.startOfDay(for: now))!
        let withTime = day.addingTimeInterval(60 * 60 * 12)
        return PrayerCompletion(prayerType: type.rawValue, completedAt: withTime)
    }

    func testEmptyStoreYieldsZeros() {
        let s = PrayerStore.stats([], calendar: cal, now: now)
        XCTAssertEqual(s, PrayerStats.empty)
    }

    func testTodayCompletionGivesStreakOne() {
        let s = PrayerStore.stats([completion(daysAgo: 0)], calendar: cal, now: now)
        XCTAssertEqual(s.currentStreak, 1)
        XCTAssertEqual(s.total, 1)
    }

    func testConsecutiveDaysAccumulate() {
        let items = (0...4).map { completion(daysAgo: $0) }
        let s = PrayerStore.stats(items, calendar: cal, now: now)
        XCTAssertEqual(s.currentStreak, 5)
    }

    func testGapBreaksStreak() {
        let items = [completion(daysAgo: 0), completion(daysAgo: 2), completion(daysAgo: 3)]
        let s = PrayerStore.stats(items, calendar: cal, now: now)
        XCTAssertEqual(s.currentStreak, 1)
        XCTAssertEqual(s.total, 3)
    }

    func testMissingTodayGivesZeroStreak() {
        let items = [completion(daysAgo: 1), completion(daysAgo: 2)]
        let s = PrayerStore.stats(items, calendar: cal, now: now)
        XCTAssertEqual(s.currentStreak, 0)
    }

    func testMultipleSameDayCountsOnceForStreak() {
        let items = [completion(daysAgo: 0), completion(daysAgo: 0), completion(daysAgo: 1)]
        let s = PrayerStore.stats(items, calendar: cal, now: now)
        XCTAssertEqual(s.currentStreak, 2)
        XCTAssertEqual(s.total, 3)
    }

    func testCountsByType() {
        let items = [
            completion(daysAgo: 0, type: .short),
            completion(daysAgo: 0, type: .medium),
            completion(daysAgo: 1, type: .long),
            completion(daysAgo: 2, type: .short)
        ]
        let s = PrayerStore.stats(items, calendar: cal, now: now)
        XCTAssertEqual(s.short, 2)
        XCTAssertEqual(s.medium, 1)
        XCTAssertEqual(s.long, 1)
        XCTAssertEqual(s.total, 4)
    }
}
