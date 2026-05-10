import Foundation
import SwiftData

final class CoursesRepository: CoursesRepositoryProtocol {
    private let apiClient: APIClient
    private let modelContext: ModelContext

    init(apiClient: APIClient, modelContext: ModelContext) {
        self.apiClient = apiClient
        self.modelContext = modelContext
    }

    func fetchAll() async throws -> [CourseEntity] {
        let dtos: [CourseDTO] = try await apiClient.request(.courses)
        let courses = try dtos.map(Self.map(dto:))
        await cache(courses)
        return courses
    }

    func fetchCached() throws -> [CourseEntity] {
        let descriptor = FetchDescriptor<SDCourse>()
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }

    @MainActor
    private func cache(_ courses: [CourseEntity]) {
        courses.forEach { modelContext.insert(SDCourse.from($0)) }
        try? modelContext.save()
    }

    /// Mapper resolves every DTO optional before handing the entity to the use case.
    /// `description` defaults to empty string. `endDate` is required by the domain and
    /// has no safe default (current date is wrong, startDate produces a zero-duration
    /// course) — so we throw and let the caller surface it.
    static func map(dto: CourseDTO) throws -> CourseEntity {
        guard let endDate = dto.endDate else {
            throw MappingError.missingRequiredField(entity: "Course", field: "endDate", id: dto.id)
        }
        return CourseEntity(
            id: dto.id,
            title: dto.title,
            description: dto.description ?? "",
            facilitatorId: dto.facilitatorId,
            startDate: dto.startDate,
            endDate: endDate
        )
    }
}
