import Foundation

final class MockCoursesRepository: CoursesRepositoryProtocol {
    func fetchAll() async throws -> [CourseEntity] {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        let dtos = try MockJSONLoader.load("courses", as: [CourseDTO].self)
        return try dtos.map(CoursesRepository.map(dto:))
    }

    func fetchCached() throws -> [CourseEntity] {
        let dtos = try MockJSONLoader.load("courses", as: [CourseDTO].self)
        return try dtos.map(CoursesRepository.map(dto:))
    }
}
