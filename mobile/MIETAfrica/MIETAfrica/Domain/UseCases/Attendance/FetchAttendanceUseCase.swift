import Foundation

final class FetchAttendanceUseCase: Sendable {
    private let repository: any AttendanceRepositoryProtocol

    init(repository: any AttendanceRepositoryProtocol) {
        self.repository = repository
    }

    func execute() async throws -> [AttendanceRecordEntity] {
        try await repository.fetchAll()
    }
}
