import Foundation

protocol AuthRepositoryProtocol: Sendable {
    func login(email: String, password: String) async throws -> UserEntity
    func logout() async throws
    func refreshToken() async throws -> String
}
