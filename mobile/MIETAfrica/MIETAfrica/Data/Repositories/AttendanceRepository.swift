import Foundation
import SwiftData

final class AttendanceRepository: AttendanceRepositoryProtocol {
    private let apiClient: APIClient
    private let modelContext: ModelContext

    init(apiClient: APIClient, modelContext: ModelContext) {
        self.apiClient = apiClient
        self.modelContext = modelContext
    }

    func fetchAll() async throws -> [AttendanceRecordEntity] {
        let dtos: [AttendanceDTO] = try await apiClient.request(.attendance)
        return dtos.map(Self.map(dto:))
    }

    func record(learnerId: String, courseId: String, date: Date, isPresent: Bool) async throws -> AttendanceRecordEntity {
        let dto: AttendanceDTO = try await apiClient.request(
            .recordAttendance,
            body: RecordAttendanceRequestDTO(learnerId: learnerId, courseId: courseId, date: date, isPresent: isPresent)
        )
        let record = Self.map(dto: dto)
        await cache(record)
        return record
    }

    @MainActor
    private func cache(_ record: AttendanceRecordEntity) {
        modelContext.insert(SDAttendanceRecord.from(record))
        try? modelContext.save()
    }

    /// `notes` is dropped — the domain entity does not surface it yet.
    static func map(dto: AttendanceDTO) -> AttendanceRecordEntity {
        AttendanceRecordEntity(
            id: dto.id,
            learnerId: dto.learnerId,
            courseId: dto.courseId,
            date: dto.date,
            isPresent: dto.isPresent
        )
    }
}
