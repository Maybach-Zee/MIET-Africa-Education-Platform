import SwiftUI

/// Root coordinator. Owns authentication state and switches between Login and Main flows.
@Observable
final class AppCoordinator {
    var isAuthenticated: Bool
    let container: DIContainer

    init(container: DIContainer) {
        self.container = container
        let storedToken = try? container.keychainService.getToken()
        self.isAuthenticated = (storedToken?.isEmpty == false)
    }

    func didLogin() {
        isAuthenticated = true
    }

    func didLogout() {
        isAuthenticated = false
    }
}

struct AppCoordinatorView: View {
    @Environment(AppCoordinator.self) private var coordinator

    var body: some View {
        if coordinator.isAuthenticated {
            MainTabView()
                .environment(coordinator.container.makeCoursesCoordinator())
                .environment(coordinator.container.makeAttendanceCoordinator())
                .environment(coordinator.container.makeLearnersCoordinator())
                .environment(coordinator.container.makeAlertsCoordinator())
        } else {
            LoginCoordinatorView()
                .environment(
                    coordinator.container.makeLoginCoordinator(appCoordinator: coordinator)
                )
        }
    }
}

private struct MainTabView: View {
    var body: some View {
        TabView {
            CoursesCoordinatorView()
                .tabItem { Label("Courses", systemImage: "book.fill") }

            AttendanceCoordinatorView()
                .tabItem { Label("Attendance", systemImage: "checkmark.circle.fill") }

            LearnersCoordinatorView()
                .tabItem { Label("Learners", systemImage: "person.2.fill") }

            AlertsCoordinatorView()
                .tabItem { Label("Alerts", systemImage: "bell.fill") }
        }
    }
}
