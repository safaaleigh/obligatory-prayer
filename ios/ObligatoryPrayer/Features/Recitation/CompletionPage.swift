import SwiftUI

struct CompletionPage: View {
    let prayer: Prayer
    let saved: Bool
    let onHome: () -> Void
    let onHistory: () -> Void

    var body: some View {
        VStack(spacing: 36) {
            Spacer(minLength: 0)

            PlaceholderIllustration(slot: .sprout)
                .frame(width: 180, height: 180)
                .foregroundStyle(AppTheme.tint(for: prayer.id))
                .symbolEffect(.bounce, value: saved)

            VStack(spacing: 6) {
                Text("Prayer completed")
                    .font(.system(.title2, design: .serif))
                    .fontWeight(.semibold)
                Text(prayer.title)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            GlassEffectContainer(spacing: 16) {
                HStack(spacing: 16) {
                    Button(action: onHome) {
                        Label("Home", systemImage: "house.fill")
                            .labelStyle(.iconOnly)
                            .frame(width: 56, height: 56)
                    }
                    .buttonStyle(.glass)
                    .buttonBorderShape(.circle)
                    .disabled(!saved)
                    .accessibilityLabel("Back to home")

                    Button(action: onHistory) {
                        Label("History", systemImage: "book.closed.fill")
                            .labelStyle(.iconOnly)
                            .frame(width: 56, height: 56)
                    }
                    .buttonStyle(.glass)
                    .buttonBorderShape(.circle)
                    .disabled(!saved)
                    .accessibilityLabel("View history")
                }
            }

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.horizontal, 28)
    }
}
