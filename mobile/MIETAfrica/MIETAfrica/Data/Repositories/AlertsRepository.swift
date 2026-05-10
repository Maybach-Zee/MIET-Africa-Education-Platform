import Foundation
import SwiftData

final class AlertsRepository: AlertsRepositoryProtocol {
    private let apiClient: APIClient
    private let modelContext: ModelContext

    init(apiClient: APIClient, modelContext: ModelContext) {
        self.apiClient = apiClient
        self.modelContext = modelContext
    }

    func fetchAll() async throws -> [AlertEntity] {
        let dtos: [AlertDTO] = try await apiClient.request(.alerts)
        let alerts = dtos.map(Self.map(dto:))
        await cache(alerts)
        return alerts
    }

    func fetchCached() throws -> [AlertEntity] {
        let descriptor = FetchDescriptor<SDAlert>()
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }

    @MainActor
    private func cache(_ alerts: [AlertEntity]) {
        alerts.forEach { modelContext.insert(SDAlert.from($0)) }
        try? modelContext.save()
    }

    /// `message` may be missing for terse system events — default to empty string so
    /// the ViewModel receives a non-optional. Unknown severity falls back to `.info`.
    static func map(dto: AlertDTO) -> AlertEntity {
        AlertEntity(
            id: dto.id,
            title: dto.title,
            message: dto.message ?? "",
            severity: AlertSeverity(rawValue: dto.severity) ?? .info,
            createdAt: dto.createdAt
        )
    }
}
