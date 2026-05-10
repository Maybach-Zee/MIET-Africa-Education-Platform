import SwiftUI

@Observable
final class AttendanceCoordinator {
    enum Route: Hashable {
        case recordAttendance(String) // courseId
    }

    var path = NavigationPath()
    let container: DIContainer

    init(container: DIContainer) {
        self.container = container
    }

    func navigateToRecordAttendance(for courseId: String) {
        path.append(Route.recordAttendance(courseId))
    }
}

struct AttendanceCoordinatorView: View {
    @Environment(AttendanceCoordinator.self) private var coordinator

    var body: some View {
        @Bindable var coordinator = coordinator
        NavigationStack(path: $coordinator.path) {
            AttendanceView()
                .navigationDestination(for: AttendanceCoordinator.Route.self) { route in
                    switch route {
                    case .recordAttendance(let courseId):
                        Text("Record AttendanceRecordEntity for \(courseId)") // Replace with view
                    }
                }
        }
    }
}
