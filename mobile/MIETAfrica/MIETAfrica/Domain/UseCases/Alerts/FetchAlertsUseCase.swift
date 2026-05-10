import Foundation

final class FetchAlertsUseCase: Sendable {
    private let repository: any AlertsRepositoryProtocol

    init(repository: any AlertsRepositoryProtocol) {
        self.repository = repository
    }

    /// Fetches from network; falls back to local SwiftData cache on failure.
    func execute() async throws -> [AlertEntity] {
        do {
            return try await repository.fetchAll()
        } catch {
            return try repository.fetchCached()
        }
    }
}
