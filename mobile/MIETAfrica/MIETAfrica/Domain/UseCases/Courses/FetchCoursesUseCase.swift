import Foundation

final class FetchCoursesUseCase: Sendable {
    private let repository: any CoursesRepositoryProtocol

    init(repository: any CoursesRepositoryProtocol) {
        self.repository = repository
    }

    /// Fetches from network; falls back to local SwiftData cache on failure.
    func execute() async throws -> [CourseEntity] {
        do {
            return try await repository.fetchAll()
        } catch {
            return try repository.fetchCached()
        }
    }
}
