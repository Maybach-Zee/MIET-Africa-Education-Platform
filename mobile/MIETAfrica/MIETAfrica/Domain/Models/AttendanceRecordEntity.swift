import Foundation

struct AttendanceRecordEntity: Identifiable, Equatable, Sendable {
    let id: String
    let learnerId: String
    let courseId: String
    let date: Date
    let isPresent: Bool
}
