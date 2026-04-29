import SwiftUI
import SwiftData

struct HistoryView: View {
    @Query(sort: \PrayerCompletion.completedAt, order: .reverse) private var completions: [PrayerCompletion]

    private var stats: PrayerStats { PrayerStore.stats(completions) }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                GlassEffectContainer(spacing: 16) {
                    VStack(spacing: 16) {
                        StreakBadge(streak: stats.currentStreak)
                        totalCard
                        BreakdownBar(stats: stats)
                    }
                }
                recentList
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.large)
    }

    private var totalCard: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Total prayers")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text("\(stats.total)")
                    .font(.system(.largeTitle, design: .rounded))
                    .fontWeight(.semibold)
                    .monospacedDigit()
            }
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 36))
                .foregroundStyle(.tint)
        }
        .padding(20)
        .glassEffect(in: .rect(cornerRadius: 24))
    }

    @ViewBuilder
    private var recentList: some View {
        if !completions.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text("Recent")
                    .font(.headline)
                    .padding(.horizontal, 4)
                VStack(spacing: 10) {
                    ForEach(completions.prefix(20)) { completion in
                        HStack {
                            Circle()
                                .fill(tint(for: completion.prayerType))
                                .frame(width: 10, height: 10)
                            Text(displayName(for: completion.prayerType))
                                .font(.body)
                            Spacer()
                            Text(completion.completedAt, style: .relative)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .glassEffect(in: .rect(cornerRadius: 16))
                    }
                }
            }
        } else {
            ContentUnavailableView(
                "No prayers yet",
                systemImage: "leaf",
                description: Text("Your completed prayers will appear here.")
            )
            .padding(.top, 40)
        }
    }

    private func tint(for type: String) -> Color {
        guard let id = PrayerID(rawValue: type) else { return .gray }
        return AppTheme.tint(for: id)
    }

    private func displayName(for type: String) -> String {
        guard let id = PrayerID(rawValue: type), let prayer = prayers[id] else { return type.capitalized }
        return prayer.title
    }
}
