import Foundation

final class MockAttendanceRepository: AttendanceRepositoryProtocol {
    func fetchAll() async throws -> [AttendanceRecordEntity] {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        let dtos = try MockJSONLoader.load("attendance", as: [AttendanceDTO].self)
        return dtos.map(AttendanceRepository.map(dto:))
    }

    func record(learnerId: String, courseId: String, date: Date, isPresent: Bool) async throws -> AttendanceRecordEntity {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        return AttendanceRecordEntity(
            id: "att-mock-\(UUID().uuidString.prefix(8))",
            learnerId: learnerId,
            courseId: courseId,
            date: date,
            isPresent: isPresent
        )
    }
}
