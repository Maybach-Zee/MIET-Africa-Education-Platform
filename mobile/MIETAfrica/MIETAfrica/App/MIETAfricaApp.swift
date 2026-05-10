import SwiftUI
import SwiftData

@main
struct MIETAfricaApp: App {
    private let diContainer = DIContainer.shared

    var body: some Scene {
        WindowGroup {
            AppCoordinatorView()
                .environment(diContainer.makeAppCoordinator())
        }
        .modelContainer(SwiftDataStack.shared.modelContainer)
    }
}
