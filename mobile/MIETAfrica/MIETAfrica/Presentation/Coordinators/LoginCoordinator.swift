import SwiftUI

@Observable
final class LoginCoordinator {
    enum Route: Hashable {
        case forgotPassword
    }

    var path = NavigationPath()
    private let appCoordinator: AppCoordinator
    let container: DIContainer

    init(appCoordinator: AppCoordinator, container: DIContainer) {
        self.appCoordinator = appCoordinator
        self.container = container
    }

    func navigateToForgotPassword() {
        path.append(Route.forgotPassword)
    }

    func didCompleteLogin() {
        appCoordinator.didLogin()
    }
}

struct LoginCoordinatorView: View {
    @Environment(LoginCoordinator.self) private var coordinator

    var body: some View {
        @Bindable var coordinator = coordinator
        NavigationStack(path: $coordinator.path) {
            LoginView()
                .navigationDestination(for: LoginCoordinator.Route.self) { route in
                    switch route {
                    case .forgotPassword:
                        Text("Forgot Password") // Replace with ForgotPasswordView
                    }
                }
        }
    }
}
