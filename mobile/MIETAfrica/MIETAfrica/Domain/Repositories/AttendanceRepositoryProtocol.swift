import Foundation

protocol AttendanceRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [AttendanceRecordEntity]
    func record(learnerId: String, courseId: String, date: Date, isPresent: Bool) async throws -> AttendanceRecordEntity
}
