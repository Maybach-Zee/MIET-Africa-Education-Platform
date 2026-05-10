import Foundation

final class LogoutUseCase: Sendable {
    private let repository: any AuthRepositoryProtocol

    init(repository: any AuthRepositoryProtocol) {
        self.repository = repository
    }

    func execute() async throws {
        try await repository.logout()
    }
}
