import Foundation

/// Wire shape for an alert. `message` may be missing for terse system events;
/// the mapper in AlertsRepository defaults it to an empty string.
struct AlertDTO: Decodable {
    let id: String
    let title: String
    let message: String?
    let severity: String
    let createdAt: Date
}
