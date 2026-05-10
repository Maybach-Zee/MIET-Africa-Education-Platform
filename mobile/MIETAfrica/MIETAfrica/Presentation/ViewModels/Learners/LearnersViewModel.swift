import Foundation

@Observable
final class LearnersViewModel {
    var learners: [LearnerEntity] = []
    var badges: [String: AttendanceBadge] = [:]
    var searchQuery: String = ""
    var isLoading: Bool = false
    var showError: Bool = false
    var errorMessage: String? = nil

    var filteredLearners: [LearnerEntity] {
        guard !searchQuery.isEmpty else { return learners }
        return learners.filter {
            $0.firstName.localizedCaseInsensitiveContains(searchQuery) ||
            $0.lastName.localizedCaseInsensitiveContains(searchQuery) ||
            $0.email.localizedCaseInsensitiveContains(searchQuery)
        }
    }

    private let fetchLearnersUseCase: FetchLearnersUseCase
    private let fetchAttendanceUseCase: FetchAttendanceUseCase

    init(
        fetchLearnersUseCase: FetchLearnersUseCase = DIContainer.shared.makeFetchLearnersUseCase(),
        fetchAttendanceUseCase: FetchAttendanceUseCase = DIContainer.shared.makeFetchAttendanceUseCase()
    ) {
        self.fetchLearnersUseCase = fetchLearnersUseCase
        self.fetchAttendanceUseCase = fetchAttendanceUseCase
    }

    func fetchLearners() async {
        isLoading = true
        defer { isLoading = false }

        do {
            async let learnersTask = fetchLearnersUseCase.execute()
            async let attendanceTask = fetchAttendanceUseCase.execute()
            let (loadedLearners, loadedAttendance) = try await (learnersTask, attendanceTask)
            self.learners = loadedLearners
            self.badges = AttendanceThresholdRule.badges(learners: loadedLearners, attendance: loadedAttendance)
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
