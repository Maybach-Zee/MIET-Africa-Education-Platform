import SwiftData
import Foundation

/// Centralised SwiftData stack. Access via `SwiftDataStack.shared`.
final class SwiftDataStack {
    static let shared = SwiftDataStack()

    let modelContainer: ModelContainer

    /// Main-actor context for use on the main thread (Views, ViewModels).
    @MainActor
    var mainContext: ModelContext { modelContainer.mainContext }

    private init() {
        let schema = Schema([
            SDCourse.self,
            SDAttendanceRecord.self,
            SDLearner.self,
            SDAlert.self
        ])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            modelContainer = try ModelContainer(for: schema, configurations: config)
        } catch {
            fatalError("SwiftData ModelContainer failed to initialise: \(error)")
        }
    }
}
