import Foundation

struct AlertEntity: Identifiable, Equatable, Hashable, Sendable {
    let id: String
    let title: String
    let message: String
    let severity: AlertSeverity
    let createdAt: Date
}

enum AlertSeverity: String, Codable, Sendable {
    case info
    case warning
    case critical
}
