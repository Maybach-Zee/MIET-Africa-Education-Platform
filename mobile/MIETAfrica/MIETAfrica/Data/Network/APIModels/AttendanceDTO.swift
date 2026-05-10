import Foundation

struct AttendanceDTO: Decodable {
    let id: String
    let learnerId: String
    let courseId: String
    let date: Date
    let isPresent: Bool
    let notes: String?
}

struct RecordAttendanceRequestDTO: Encodable {
    let learnerId: String
    let courseId: String
    let date: Date
    let isPresent: Bool
}
