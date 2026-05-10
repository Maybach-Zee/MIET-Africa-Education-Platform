import Foundation

struct LearnerEntity: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let firstName: String
    let lastName: String
    let email: String
    let enrolledCourseIds: [String]
}
