import Foundation
import SwiftData

@Model
final class PrayerCompletion {
    @Attribute(.unique) var id: UUID
    var prayerType: String
    var completedAt: Date

    init(prayerType: String, completedAt: Date = .now) {
        self.id = UUID()
        self.prayerType = prayerType
        self.completedAt = completedAt
    }
}
