import Foundation

final class AuthRepository: AuthRepositoryProtocol {
    private let apiClient: APIClient
    private let keychainService: KeychainService

    init(apiClient: APIClient, keychainService: KeychainService) {
        self.apiClient = apiClient
        self.keychainService = keychainService
    }

    func login(email: String, password: String) async throws -> UserEntity {
        let response: AuthResponseDTO = try await apiClient.request(
            .login,
            body: LoginRequestDTO(email: email, password: password)
        )
        try keychainService.saveToken(response.token)
        return UserEntity(
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            role: UserRole(rawValue: response.role) ?? .facilitator,
            token: response.token
        )
    }

    func logout() async throws {
        let _: EmptyResponseDTO = try await apiClient.request(.logout)
        try keychainService.deleteToken()
    }

    func refreshToken() async throws -> String {
        let response: TokenRefreshResponseDTO = try await apiClient.request(.refreshToken)
        try keychainService.saveToken(response.token)
        return response.token
    }
}
