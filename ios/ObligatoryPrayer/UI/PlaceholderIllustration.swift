import SwiftUI

struct PlaceholderIllustration: View {
    enum Slot {
        case sprout, scroll, flame, sparkles
    }

    let slot: Slot

    var body: some View {
        Image(systemName: symbolName)
            .resizable()
            .scaledToFit()
            .symbolRenderingMode(.hierarchical)
            .accessibilityLabel(label)
    }

    private var symbolName: String {
        switch slot {
        case .sprout:    return "leaf.fill"
        case .scroll:    return "scroll"
        case .flame:     return "flame.fill"
        case .sparkles:  return "sparkles"
        }
    }

    private var label: String {
        switch slot {
        case .sprout:    return "Sprout illustration"
        case .scroll:    return "Scroll illustration"
        case .flame:     return "Flame illustration"
        case .sparkles:  return "Sparkles illustration"
        }
    }
}
