import Foundation

struct UserEntity: Identifiable, Equatable, Sendable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String
    let role: UserRole
    let token: String
}

enum UserRole: String, Codable, Sendable {
    case facilitator = "FACILITATOR"
    case admin       = "ADMIN"
    case manager     = "MANAGER"
    case donor       = "DONOR"
}
