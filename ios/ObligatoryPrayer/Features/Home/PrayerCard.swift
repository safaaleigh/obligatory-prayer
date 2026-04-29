import SwiftUI

struct PrayerCard: View {
    let prayer: Prayer
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .bottomLeading) {
                AppTheme.gradient(for: prayer.id)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Spacer()
                        PlaceholderIllustration(slot: slot)
                            .frame(width: 64, height: 64)
                            .foregroundStyle(.white.opacity(0.85))
                    }

                    Spacer(minLength: 0)

                    VStack(alignment: .leading, spacing: 6) {
                        Text(prayer.title)
                            .font(.system(.title2, design: .serif))
                            .fontWeight(.semibold)
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.25), radius: 6, y: 1)
                        Text(prayer.timing)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.9))
                            .lineLimit(2)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .glassEffect(in: .rect(cornerRadius: 18))
                }
                .padding(18)
            }
            .frame(height: 220)
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(prayer.title). \(prayer.timing)")
        .accessibilityAddTraits(.isButton)
    }

    private var slot: PlaceholderIllustration.Slot {
        switch prayer.id {
        case .short:  return .sparkles
        case .medium: return .scroll
        case .long:   return .flame
        }
    }
}
