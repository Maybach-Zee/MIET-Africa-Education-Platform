import SwiftData
import Foundation

@Model
final class SDAttendanceRecord {
    @Attribute(.unique) var id: String
    var learnerId: String
    var courseId: String
    var date: Date
    var isPresent: Bool

    init(id: String, learnerId: String, courseId: String, date: Date, isPresent: Bool) {
        self.id = id
        self.learnerId = learnerId
        self.courseId = courseId
        self.date = date
        self.isPresent = isPresent
    }

    func toDomain() -> AttendanceRecordEntity {
        AttendanceRecordEntity(id: id, learnerId: learnerId, courseId: courseId, date: date, isPresent: isPresent)
    }

    static func from(_ record: AttendanceRecordEntity) -> SDAttendanceRecord {
        SDAttendanceRecord(id: record.id, learnerId: record.learnerId, courseId: record.courseId, date: record.date, isPresent: record.isPresent)
    }
}
