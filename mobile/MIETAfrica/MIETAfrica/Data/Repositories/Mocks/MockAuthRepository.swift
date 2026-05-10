import Foundation

final class MockAuthRepository: AuthRepositoryProtocol {
    private let keychainService: KeychainService

    init(keychainService: KeychainService) {
        self.keychainService = keychainService
    }

    func login(email: String, password: String) async throws -> UserEntity {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        let dto = try MockJSONLoader.load("auth", as: AuthResponseDTO.self)
        try keychainService.saveToken(dto.token)
        return UserEntity(
            id: dto.id,
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: UserRole(rawValue: dto.role) ?? .facilitator,
            token: dto.token
        )
    }

    func logout() async throws {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        try keychainService.deleteToken()
    }

    func refreshToken() async throws -> String {
        try await Task.sleep(for: MockJSONLoader.mockDelay)
        let dto = try MockJSONLoader.load("auth", as: AuthResponseDTO.self)
        try keychainService.saveToken(dto.token)
        return dto.token
    }
}
