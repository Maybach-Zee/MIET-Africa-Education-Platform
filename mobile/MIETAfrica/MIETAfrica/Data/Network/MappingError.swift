import Foundation

/// Thrown by repository mappers when a DTO is missing a field the domain entity requires
/// and no safe default exists.
enum MappingError: LocalizedError {
    case missingRequiredField(entity: String, field: String, id: String)

    var errorDescription: String? {
        switch self {
        case .missingRequiredField(let entity, let field, let id):
            return "Missing required field '\(field)' on \(entity) (id=\(id))."
        }
    }
}
