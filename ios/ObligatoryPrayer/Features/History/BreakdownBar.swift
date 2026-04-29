import SwiftUI

struct BreakdownBar: View {
    let stats: PrayerStats

    private var segments: [(id: PrayerID, count: Int)] {
        [(.short, stats.short), (.medium, stats.medium), (.long, stats.long)]
    }

    private var total: Int { max(stats.total, 1) }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("By prayer")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            GeometryReader { geo in
                HStack(spacing: 2) {
                    ForEach(segments, id: \.id) { segment in
                        let frac = Double(segment.count) / Double(total)
                        Rectangle()
                            .fill(AppTheme.tint(for: segment.id))
                            .frame(width: max(0, geo.size.width * frac))
                            .opacity(stats.total == 0 ? 0 : 1)
                    }
                }
                .clipShape(Capsule())
                .background(
                    Capsule().fill(.quaternary)
                )
            }
            .frame(height: 14)

            HStack(spacing: 16) {
                ForEach(segments, id: \.id) { segment in
                    Label {
                        Text("\(segment.count)").monospacedDigit()
                    } icon: {
                        Circle()
                            .fill(AppTheme.tint(for: segment.id))
                            .frame(width: 8, height: 8)
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }
            }
        }
        .padding(20)
        .glassEffect(in: .rect(cornerRadius: 24))
    }
}
