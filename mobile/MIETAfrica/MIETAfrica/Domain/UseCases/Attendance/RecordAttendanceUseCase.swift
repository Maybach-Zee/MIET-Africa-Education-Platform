import Foundation

final class RecordAttendanceUseCase: Sendable {
    private let repository: any AttendanceRepositoryProtocol

    init(repository: any AttendanceRepositoryProtocol) {
        self.repository = repository
    }

    func execute(learnerId: String, courseId: String, isPresent: Bool) async throws -> AttendanceRecordEntity {
        try await repository.record(learnerId: learnerId, courseId: courseId, date: Date(), isPresent: isPresent)
    }

    func fetchAll() async throws -> [AttendanceRecordEntity] {
        try await repository.fetchAll()
    }
}
