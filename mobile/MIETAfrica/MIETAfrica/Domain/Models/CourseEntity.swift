import Foundation

struct CourseEntity: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let title: String
    let description: String
    let facilitatorId: String
    let startDate: Date
    let endDate: Date
}
