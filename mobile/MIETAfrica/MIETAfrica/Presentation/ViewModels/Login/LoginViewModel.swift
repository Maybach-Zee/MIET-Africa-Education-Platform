import Foundation

@Observable
final class LoginViewModel {
    var email: String = ""
    var password: String = ""
    var isLoading: Bool = false
    var errorMessage: String? = nil

    var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty
    }

    private let loginUseCase: LoginUseCase

    init(loginUseCase: LoginUseCase = DIContainer.shared.makeLoginUseCase()) {
        self.loginUseCase = loginUseCase
    }

    func login(coordinator: LoginCoordinator) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await loginUseCase.execute(email: email, password: password)
            coordinator.didCompleteLogin()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
