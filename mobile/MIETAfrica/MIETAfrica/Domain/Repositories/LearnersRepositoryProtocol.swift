import Foundation

protocol LearnersRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [LearnerEntity]
    func fetchCached() throws -> [LearnerEntity]
}
