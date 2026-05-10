import SwiftUI

@Observable
final class AlertsCoordinator {
    enum Route: Hashable {
        case alertDetail(AlertEntity)
    }

    var path = NavigationPath()
    let container: DIContainer

    init(container: DIContainer) {
        self.container = container
    }

    func navigateToAlertDetail(_ alert: AlertEntity) {
        path.append(Route.alertDetail(alert))
    }
}

struct AlertsCoordinatorView: View {
    @Environment(AlertsCoordinator.self) private var coordinator

    var body: some View {
        @Bindable var coordinator = coordinator
        NavigationStack(path: $coordinator.path) {
            AlertsView()
                .navigationDestination(for: AlertsCoordinator.Route.self) { route in
                    switch route {
                    case .alertDetail(let alert):
                        Text(alert.title) // Replace with AlertDetailView
                    }
                }
        }
    }
}
