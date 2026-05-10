import SwiftData
import Foundation

@Model
final class SDCourse {
    @Attribute(.unique) var id: String
    var title: String
    var courseDescription: String
    var facilitatorId: String
    var startDate: Date
    var endDate: Date

    init(id: String, title: String, description: String, facilitatorId: String, startDate: Date, endDate: Date) {
        self.id = id
        self.title = title
        self.courseDescription = description
        self.facilitatorId = facilitatorId
        self.startDate = startDate
        self.endDate = endDate
    }

    func toDomain() -> CourseEntity {
        CourseEntity(id: id, title: title, description: courseDescription, facilitatorId: facilitatorId, startDate: startDate, endDate: endDate)
    }

    static func from(_ course: CourseEntity) -> SDCourse {
        SDCourse(id: course.id, title: course.title, description: course.description, facilitatorId: course.facilitatorId, startDate: course.startDate, endDate: course.endDate)
    }
}
