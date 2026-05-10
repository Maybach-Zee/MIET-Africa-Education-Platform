import Foundation

protocol CoursesRepositoryProtocol: Sendable {
    func fetchAll() async throws -> [CourseEntity]
    func fetchCached() throws -> [CourseEntity]
}
