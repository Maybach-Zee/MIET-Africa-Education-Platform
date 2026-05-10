import Foundation

/// Wire shape for a course. `description` and `endDate` may be nil for in-progress
/// or open-ended programmes; mappers default them in CoursesRepository.
struct CourseDTO: Decodable {
    let id: String
    let title: String
    let description: String?
    let facilitatorId: String
    let startDate: Date
    let endDate: Date?
    let topic: String?
    let notes: String?
}
