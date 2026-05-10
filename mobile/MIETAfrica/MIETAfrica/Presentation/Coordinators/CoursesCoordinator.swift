import SwiftUI

@Observable
final class CoursesCoordinator {
    enum Route: Hashable {
        case courseDetail(CourseEntity)
    }

    var path = NavigationPath()
    let container: DIContainer

    init(container: DIContainer) {
        self.container = container
    }

    func navigateToCourseDetail(_ course: CourseEntity) {
        path.append(Route.courseDetail(course))
    }
}

struct CoursesCoordinatorView: View {
    @Environment(CoursesCoordinator.self) private var coordinator

    var body: some View {
        @Bindable var coordinator = coordinator
        NavigationStack(path: $coordinator.path) {
            CoursesView()
                .navigationDestination(for: CoursesCoordinator.Route.self) { route in
                    switch route {
                    case .courseDetail(let course):
                        CourseDetailView(course: course)
                    }
                }
        }
    }
}
