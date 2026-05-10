import Foundation
import SwiftData

final class LearnersRepository: LearnersRepositoryProtocol {
    private let apiClient: APIClient
    private let modelContext: ModelContext

    init(apiClient: APIClient, modelContext: ModelContext) {
        self.apiClient = apiClient
        self.modelContext = modelContext
    }

    func fetchAll() async throws -> [LearnerEntity] {
        let dtos: [LearnerDTO] = try await apiClient.request(.learners)
        let learners = dtos.map(Self.map(dto:))
        await cache(learners)
        return learners
    }

    func fetchCached() throws -> [LearnerEntity] {
        let descriptor = FetchDescriptor<SDLearner>()
        return try modelContext.fetch(descriptor).map { $0.toDomain() }
    }

    @MainActor
    private func cache(_ learners: [LearnerEntity]) {
        learners.forEach { modelContext.insert(SDLearner.from($0)) }
        try? modelContext.save()
    }

    /// DTO optionals (profilePhotoUrl, attendancePercentage, consecutiveAbsences,
    /// certificateStatus, notes) are not part of the domain entity yet — they're
    /// deliberately dropped here. Add them to LearnerEntity when a use case needs them.
    static func map(dto: LearnerDTO) -> LearnerEntity {
        LearnerEntity(
            id: dto.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            enrolledCourseIds: dto.enrolledCourseIds
        )
    }
}
