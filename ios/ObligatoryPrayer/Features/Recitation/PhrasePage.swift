import SwiftUI

struct PhrasePage: View {
    let phrase: Phrase
    let tint: Color

    var body: some View {
        VStack {
            Spacer(minLength: 0)
            switch phrase.kind {
            case .instruction:
                Text(phrase.text)
                    .font(.title3)
                    .italic()
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(6)
                    .frame(maxWidth: 540)
                    .padding(.horizontal, 28)
            case .prayer:
                Text(phrase.text)
                    .font(.system(.title, design: .serif))
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(8)
                    .frame(maxWidth: 580)
                    .padding(.horizontal, 28)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(phrase.text)
    }
}
