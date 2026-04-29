import SwiftUI
import SwiftData

@main
struct ObligatoryPrayerApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: PrayerCompletion.self)
    }
}
