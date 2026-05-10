import Foundation

final class LoginUseCase: Sendable {
    private let repository: any AuthRepositoryProtocol

    init(repository: any AuthRepositoryProtocol) {
        self.repository = repository
    }

    func execute(email: String, password: String) async throws {
        _ = try await repository.login(email: email, password: password)
    }
}
