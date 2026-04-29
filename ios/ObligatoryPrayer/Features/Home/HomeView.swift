import SwiftUI

struct HomeView: View {
    let onSelect: (PrayerID) -> Void
    let onHistory: () -> Void

    private let order: [PrayerID] = [.short, .medium, .long]

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                header
                ForEach(order, id: \.self) { id in
                    if let prayer = prayers[id] {
                        PrayerCard(prayer: prayer) { onSelect(id) }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .background(.background)
        .navigationTitle("Prayers")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: onHistory) {
                    Image(systemName: "book.closed.fill")
                }
                .accessibilityLabel("View history")
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Obligatory Prayer")
                .font(.system(.largeTitle, design: .serif))
                .fontWeight(.semibold)
            Text("Choose one to recite")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.bottom, 4)
    }
}
