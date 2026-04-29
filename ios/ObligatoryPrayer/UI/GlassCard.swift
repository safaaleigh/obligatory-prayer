import SwiftUI

struct GlassCard<Content: View>: View {
    var cornerRadius: CGFloat = 24
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(20)
            .glassEffect(in: .rect(cornerRadius: cornerRadius))
    }
}
