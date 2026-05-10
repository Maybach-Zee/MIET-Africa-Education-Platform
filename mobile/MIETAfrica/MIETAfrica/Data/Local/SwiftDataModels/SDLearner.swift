import SwiftData
import Foundation

@Model
final class SDLearner {
    @Attribute(.unique) var id: String
    var firstName: String
    var lastName: String
    var email: String
    var enrolledCourseIds: [String]

    init(id: String, firstName: String, lastName: String, email: String, enrolledCourseIds: [String]) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.enrolledCourseIds = enrolledCourseIds
    }

    func toDomain() -> LearnerEntity {
        LearnerEntity(id: id, firstName: firstName, lastName: lastName, email: email, enrolledCourseIds: enrolledCourseIds)
    }

    static func from(_ learner: LearnerEntity) -> SDLearner {
        SDLearner(id: learner.id, firstName: learner.firstName, lastName: learner.lastName, email: learner.email, enrolledCourseIds: learner.enrolledCourseIds)
    }
}
