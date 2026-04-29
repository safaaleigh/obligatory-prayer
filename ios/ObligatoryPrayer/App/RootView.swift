import SwiftUI

enum AppRoute: Hashable {
    case recite(PrayerID)
    case history
}

struct RootView: View {
    @State private var path: [AppRoute] = []

    var body: some View {
        NavigationStack(path: $path) {
            HomeView(onSelect: { path.append(.recite($0)) },
                     onHistory: { path.append(.history) })
                .navigationDestination(for: AppRoute.self) { route in
                    switch route {
                    case .recite(let id):
                        if let prayer = prayers[id] {
                            RecitationView(prayer: prayer,
                                           onHome: { path.removeAll() },
                                           onHistory: { path = [.history] })
                                .toolbar(.hidden, for: .navigationBar)
                        }
                    case .history:
                        HistoryView()
                    }
                }
        }
    }
}
