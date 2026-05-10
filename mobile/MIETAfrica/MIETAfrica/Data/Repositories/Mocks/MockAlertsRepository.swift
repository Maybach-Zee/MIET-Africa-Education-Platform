import Foundation

final class MockAlertsRepository: AlertsRepositoryProtocol {
    func fetchAll() async throws -> [AlertEntity] {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        let dtos = try MockJSONLoader.load("alerts", as: [AlertDTO].self)
        return dtos.map(AlertsRepository.map(dto:))
    }

    func fetchCached() throws -> [AlertEntity] {
        let dtos = try MockJSONLoader.load("alerts", as: [AlertDTO].self)
        return dtos.map(AlertsRepository.map(dto:))
    }
}
