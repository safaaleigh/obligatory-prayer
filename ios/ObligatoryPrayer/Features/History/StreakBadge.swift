import SwiftUI

struct StreakBadge: View {
    let streak: Int

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: "flame.fill")
                .font(.system(size: 36))
                .foregroundStyle(.orange)
                .symbolEffect(.pulse, options: .repeating, isActive: streak > 0)
            VStack(alignment: .leading, spacing: 4) {
                Text("Current streak")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("\(streak) \(streak == 1 ? "day" : "days")")
                    .font(.system(.largeTitle, design: .rounded))
                    .fontWeight(.semibold)
                    .monospacedDigit()
                    .contentTransition(.numericText())
            }
            Spacer()
        }
        .padding(20)
        .glassEffect(in: .rect(cornerRadius: 24))
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Current streak \(streak) \(streak == 1 ? "day" : "days")")
    }
}
