import Foundation

protocol AlertsRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [AlertEntity]
    func fetchCached() throws -> [AlertEntity]
}
