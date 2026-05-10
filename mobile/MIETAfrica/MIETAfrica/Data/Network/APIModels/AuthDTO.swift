import Foundation

struct LoginRequestDTO: Encodable {
    let email: String
    let password: String
}

/// Auth payload returned by `POST /auth/login` and consumed by the mock auth.json fixture.
struct AuthResponseDTO: Decodable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let role: String
    let token: String
    let profilePhotoUrl: String?
}

struct TokenRefreshResponseDTO: Decodable {
    let token: String
}

struct EmptyResponseDTO: Decodable {}
