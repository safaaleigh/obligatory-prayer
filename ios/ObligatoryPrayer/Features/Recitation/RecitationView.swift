import SwiftUI
import SwiftData
import UIKit

struct RecitationView: View {
    let prayer: Prayer
    let onHome: () -> Void
    let onHistory: () -> Void

    @Environment(\.modelContext) private var ctx
    @Environment(\.dismiss) private var dismiss

    @State private var currentPhraseID: UUID?
    @State private var didSave = false

    private var lastID: UUID? { prayer.phrases.last?.id }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView(.vertical) {
                LazyVStack(spacing: 0) {
                    ForEach(prayer.phrases) { phrase in
                        Group {
                            if phrase.id == lastID {
                                CompletionPage(prayer: prayer,
                                               saved: didSave,
                                               onHome: onHome,
                                               onHistory: onHistory)
                            } else {
                                PhrasePage(phrase: phrase, tint: AppTheme.tint(for: prayer.id))
                            }
                        }
                        .containerRelativeFrame(.vertical)
                        .id(phrase.id)
                    }
                }
                .scrollTargetLayout()
            }
            .scrollTargetBehavior(.paging)
            .scrollPosition(id: $currentPhraseID)
            .scrollIndicators(.hidden)
            .ignoresSafeArea()
            .background {
                AppTheme.backgroundGradient(for: prayer.id)
            }
            .focusable()
            .focusEffectDisabled()
            .onKeyPress(.downArrow)  { advance(+1, proxy: proxy); return .handled }
            .onKeyPress(.upArrow)    { advance(-1, proxy: proxy); return .handled }
            .onKeyPress(.rightArrow) { advance(+1, proxy: proxy); return .handled }
            .onKeyPress(.leftArrow)  { advance(-1, proxy: proxy); return .handled }
            .onAppear {
                if currentPhraseID == nil { currentPhraseID = prayer.phrases.first?.id }
            }
            .onChange(of: currentPhraseID) { _, newID in
                guard let newID else { return }
                UIImpactFeedbackGenerator(style: .soft).impactOccurred()
                if newID == lastID, !didSave {
                    didSave = true
                    UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
                    let completion = PrayerCompletion(prayerType: prayer.id.rawValue)
                    ctx.insert(completion)
                    try? ctx.save()
                }
            }
            .overlay(alignment: .topLeading) { closeButton }
            .overlay(alignment: .bottomTrailing) { progressPill }
        }
    }

    private var currentIndex: Int {
        guard let currentPhraseID,
              let idx = prayer.phrases.firstIndex(where: { $0.id == currentPhraseID })
        else { return 0 }
        return idx
    }

    private func advance(_ delta: Int, proxy: ScrollViewProxy) {
        let next = max(0, min(prayer.phrases.count - 1, currentIndex + delta))
        let target = prayer.phrases[next].id
        withAnimation(.smooth) {
            proxy.scrollTo(target, anchor: .top)
        }
        currentPhraseID = target
    }

    private var closeButton: some View {
        Button { dismiss() } label: {
            Image(systemName: "xmark")
                .font(.system(size: 14, weight: .semibold))
                .frame(width: 36, height: 36)
        }
        .buttonStyle(.glass)
        .buttonBorderShape(.circle)
        .padding(.top, 12)
        .padding(.leading, 16)
        .accessibilityLabel("Close")
    }

    private var progressPill: some View {
        Text("\(currentIndex + 1) / \(prayer.phrases.count)")
            .font(.system(size: 13, weight: .medium, design: .rounded))
            .monospacedDigit()
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .glassEffect(in: .capsule)
            .padding(.bottom, 24)
            .padding(.trailing, 20)
            .allowsHitTesting(false)
    }
}
