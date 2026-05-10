import Foundation

final class FetchLearnersUseCase: Sendable {
    private let repository: any LearnersRepositoryProtocol

    init(repository: any LearnersRepositoryProtocol) {
        self.repository = repository
    }

    /// Fetches from network; falls back to local SwiftData cache on failure.
    func execute() async throws -> [LearnerEntity] {
        do {
            return try await repository.fetchAll()
        } catch {
            return try repository.fetchCached()
        }
    }
}
