import Foundation

@Observable
final class AlertsViewModel {
    var alerts: [AlertEntity] = []
    var learners: [LearnerEntity] = []
    var badges: [String: AttendanceBadge] = [:]
    var isLoading: Bool = false
    var showError: Bool = false
    var errorMessage: String? = nil

    /// Learners flagged amber or red — the at-risk cohort the Alerts tab surfaces.
    var flaggedLearners: [LearnerEntity] {
        learners.filter { (badges[$0.id] ?? .green) != .green }
    }

    private let fetchAlertsUseCase: FetchAlertsUseCase
    private let fetchLearnersUseCase: FetchLearnersUseCase
    private let fetchAttendanceUseCase: FetchAttendanceUseCase

    init(
        fetchAlertsUseCase: FetchAlertsUseCase = DIContainer.shared.makeFetchAlertsUseCase(),
        fetchLearnersUseCase: FetchLearnersUseCase = DIContainer.shared.makeFetchLearnersUseCase(),
        fetchAttendanceUseCase: FetchAttendanceUseCase = DIContainer.shared.makeFetchAttendanceUseCase()
    ) {
        self.fetchAlertsUseCase = fetchAlertsUseCase
        self.fetchLearnersUseCase = fetchLearnersUseCase
        self.fetchAttendanceUseCase = fetchAttendanceUseCase
    }

    func fetchAlerts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            async let alertsTask = fetchAlertsUseCase.execute()
            async let learnersTask = fetchLearnersUseCase.execute()
            async let attendanceTask = fetchAttendanceUseCase.execute()
            let (loadedAlerts, loadedLearners, loadedAttendance) =
                try await (alertsTask, learnersTask, attendanceTask)
            self.alerts = loadedAlerts
            self.learners = loadedLearners
            self.badges = AttendanceThresholdRule.badges(learners: loadedLearners, attendance: loadedAttendance)
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
