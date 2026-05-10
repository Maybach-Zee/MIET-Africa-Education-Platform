import Foundation

/// Wire shape for a learner. Photo and aggregate metrics may be missing for
/// new enrolments; mappers default them in LearnersRepository.
struct LearnerDTO: Decodable {
    let id: String
    let firstName: String
    let lastName: String
    let email: String
    let enrolledCourseIds: [String]
    let profilePhotoUrl: String?
    let attendancePercentage: Double?
    let consecutiveAbsences: Int?
    let certificateStatus: String?
    let notes: String?
}
