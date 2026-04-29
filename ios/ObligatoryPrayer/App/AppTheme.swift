import SwiftUI

enum AppTheme {
    static func gradient(for id: PrayerID) -> some View {
        MeshGradient(
            width: 3, height: 3,
            points: [
                [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
                [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
                [0.0, 1.0], [0.5, 1.0], [1.0, 1.0]
            ],
            colors: meshColors(for: id)
        )
    }

    static func backgroundGradient(for id: PrayerID) -> some View {
        gradient(for: id).opacity(0.35).ignoresSafeArea()
    }

    private static func meshColors(for id: PrayerID) -> [Color] {
        switch id {
        case .short:
            return [
                .blue, Color(red: 0.30, green: 0.65, blue: 0.95), .cyan,
                Color(red: 0.40, green: 0.75, blue: 0.95), .teal, Color(red: 0.55, green: 0.85, blue: 0.95),
                Color(red: 0.70, green: 0.90, blue: 1.00), .cyan, Color(red: 0.60, green: 0.85, blue: 0.95)
            ]
        case .medium:
            return [
                .purple, Color(red: 0.70, green: 0.40, blue: 0.85), .pink,
                Color(red: 0.80, green: 0.50, blue: 0.90), Color(red: 0.85, green: 0.55, blue: 0.85), Color(red: 0.95, green: 0.55, blue: 0.75),
                Color(red: 0.90, green: 0.65, blue: 0.90), .pink, Color(red: 0.95, green: 0.70, blue: 0.85)
            ]
        case .long:
            return [
                Color(red: 1.00, green: 0.75, blue: 0.30), Color(red: 1.00, green: 0.65, blue: 0.25), .orange,
                Color(red: 1.00, green: 0.78, blue: 0.40), Color(red: 1.00, green: 0.70, blue: 0.30), Color(red: 0.98, green: 0.55, blue: 0.20),
                Color(red: 1.00, green: 0.85, blue: 0.55), Color(red: 1.00, green: 0.78, blue: 0.40), Color(red: 1.00, green: 0.65, blue: 0.30)
            ]
        }
    }

    static func tint(for id: PrayerID) -> Color {
        switch id {
        case .short: return .blue
        case .medium: return .purple
        case .long: return .orange
        }
    }
}
