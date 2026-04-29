# Obligatory Prayer — iOS

Native SwiftUI port of the web app. Targets **iOS 26+** for native Liquid Glass.

## Local development

```bash
brew install xcodegen
cd ios
xcodegen generate
open ObligatoryPrayer.xcodeproj
```

Xcode → run on an iPhone 16 Pro simulator (or newer) on iOS 26+.

The Xcode project is regenerated from `project.yml` and is git-ignored. Edit
`project.yml` to add files, settings, or schemes — never commit changes inside
`ObligatoryPrayer.xcodeproj/`.

## Architecture

- **Storage:** SwiftData. One `@Model PrayerCompletion`. No server, no auth.
- **Prayer text:** Bundled at compile time in `ObligatoryPrayer/Data/Prayers.swift`.
- **Scroll mechanic:** `ScrollView` + `.scrollTargetBehavior(.paging)` +
  `.containerRelativeFrame(.vertical)` per phrase + `.scrollPosition(id:)` for
  tracking. Hardware keyboard arrows handled via `.onKeyPress`.
- **Liquid Glass:** `.glassEffect(in:)`, `.buttonStyle(.glass)`,
  `GlassEffectContainer`, plus `MeshGradient` per-prayer backgrounds.
- **Illustrations:** `PlaceholderIllustration` wraps SF Symbols today; swap to
  asset images later without changing call sites.

## TestFlight via GitHub Actions

The pipeline lives at `.github/workflows/testflight.yml`. It runs on `macos-latest`,
generates the Xcode project from `project.yml`, archives, exports, and uploads
via `xcrun altool` using an App Store Connect API key.

### Triggers

- Push a tag like `v0.1.0` → marketing version becomes `0.1.0`.
- Manual dispatch from the Actions tab → marketing version becomes `0.1.0-dev`.
- Build number is always `${{ github.run_number }}` so it strictly increases.

### One-time Apple setup

1. **App record.** App Store Connect → My Apps → New App. Bundle ID
   `com.obligatoryprayer.app` (must match `project.yml`). Pick a unique SKU.
2. **API key.** App Store Connect → Users and Access → Integrations →
   App Store Connect API → generate a key with **Developer** access. Download the
   `.p8` once (it can't be re-downloaded). Save the **Key ID** and **Issuer ID**.
3. **Distribution certificate.** Apple Developer portal → Certificates →
   create an *iOS Distribution* cert. Install it on your Mac, then export from
   Keychain Access as a `.p12` with a password.
4. **Provisioning profile.** Apple Developer portal → Profiles → create an
   *App Store* profile bound to the bundle ID + the Distribution cert.
   Download the `.mobileprovision`.

### GitHub secrets

In the repo, add the following under Settings → Secrets and variables → Actions:

| Secret | Value |
| --- | --- |
| `APPLE_TEAM_ID` | 10-char team ID (Apple Developer → Membership) |
| `APPSTORE_KEY_ID` | 10-char API Key ID |
| `APPSTORE_ISSUER_ID` | API issuer UUID |
| `APPSTORE_PRIVATE_KEY` | `base64 -i AuthKey_XXXXXXXXXX.p8` |
| `BUILD_CERTIFICATE_BASE64` | `base64 -i Distribution.p12` |
| `P12_PASSWORD` | passphrase you used when exporting the `.p12` |
| `PROVISIONING_PROFILE_BASE64` | `base64 -i ObligatoryPrayer_AppStore.mobileprovision` |
| `KEYCHAIN_PASSWORD` | any string; used only for the ephemeral CI keychain |

On macOS: `base64 -i <file> | pbcopy` puts the encoded payload on your
clipboard; paste it directly into the secret.

### First release

```bash
git tag v0.1.0
git push origin v0.1.0
```

Watch the Actions tab. After ~10–15 minutes the build appears in App Store
Connect → TestFlight → Builds, processes, and is ready for internal testers.

## Tests

```bash
cd ios
xcodebuild -project ObligatoryPrayer.xcodeproj \
  -scheme ObligatoryPrayer \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' test
```

`PrayerStoreTests` covers streak edge cases (empty store, today only,
consecutive days, gap, missing today, multiple same-day, type counts).

## Manual verification checklist

- [ ] Each swipe advances exactly one phrase regardless of flick velocity.
- [ ] Hardware keyboard (simulator: ⌘K to toggle) advances/retreats one phrase.
- [ ] Reaching the final page records a single `PrayerCompletion` even after
      scrolling backward and forward.
- [ ] Light haptic fires on each phrase change; rigid haptic fires once on
      first completion.
- [ ] Home cards, history container, and completion buttons render with glass
      refraction on iOS 26.
- [ ] VoiceOver reads each phrase in order; Dynamic Type up to `.accessibility3`
      stays readable.
