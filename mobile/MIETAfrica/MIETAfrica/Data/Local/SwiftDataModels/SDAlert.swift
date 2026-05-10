import SwiftData
import Foundation

@Model
final class SDAlert {
    @Attribute(.unique) var id: String
    var title: String
    var message: String
    var severity: String
    var createdAt: Date

    init(id: String, title: String, message: String, severity: String, createdAt: Date) {
        self.id = id
        self.title = title
        self.message = message
        self.severity = severity
        self.createdAt = createdAt
    }

    func toDomain() -> AlertEntity {
        AlertEntity(
            id: id,
            title: title,
            message: message,
            severity: AlertSeverity(rawValue: severity) ?? .info,
            createdAt: createdAt
        )
    }

    static func from(_ alert: AlertEntity) -> SDAlert {
        SDAlert(id: alert.id, title: alert.title, message: alert.message, severity: alert.severity.rawValue, createdAt: alert.createdAt)
    }
}
