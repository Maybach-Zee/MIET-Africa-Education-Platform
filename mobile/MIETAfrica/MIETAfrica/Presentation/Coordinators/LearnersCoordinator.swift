import SwiftUI

@Observable
final class LearnersCoordinator {
    enum Route: Hashable {
        case learnerDetail(LearnerEntity)
    }

    var path = NavigationPath()
    let container: DIContainer

    init(container: DIContainer) {
        self.container = container
    }

    func navigateToLearnerDetail(_ learner: LearnerEntity) {
        path.append(Route.learnerDetail(learner))
    }
}

struct LearnersCoordinatorView: View {
    @Environment(LearnersCoordinator.self) private var coordinator

    var body: some View {
        @Bindable var coordinator = coordinator
        NavigationStack(path: $coordinator.path) {
            LearnersView()
                .navigationDestination(for: LearnersCoordinator.Route.self) { route in
                    switch route {
                    case .learnerDetail(let learner):
                        LearnerDetailView(learner: learner)
                    }
                }
        }
    }
}
