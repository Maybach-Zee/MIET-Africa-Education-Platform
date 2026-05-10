import Foundation

final class MockLearnersRepository: LearnersRepositoryProtocol {
    func fetchAll() async throws -> [LearnerEntity] {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        let dtos = try MockJSONLoader.load("learners", as: [LearnerDTO].self)
        return dtos.map(LearnersRepository.map(dto:))
    }

    func fetchCached() throws -> [LearnerEntity] {
        let dtos = try MockJSONLoader.load("learners", as: [LearnerDTO].self)
        return dtos.map(LearnersRepository.map(dto:))
    }
}
